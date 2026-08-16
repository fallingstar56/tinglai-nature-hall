// 交互系统文件，计算玩家与动物 NPC 的距离并预留后续交互触发能力。
import { Math as PhaserMath } from 'phaser';
import { AnimalNPC } from '../entities/AnimalNPC';
import { Player } from '../entities/Player';

export class InteractionSystem {
    public constructor(private readonly interactionRadius = 96) {}

    public findNearestAnimal(player: Player, animals: AnimalNPC[]): AnimalNPC | undefined {
        let nearest: AnimalNPC | undefined;
        let nearestDistance = this.interactionRadius;

        for (const animal of animals) {
            const distance = PhaserMath.Distance.Between(player.x, player.y, animal.x, animal.y);

            if (distance <= nearestDistance) {
                nearest = animal;
                nearestDistance = distance;
            }
        }

        return nearest;
    }
}
