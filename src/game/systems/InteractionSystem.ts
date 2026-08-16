// 交互系统文件，计算玩家与可交互 NPC 的距离并提供最近目标选择。
import { Math as PhaserMath } from 'phaser';
import { Player } from '../entities/Player';

interface InteractionTarget {
    x: number;
    y: number;
}

export class InteractionSystem {
    public constructor(private readonly interactionRadius = 96) {}

    public findNearest<TTarget extends InteractionTarget>(player: Player, targets: TTarget[]): TTarget | undefined {
        let nearest: TTarget | undefined;
        let nearestDistance = this.interactionRadius;

        for (const target of targets) {
            const distance = PhaserMath.Distance.Between(player.x, player.y, target.x, target.y);

            if (distance <= nearestDistance) {
                nearest = target;
                nearestDistance = distance;
            }
        }

        return nearest;
    }
}
