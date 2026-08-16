// 鸟类展示数据类型，驱动场景 NPC、详情面板和音频入口。
export interface BirdProfile {
    id: string;
    displayName: string;
    latinName: string;
    summary: string;
    habitat: string;
    recognitionTips: string[];
    spawn: {
        x: number;
        y: number;
    };
    assets: {
        sprite: string;
        portrait: string;
        audio: string;
    };
}
