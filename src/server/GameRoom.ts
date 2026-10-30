import { Room, Client, logger } from "colyseus";
import { schema, SchemaType, t } from "@colyseus/schema";
import { GameMapWidth, GameMapHeight } from "@common/constants";
import { applyInput, MoveInput } from "@common/GameInput";

export const Player = schema(
  {
    x: t.number(),
    y: t.number(),
  },
  "Player",
);
export type Player = SchemaType<typeof Player>;

export const GameRoomState = schema(
  {
    mapWidth: t.number().default(GameMapWidth),
    mapHeight: t.number().default(GameMapHeight),
    players: t.map(Player),
  },
  "GameRoomState",
);
export type GameRoomState = SchemaType<typeof GameRoomState>;

export class GameRoom extends Room {
  state = new GameRoomState();

  inputs = this.defineInput(MoveInput, { bufferMaxSize: 64 });

  onCreate() {
    this.setFixedTimestep(() => this.step(), 30);
    logger.info(`GameRoom(${this.roomId}) created.`);
  }

  step() {
    this.state.players.forEach((player, sessionId) => {
      const cmd = this.inputs.get(sessionId).next();
      if (cmd) applyInput(player, cmd);
    });
  }

  onJoin(client: Client) {
    logger.debug(
      `Client(${client.sessionId}) is joining GameRoom(${this.roomId})...`,
    );

    const player = new Player();
    player.x = Math.random() * this.state.mapWidth;
    player.y = Math.random() * this.state.mapHeight;

    this.state.players.set(client.sessionId, player);
    logger.info(`Client(${client.sessionId}) joined GameRoom(${this.roomId}).`);
  }

  onLeave(client: Client) {
    logger.debug(
      `Client(${client.sessionId}) is leaving GameRoom(${this.roomId})...`,
    );
    this.state.players.delete(client.sessionId);
    logger.info(`Client(${client.sessionId}) joined GameRoom(${this.roomId}).`);
  }

  onDispose() {
    logger.info(`GameRoom(${this.roomId}) disposed.`);
  }
}
