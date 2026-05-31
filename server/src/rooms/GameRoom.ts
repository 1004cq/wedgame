import { Room, Client } from "colyseus";
import { GameState } from "../schema/GameState";
import { Player } from "../schema/Player";
import { register, login, verifyToken } from "../auth";

export class GameRoom extends Room<GameState> {
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
      }
    });

    // Shooting with distance-based damage falloff (和平精英风格)
    this.onMessage("shoot", (client, data) => {
      const shooter = this.state.players.get(client.sessionId);
      if (!shooter || shooter.isDead) return;

      const target = this.state.players.get(data.targetId);
      if (target && !target.isDead) {
        // 计算距离
        const dx = shooter.x - target.x;
        const dz = shooter.z - target.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        let damage = data.damage || 25;

        // 距离衰减（类似和平精英）
        const falloffStart = 25;   // 开始衰减距离
        const maxFalloff = 80;     // 最大衰减距离

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
    console.log(`${username} joined the game`);
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
  }
}
