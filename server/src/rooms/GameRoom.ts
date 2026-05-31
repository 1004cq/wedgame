import { Room, Client } from "colyseus";
import { GameState } from "../schema/GameState";
import { Player } from "../schema/Player";
import { register, login, verifyToken } from "../auth";

// Position history record for Lag Compensation
export interface PositionRecord {
  x: number;
  z: number;
  timestamp: number;
}

export class GameRoom extends Room<GameState> {
  // Store recent position history for each player (for future Lag Compensation)
  private positionHistory: Map<string, PositionRecord[]> = new Map();

  onCreate() {
    this.setState(new GameState());
    this.setPatchRate(20);

    this.onMessage("register", async (client, data) => {
      const result = await register(data.username, data.password);
      client.send("authResult", result);
    });

    this.onMessage("login", async (client, data) => {
      const result = await login(data.username, data.password);
      if (result.success && result.token) {
        (client as any).authToken = result.token;
        (client as any).username = result.user?.username;
      }
      client.send("authResult", result);
    });

    this.onMessage("move", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player && !player.isDead) {
        if (data.dx !== undefined) player.x += data.dx;
        if (data.dz !== undefined) player.z += data.dz;
        if (data.rotationY !== undefined) player.rotationY = data.rotationY;

        // Record position for Lag Compensation
        this.recordPosition(client.sessionId, player.x, player.z);
      }
    });

    // Shooting with distance-based damage falloff
    this.onMessage("shoot", (client, data) => {
      const shooter = this.state.players.get(client.sessionId);
      if (!shooter || shooter.isDead) return;

      const target = this.state.players.get(data.targetId);
      if (target && !target.isDead) {
        // TODO: Add Lag Compensation here using positionHistory
        const dx = shooter.x - target.x;
        const dz = shooter.z - target.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        let damage = data.damage || 25;

        // Distance falloff (Peace Elite style)
        const falloffStart = 25;
        const maxFalloff = 80;

        if (distance > falloffStart) {
          const falloffRatio = (distance - falloffStart) / (maxFalloff - falloffStart);
          const falloffFactor = Math.max(0.35, 1 - falloffRatio * 0.65);
          damage = damage * falloffFactor;
        }

        target.health = Math.max(0, target.health - damage);

        console.log(`[HIT] ${shooter.name} → ${target.name} | ${damage.toFixed(1)} dmg @ ${distance.toFixed(1)}m`);

        if (target.health <= 0 && !target.isDead) {
          target.isDead = true;
          this.broadcast("playerDied", {
            killerId: client.sessionId,
            victimId: data.targetId
          });
        }
      }
    });
  }

  private recordPosition(sessionId: string, x: number, z: number) {
    if (!this.positionHistory.has(sessionId)) {
      this.positionHistory.set(sessionId, []);
    }

    const history = this.positionHistory.get(sessionId)!;
    history.push({ x, z, timestamp: Date.now() });

    // Keep only last ~300ms of history
    const cutoff = Date.now() - 300;
    while (history.length > 0 && history[0].timestamp < cutoff) {
      history.shift();
    }
  }

  async onJoin(client: Client, options: any) {
    let username = options.username || `Guest_${client.sessionId.substring(0, 6)}`;

    if (options.token) {
      const verification = verifyToken(options.token);
      if (verification.valid && verification.username) {
        username = verification.username;
      }
    }

    const player = new Player();
    player.name = username;
    player.x = Math.random() * 20 - 10;
    player.z = Math.random() * 20 - 10;

    this.state.players.set(client.sessionId, player);
    this.positionHistory.set(client.sessionId, []);

    console.log(`${username} joined the game`);
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
    this.positionHistory.delete(client.sessionId);
  }
}
