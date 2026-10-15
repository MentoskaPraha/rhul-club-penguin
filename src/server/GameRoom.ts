import { Room, Client, CloseCode } from "colyseus";
import { schema, SchemaType, t } from "@colyseus/schema";

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
    mapWidth: t.number().default(1024),
    mapHeight: t.number().default(768),
    players: t.map(Player),
  },
  "GameRoomState",
);
export type GameRoomState = SchemaType<typeof GameRoomState>;

export class GameRoom extends Room {
  state = new GameRoomState();
  fixedTimeStep = 1000 / 60;

  messages = {
    0: (client: Client, input: InputData) => {
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

      while (elapsedTime >= this.fixedTimeStep) {
        elapsedTime -= this.fixedTimeStep;
        this.fixedTick();
      }
    });
  }

  fixedTick() {
    const velocity = 2;

    this.state.players.forEach((player) => {
      let input = player.inputQueue.shift();

      while (input != undefined) {
        if (input.left) {
          player.x -= velocity;
        } else if (input.right) {
          player.x += velocity;
        }
        if (input.up) {
          player.y -= velocity;
        } else if (input.down) {
          player.y += velocity;
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
