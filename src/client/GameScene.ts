import * as Phaser from "phaser";
import { Room, Client, Callbacks } from "@colyseus/sdk";
import {
  FixedTimestep,
  GameMapHeight,
  GameMapWidth,
  Velocity,
} from "@common/constants";
import type server from "@server/index";
import type { InputData, GameRoom, GameRoomState } from "@server/GameRoom";

export class GameScene extends Phaser.Scene {
  client = new Client<typeof server>(window.location.origin);
  room: Room<GameRoom, GameRoomState>;

  currentPlayer: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  playerEntities: {
    [sessionId: string]: {
      entity: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
      serverX: number;
      serverY: number;
    };
  } = {};

  cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  inputPayload: InputData = {
    left: false,
    right: false,
    up: false,
    down: false,
    tick: NaN,
  };

  elapsedTime = 0;
  currentTick: number = 0;

  constructor() {
    super({ key: "game" });
  }

  async create() {
    // initialise movement keys
    this.cursorKeys = this.input.keyboard?.createCursorKeys();

    // setup the camera
    this.cameras.main.setBounds(0, 0, GameMapWidth, GameMapHeight);

    // connect with the room
    await this.connect();

    // listen to server events
    const callbacks = Callbacks.get(this.room);

    callbacks.onAdd("players", (player, sessionId) => {
      const entity = this.physics.add.image(player.x, player.y, "ship_0001");
      const playerEntity = {
        entity: entity,
        serverX: player.x,
        serverY: player.y,
      };
      this.playerEntities[sessionId] = playerEntity;
      if (sessionId == this.room.sessionId) {
        this.currentPlayer = entity;
      } else {
        callbacks.onChange(player, () => {
          playerEntity.serverX = player.x;
          playerEntity.serverY = player.y;
        });
      }
    });

    callbacks.onRemove("players", (_, sessionId) => {
      const entity = this.playerEntities[sessionId].entity;
      if (entity) {
        entity.destroy();
        delete this.playerEntities[sessionId];
      }
    });
  }

  async connect() {
    // Add connection status text
    const connectionStatusText = this.add
      .text(0, 0, "Connecting to the server...")
      .setStyle({ color: "#ff0000" })
      .setPadding(4);

    // Try to connect to the server
    try {
      this.room = (await this.client.joinOrCreate("game", {})) as Room<
        GameRoom,
        GameRoomState
      >;
      connectionStatusText.destroy();
    } catch (e) {
      connectionStatusText.text = "Could not connect with the server.";
      console.error(e);
    }
  }

  update(_time: number, delta: number): void {
    // Skip loop if not connected yet.
    if (!this.currentPlayer) {
      return;
    }

    this.elapsedTime += delta;
    while (this.elapsedTime >= FixedTimestep) {
      this.elapsedTime -= FixedTimestep;
      this.fixedTick();
    }
  }

  fixedTick() {
    this.currentTick++;

    // If the cursor keys are available, run their input logic
    if (this.cursorKeys != undefined) {
      this.inputPayload.left = this.cursorKeys.left.isDown;
      this.inputPayload.right = this.cursorKeys.right.isDown;
      this.inputPayload.up = this.cursorKeys.up.isDown;
      this.inputPayload.down = this.cursorKeys.down.isDown;
      this.inputPayload.tick = this.currentTick;
      this.room.send("move", this.inputPayload);

      if (this.inputPayload.left) {
        this.currentPlayer.x -= Velocity;
      } else if (this.inputPayload.right) {
        this.currentPlayer.x += Velocity;
      }

      if (this.inputPayload.up) {
        this.currentPlayer.y -= Velocity;
      } else if (this.inputPayload.down) {
        this.currentPlayer.y += Velocity;
      }
    }

    // Update the position of all players
    for (const sessionId in this.playerEntities) {
      if (sessionId == this.room.sessionId) {
        continue;
      }

      const { entity, serverX, serverY } = this.playerEntities[sessionId];
      entity.x = Phaser.Math.Linear(entity.x, serverX, 0.2);
      entity.y = Phaser.Math.Linear(entity.y, serverY, 0.2);
    }
  }
}
