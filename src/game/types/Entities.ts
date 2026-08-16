// 实体类型文件，描述玩家、动物和可参与深度排序对象的共享数据契约。
export interface EntitySpawnConfig {
    id: string;
    x: number;
    y: number;
}

export interface AnimalSpawnConfig extends EntitySpawnConfig {
    species: string;
    displayName: string;
}

export interface DepthSortable {
    y: number;
    setDepth(value: number): this;
}
