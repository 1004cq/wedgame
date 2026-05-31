import { Room, Client } from "colyseus";
import { GameState } from "../schema/GameState";
import { Player } from "../schema/Player";
import { register, login, verifyToken } from "../auth";

export class GameRoom extends Room<GameState> {
  onCreate() {
    this.setState(new GameState());

    // Register new account
    this.onMessage("register", async (client, data) => {
      const result = await register(data.username, data.password);
      client.send("authResult", result);
    });

    // Login
    this.onMessage("login", async (client, data) => {
      const result = await login(data.username, data.password);
      if (result.success && result.token) {
        (client as any).authToken = result.token;
        (client as any).username = result.user?.username;
      }
      client.send("authResult", result);
    });

    // Movement
    this.onMessage("move", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player && !player.isDead) {
        if (data.dx !== undefined) player.x += data.dx;
        if (data.dz !== undefined) player.z += data.dz;
        if (data.rotationY !== undefined) player.rotationY = data.rotationY;
      }
    });

    // Shooting with health damage
    this.onMessage("shoot", (client, data) => {
      const shooter = this.state.players.get(client.sessionId);
      if (!shooter || shooter.isDead) return;

      const target = this.state.players.get(data.targetId);
      if (target && !target.isDead) {
        target.health = Math.max(0, target.health - (data.damage || 25));

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

    // Verify token if provided (from login)
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
