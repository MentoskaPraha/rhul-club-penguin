import { AUTO, Game } from "phaser";
import { GameScene } from "@client/GameScene";
import { GameMapWidth, GameMapHeight } from "@common/constants";

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  parent: "game-container",
  fps: {
    target: 60,
    forceSetTimeOut: true,
    smoothStep: false,
  },
  width: GameMapWidth,
  height: GameMapHeight,
  backgroundColor: "#028af8",
  pixelArt: true,
  physics: {
    default: "arcade",
  },
  scene: [GameScene],
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
