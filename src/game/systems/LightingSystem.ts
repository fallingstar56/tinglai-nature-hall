// 光影系统文件，预留自然大厅伪 3D 动态光照、局部高光和氛围遮罩的创建入口。
import { GameObjects, Scene } from 'phaser';
import { gameConfig } from '../config/gameConfig';

export class LightingSystem {
    public constructor(private readonly scene: Scene) {}

    public createAmbientLightAnchors(): GameObjects.Graphics {
        const lightOverlay = this.scene.add.graphics();
        lightOverlay.fillStyle(gameConfig.colors.light, 0.12);
        lightOverlay.fillCircle(520, 310, 180);
        lightOverlay.fillCircle(810, 500, 140);

        return lightOverlay;
    }
}
