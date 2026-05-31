import { Schema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("string") name: string = "Player";
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") z: number = 0;
  @type("number") rotationY: number = 0;

  // Health System
  @type("number") health: number = 100;
  @type("number") maxHealth: number = 100;
  @type("boolean") isDead: boolean = false;
}
