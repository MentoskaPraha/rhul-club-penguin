import * as Phaser from "phaser";
import {
  Room,
  Client,
  Callbacks,
  Predict,
  InputHandle,
  Reconciler,
} from "@colyseus/sdk";
import { GameMapHeight, GameMapWidth, Velocity } from "@common/constants";
import type server from "@server/index";
import type { GameRoom, GameRoomState, Player } from "@server/GameRoom";
import { applyInput, MoveInput } from "@common/GameInput";

export class GameScene extends Phaser.Scene {
  client = new Client<typeof server>(window.location.origin);
  room: Room<GameRoom, GameRoomState>;

  predict: Predict;
  moveInput: InputHandle<MoveInput>;
  currentPlayer: Reconciler<Player>;

  playerEntities: {
    [sessionId: string]: {
      entity: Phaser.GameObjects.Image;
      player: Player;
    };
  } = {};

  cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  autoMoveState = {
    moving: false,
    x: NaN,
    y: NaN,
  };

  elapsedTime = 0;
  currentTick: number = 0;

  constructor() {
    super({ key: "game" });
  }

  async create() {
    // initialise input for movement
    this.cursorKeys = this.input.keyboard?.createCursorKeys();
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (!this.currentPlayer) return;
      this.autoMoveState.x = Math.floor(pointer.worldX);
      this.autoMoveState.y = Math.floor(pointer.worldY);
      this.autoMoveState.moving = true;
    });

    // setup the camera
    this.cameras.main.setBounds(0, 0, GameMapWidth, GameMapHeight);

    // connect with the room
    await this.connect();
    if (!this.room) return;

    // setup input and prediction
    this.moveInput = this.room.input({ type: MoveInput });
    if (this.moveInput.tickRate == undefined) {
      throw new Error("Server didn't advertise a fixed tickrate!");
    }

    this.predict = Predict.get(this.room, { mode: "lerp", delay: 100 });
    this.predict.attachAll("players", { mode: "lerp", fields: ["x", "y"] });

    // listen to server events
    const callbacks = Callbacks.get(this.room);

    callbacks.onAdd("players", (player, sessionId) => {
      const entity = this.add.image(player.x, player.y, "ship_0001");
      const playerEntry = {
        entity: entity,
        player: player,
      };
      this.playerEntities[sessionId] = playerEntry;
      if (sessionId == this.room.sessionId) {
        this.currentPlayer = this.predict.reconciler(player, {
          input: this.moveInput,
          step: (_ctx, state, cmd) => applyInput(state, cmd),
          smoothMs: 65,
        });
      }
    });

    callbacks.onRemove("players", (_, sessionId) => {
      const entity = this.playerEntities[sessionId]?.entity;
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

  update(): void {
    // Skip loop if not connected yet.
    if (!this.currentPlayer) return;

    const steps = this.predict.tick();
    for (let i = 0; i < steps; i++) {
      this.stageInput();
      this.moveInput.send();
    }

    for (const sessionId in this.playerEntities) {
      const { entity, player } = this.playerEntities[sessionId];
      entity.setPosition(
        this.predict.value(player, "x"),
        this.predict.value(player, "y"),
      );
    }
  }

  stageInput() {
    const data = this.moveInput.data;

    if (this.autoMoveState.moving) {
      const diffX = this.currentPlayer.state.x - this.autoMoveState.x;
      const diffY = this.currentPlayer.state.y - this.autoMoveState.y;
      const arrivedX = Math.abs(diffX) <= Velocity;
      const arrivedY = Math.abs(diffY) <= Velocity;

      data.left = diffX > 0 && !arrivedX;
      data.right = diffX < 0 && !arrivedX;
      data.up = diffY > 0 && !arrivedY;
      data.down = diffY < 0 && !arrivedY;

      if (arrivedX && arrivedY) this.autoMoveState.moving = false;
    } else if (this.cursorKeys) {
      data.left = this.cursorKeys.left.isDown;
      data.right = this.cursorKeys.right.isDown;
      data.up = this.cursorKeys.up.isDown;
      data.down = this.cursorKeys.down.isDown;
    }
  }
}
