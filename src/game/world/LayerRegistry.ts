// 场景分层注册文件，定义 2.5D 自然大厅地面、墙体、实体、前景和效果层的创建方式。
import { GameObjects, Scene } from 'phaser';
import { DepthSystem } from '../systems/DepthSystem';
import type { SceneLayerName } from '../types';

export type SceneLayerMap = Record<SceneLayerName, GameObjects.Layer>;

export const createSceneLayers = (scene: Scene): SceneLayerMap => {
    return {
        ground: scene.add.layer().setDepth(0),
        walls: scene.add.layer().setDepth(100),
        entities: scene.add.layer().setDepth(DepthSystem.entityBaseDepth),
        foreground: scene.add.layer().setDepth(4_000),
        effects: scene.add.layer().setDepth(8_000)
    };
};
