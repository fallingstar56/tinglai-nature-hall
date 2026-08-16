// 粒子系统文件，预留尘埃、落叶、水汽等自然大厅环境粒子的创建入口。
import { GameObjects, Scene } from 'phaser';
import { gameConfig } from '../config/gameConfig';

export class ParticleSystem {
    public constructor(private readonly scene: Scene) {}

    public createPlaceholderEmitterAnchor(): GameObjects.Rectangle {
        const anchor = this.scene.add.rectangle(640, 420, 12, 12, gameConfig.colors.light, 0.35);
        anchor.setData('purpose', 'future-particle-emitter-anchor');

        return anchor;
    }
}
