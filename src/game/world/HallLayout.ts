// 大厅布局规划文件，保存自然大厅边界、通行区域和未来展区数据的初始化结构。
import { gameConfig } from '../config/gameConfig';

export const hallLayout = {
    bounds: {
        x: 0,
        y: 0,
        width: gameConfig.world.width,
        height: gameConfig.world.height
    },
    walkableArea: {
        x: 120,
        y: 150,
        width: gameConfig.world.width - 240,
        height: gameConfig.world.height - 280
    },
    exhibitZones: [
        {
            id: 'forest-corner',
            name: 'Forest Corner',
            x: 250,
            y: 250,
            width: 190,
            height: 74
        },
        {
            id: 'wetland-corner',
            name: 'Wetland Corner',
            x: 820,
            y: 280,
            width: 210,
            height: 74
        }
    ]
} as const;
