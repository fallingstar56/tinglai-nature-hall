// 动物 NPC 实体文件，提供自然大厅展示动物的占位渲染和交互标识。
import { GameObjects, Scene } from 'phaser';
import { gameConfig } from '../config/gameConfig';
import type { AnimalSpawnConfig } from '../types';

export class AnimalNPC extends GameObjects.Container {
    public readonly id: string;
    public readonly species: string;
    public readonly displayName: string;

    public constructor(scene: Scene, config: AnimalSpawnConfig) {
        super(scene, config.x, config.y);

        this.id = config.id;
        this.species = config.species;
        this.displayName = config.displayName;

        const shadow = scene.add.ellipse(0, 12, 42, 14, 0x000000, 0.16);
        const body = scene.add.ellipse(0, 0, 36, 28, gameConfig.colors.animal);
        const marker = scene.add.rectangle(0, -20, 10, 10, gameConfig.colors.light);

        this.add([shadow, body, marker]);
        this.setSize(42, 38);
        scene.add.existing(this);
    }
}
