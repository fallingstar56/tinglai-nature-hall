// 启动场景文件，负责进入资源预加载流程前的 Phaser 初始化衔接。
import { Scene } from 'phaser';

export class BootScene extends Scene {
    public constructor() {
        super('BootScene');
    }

    public create(): void {
        this.scene.start('Preloader');
    }
}
