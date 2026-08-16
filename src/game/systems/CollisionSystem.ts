// 碰撞系统文件，预留自然大厅通行区域、墙体和展陈物阻挡判定的统一入口。
import { Math as PhaserMath } from 'phaser';
import { hallLayout } from '../world/HallLayout';

export class CollisionSystem {
    public clampToWalkableArea(x: number, y: number): PhaserMath.Vector2 {
        const { walkableArea } = hallLayout;

        return new PhaserMath.Vector2(
            PhaserMath.Clamp(x, walkableArea.x, walkableArea.x + walkableArea.width),
            PhaserMath.Clamp(y, walkableArea.y, walkableArea.y + walkableArea.height)
        );
    }
}
