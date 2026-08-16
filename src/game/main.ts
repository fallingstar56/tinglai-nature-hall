// Phaser 游戏入口文件，创建自然大厅运行时并注册启动、预加载和主场景链路。
import { AUTO, Game } from 'phaser';
import { gameConfig } from './config/gameConfig';
import { BootScene } from './scenes/BootScene';
import { NatureScene } from './scenes/NatureScene';
import { Preloader } from './scenes/Preloader';

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: gameConfig.viewport.width,
    height: gameConfig.viewport.height,
    parent: 'game-container',
    backgroundColor: gameConfig.colors.background,
    pixelArt: true,
    roundPixels: true,
    scene: [
        BootScene,
        Preloader,
        NatureScene
    ]
};

const StartGame = (parent: string): Game => {

    return new Game({ ...config, parent });

};

export default StartGame;
