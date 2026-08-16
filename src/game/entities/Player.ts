// 玩家实体文件，提供移动、阴影和 Y 轴深度排序所需的最小占位角色。
import { GameObjects, Scene } from 'phaser';
import { gameConfig } from '../config/gameConfig';

export class Player extends GameObjects.Container {
    public readonly moveSpeed = 220;

    public constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y);

        const shadow = scene.add.ellipse(0, 14, 34, 12, 0x000000, 0.18);
        const body = scene.add.rectangle(0, 0, 24, 36, gameConfig.colors.player);
        const face = scene.add.rectangle(0, -8, 14, 10, 0xdceaf3);

        this.add([shadow, body, face]);
        this.setSize(28, 42);
        scene.add.existing(this);
    }
}
