// 世界类型文件，描述自然大厅尺寸、层级名称和生成点等场景结构数据。
export type SceneLayerName = 'ground' | 'walls' | 'entities' | 'foreground' | 'effects';

export interface WorldBounds {
    width: number;
    height: number;
}

export interface HallSpawnPoint {
    x: number;
    y: number;
}
