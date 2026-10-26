import { Room, Client } from "colyseus";
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
  }

  step() {
    this.state.players.forEach((player, sessionId) => {
      const cmd = this.inputs.get(sessionId).next();
      if (cmd) applyInput(player, cmd);
    });
  }

  onJoin(client: Client) {
    console.log("Joined!", {
      roomId: this.roomId,
      sessionId: client.sessionId,
    });

    const player = new Player();
    player.x = Math.random() * this.state.mapWidth;
    player.y = Math.random() * this.state.mapHeight;

    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client) {
    console.log("Left!", { roomId: this.roomId, sessionId: client.sessionId });
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("Disposing room", this.roomId, "...");
  }
}
