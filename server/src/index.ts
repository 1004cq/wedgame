import { Server } from "colyseus";
import { GameRoom } from "./rooms/GameRoom";

import http from "http";

const port = process.env.PORT || 2567;

const gameServer = new Server({
  server: http.createServer(),
});

gameServer.define("game", GameRoom);

gameServer.listen(port);

console.log(`✅ Colyseus server running on ws://localhost:${port}`);
