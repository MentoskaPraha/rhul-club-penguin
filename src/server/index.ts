import { defineServer, defineRoom } from "colyseus";
import { GameRoom } from "@server/GameRoom";
import pino from "pino";

const server = defineServer({
  rooms: {
    game: defineRoom(GameRoom),
  },
  logger: pino(
    {
      name: "server",
      level: process.env.NODE_ENV == "production" ? "info" : "trace",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      },
    },
    pino.multistream([
      { level: "debug", stream: process.stdout },
      { level: "error", stream: process.stderr },
      { level: "fatal", stream: process.stderr },
    ]),
  ),
});
export default server;
