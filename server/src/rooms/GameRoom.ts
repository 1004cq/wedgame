import { Room, Client } from "colyseus";
import { GameState } from "../schema/GameState";  // We'll create this next if needed

import { Player } from "../schema/Player";

export class GameRoom extends Room {
  onCreate(options: any) {
    console.log("GameRoom created!");

    // Set initial state
    this.setState(new GameState());

    // Handle movement input from clients
    this.onMessage("move", (client: Client, data: any) => {
      const player = this.state.players.get(client.sessionId);
      if (player && !player.isDead) {
        // Simple server-side movement (can be expanded with physics later)
        if (data.dx !== undefined) player.x += data.dx;
        if (data.dz !== undefined) player.z += data.dz;
        if (data.rotationY !== undefined) player.rotationY = data.rotationY;
      }
    });

    // Handle shooting / damage (basic version)
    this.onMessage("shoot", (client: Client, data: any) => {
      const shooter = this.state.players.get(client.sessionId);
      if (!shooter || shooter.isDead) return;

      const target = this.state.players.get(data.targetId);
      if (target && !target.isDead) {
        // Authoritative damage
        target.health = Math.max(0, target.health - (data.damage || 25));

        if (target.health <= 0) {
          target.isDead = true;
          this.broadcast("playerDied", {
            killerId: client.sessionId,
            victimId: data.targetId
          });
        }
      }
    });
  }

  onJoin(client: Client, options: any) {
    console.log(`${client.sessionId} joined!`);

    const player = new Player();
    player.name = options.name || `Player_${client.sessionId.substring(0, 4)}`;
    player.x = Math.random() * 10 - 5;
    player.z = Math.random() * 10 - 5;

    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(`${client.sessionId} left.`);
    this.state.players.delete(client.sessionId);
  }
}
