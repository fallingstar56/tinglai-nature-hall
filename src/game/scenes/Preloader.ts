// 资源预加载场景文件，为后续地图、角色、音频、光影和粒子资源加载预留入口。
import { Scene } from 'phaser';

export class Preloader extends Scene {
    public constructor() {
        super('Preloader');
    }

    public preload(): void {
        const { width, height } = this.scale;
        const label = this.add.text(width / 2, height / 2, 'Loading Nature Hall', {
            color: '#edf4df',
            fontFamily: 'Arial, sans-serif',
            fontSize: '24px'
        });

        label.setOrigin(0.5);
    }

    public create(): void {
        this.scene.start('NatureScene');
    }
}
