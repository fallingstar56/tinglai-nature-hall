// 输入系统文件，封装键盘方向输入并驱动玩家占位实体移动。
import { Input, Math as PhaserMath, Scene } from 'phaser';
import { Player } from '../entities/Player';

type MovementKeys = Record<'up' | 'down' | 'left' | 'right', Input.Keyboard.Key>;

export class InputSystem {
    private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private readonly wasd: MovementKeys;

    public constructor(scene: Scene) {
        if (!scene.input.keyboard) {
            throw new Error('Keyboard input is required for InputSystem.');
        }

        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd = scene.input.keyboard.addKeys({
            up: Input.Keyboard.KeyCodes.W,
            down: Input.Keyboard.KeyCodes.S,
            left: Input.Keyboard.KeyCodes.A,
            right: Input.Keyboard.KeyCodes.D
        }) as MovementKeys;
    }

    public updatePlayer(player: Player, deltaSeconds: number): void {
        const x = this.axisValue(Boolean(this.cursors.left?.isDown || this.wasd.left.isDown), Boolean(this.cursors.right?.isDown || this.wasd.right.isDown));
        const y = this.axisValue(Boolean(this.cursors.up?.isDown || this.wasd.up.isDown), Boolean(this.cursors.down?.isDown || this.wasd.down.isDown));

        if (x === 0 && y === 0) {
            return;
        }

        const direction = new PhaserMath.Vector2(x, y).normalize();
        player.x += direction.x * player.moveSpeed * deltaSeconds;
        player.y += direction.y * player.moveSpeed * deltaSeconds;
    }

    private axisValue(negative: boolean, positive: boolean): number {
        return Number(positive) - Number(negative);
    }
}
