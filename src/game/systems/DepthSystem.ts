// 深度排序系统文件，根据对象 Y 坐标实现俯视 2D 场景的前后遮挡关系。
import type { DepthSortable } from '../types';

export class DepthSystem {
    public static readonly entityBaseDepth = 1_000;

    public sortByY(objects: DepthSortable[]): void {
        for (const object of objects) {
            object.setDepth(DepthSystem.entityBaseDepth + Math.round(object.y));
        }
    }
}
