// HUD 界面文件，预留自然大厅提示文本、交互按钮和状态信息的 DOM 外游戏内显示层。
import { GameObjects, Scene } from 'phaser';

export class HudOverlay {
    public readonly interactionLabel: GameObjects.Text;

    public constructor(scene: Scene) {
        this.interactionLabel = scene.add.text(24, 22, '', {
            color: '#edf4df',
            fontFamily: 'Arial, sans-serif',
            fontSize: '18px'
        });
        this.interactionLabel.setScrollFactor(0);
        this.interactionLabel.setDepth(10_000);
    }

    public setInteractionText(text: string): void {
        this.interactionLabel.setText(text);
    }
}
