// 鸟类 NPC 实体文件，使用 BirdProfile 渲染可交互、可 Y 轴排序的鸟类占位展示。
import { GameObjects, Geom, Scene } from 'phaser';
import { gameConfig } from '../config/gameConfig';
import type { BirdProfile } from '../types';

export class BirdNPC extends GameObjects.Container {
    public readonly profile: BirdProfile;
    public readonly id: string;
    public readonly displayName: string;

    private readonly halo: GameObjects.Ellipse;

    public constructor(scene: Scene, profile: BirdProfile) {
        super(scene, profile.spawn.x, profile.spawn.y);

        this.profile = profile;
        this.id = profile.id;
        this.displayName = profile.displayName;

        this.halo = scene.add.ellipse(0, 0, 76, 54, gameConfig.colors.light, 0.08);
        const shadow = scene.add.ellipse(0, 24, 54, 15, 0x000000, 0.18);
        const legs = scene.add.rectangle(0, 14, 6, 34, 0x3a3027, 0.95);
        const body = scene.add.ellipse(0, 0, 36, 50, 0xf4f0e4, 1);
        const wing = scene.add.ellipse(6, 4, 18, 38, 0x2d302f, 0.88);
        const neck = scene.add.rectangle(-10, -32, 11, 42, 0xf4f0e4, 1);
        const throat = scene.add.rectangle(-10, -37, 11, 24, 0x1f2522, 0.9);
        const head = scene.add.ellipse(-10, -58, 22, 18, 0xf4f0e4, 1);
        const crown = scene.add.ellipse(-11, -66, 12, 7, 0xc95345, 1);
        const beak = scene.add.triangle(-24, -58, 0, 0, -18, 5, -18, -5, 0xd6b15d, 1);

        this.add([this.halo, shadow, legs, body, wing, neck, throat, head, crown, beak]);
        this.setSize(82, 92);
        this.setInteractive(new Geom.Rectangle(-41, -72, 82, 108), Geom.Rectangle.Contains);
        this.input!.cursor = 'pointer';

        scene.tweens.add({
            targets: this.halo,
            alpha: 0.18,
            scaleX: 1.12,
            scaleY: 1.12,
            duration: 1400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        scene.add.existing(this);
    }
}
