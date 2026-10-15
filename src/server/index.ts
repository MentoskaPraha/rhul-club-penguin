import { defineServer, defineRoom } from "colyseus";
import { GameRoom } from "@server/GameRoom";

const server = defineServer({
  rooms: {
    game: defineRoom(GameRoom),
  },
});
export default server;
