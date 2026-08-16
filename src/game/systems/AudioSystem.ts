// 音频系统文件，封装自然大厅环境音、动物音效和 UI 音效的播放入口。
import { Scene } from 'phaser';

export class AudioSystem {
    public constructor(private readonly scene: Scene) {}

    public playAmbientLoop(key: string, volume = 0.35): void {
        if (!this.scene.cache.audio.exists(key) || this.scene.sound.get(key)) {
            return;
        }

        this.scene.sound.play(key, {
            loop: true,
            volume
        });
    }

    public stopAll(): void {
        this.scene.sound.stopAll();
    }
}
