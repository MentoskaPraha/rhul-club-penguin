import { Room, Client, CloseCode } from "colyseus";
import { schema, SchemaType, t } from "@colyseus/schema";
import {
  FixedTimestep,
  Velocity,
  GameMapWidth,
  GameMapHeight,
} from "@common/constants";

export interface InputData {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  tick: number;
}

export const Player = schema(
  {
    x: t.number(),
    y: t.number(),
    tick: t.number(),
    inputQueue: t
      .ref(Array<InputData>)
      .noSync()
      .default(() => []),
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

  messages = {
    move: (client: Client, input: InputData) => {
      const player = this.state.players.get(client.sessionId);
      if (player == undefined) {
        client.leave(CloseCode.MAY_TRY_RECONNECT);
        return;
      }
      player.inputQueue.push(input);
    },
  };

  onCreate() {
    let elapsedTime = 0;
    this.setTimestep((deltaTime) => {
      elapsedTime += deltaTime;

      while (elapsedTime >= FixedTimestep) {
        elapsedTime -= FixedTimestep;
        this.fixedTick();
      }
    });
  }

  fixedTick() {
    this.state.players.forEach((player) => {
      let input = player.inputQueue.shift();

      while (input != undefined) {
        if (input.left) {
          player.x -= Velocity;
        } else if (input.right) {
          player.x += Velocity;
        }
        if (input.up) {
          player.y -= Velocity;
        } else if (input.down) {
          player.y += Velocity;
        }

        player.tick = input.tick;
        input = player.inputQueue.shift();
      }
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
