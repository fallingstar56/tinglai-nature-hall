// 鸟类展示数据类型，驱动场景 NPC、详情面板和音频入口。
export interface BirdProfile {
    id: string;
    displayName: string;
    latinName: string;
    pronunciation?: string;
    category?: string;
    summary: string;
    callFeatures?: string;
    behavior?: string;
    distribution?: string;
    conservationStatus?: string;
    funFact?: string;
    habitat: string;
    recognitionTips: string[];
    audioCredit?: {
        source: string;
        recorder?: string;
        recordedAt?: string;
        location?: string;
        license?: string;
        anonymous?: boolean;
    };
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
