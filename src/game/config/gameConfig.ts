// 游戏参数配置文件，集中管理自然大厅视口、世界尺寸、颜色和初始生成点。
import type { AnimalSpawnConfig, HallSpawnPoint, WorldBounds } from '../types';

export const gameConfig = {
    viewport: {
        width: 1024,
        height: 768
    },
    world: {
        width: 1280,
        height: 900
    } satisfies WorldBounds,
    colors: {
        background: '#17201c',
        floor: 0x60735f,
        floorAccent: 0x91a47b,
        wall: 0x3f5147,
        foreground: 0x25372f,
        player: 0x4f8cc9,
        animal: 0xd8a24c,
        light: 0xf4e3b2
    },
    playerSpawn: {
        x: 520,
        y: 560
    } satisfies HallSpawnPoint,
    animalSpawns: [
        {
            id: 'red-panda-01',
            species: 'red-panda',
            displayName: 'Red Panda',
            x: 690,
            y: 500
        },
        {
            id: 'crane-01',
            species: 'crane',
            displayName: 'Crane',
            x: 360,
            y: 430
        }
    ] satisfies AnimalSpawnConfig[]
} as const;
