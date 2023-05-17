declare module gs.physics {
    class AABB {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
        velocityX: number;
        velocityY: number;
        constructor(minX: number, maxX: number, minY: number, maxY: number);
        /**
         * 计算两个 AABB 的并集
         * @param other
         * @returns
         */
        union(other: AABB): AABB;
        /**
         * 计算 AABB 的面积
         * @returns
         */
        area(): number;
        /**
         * 检查两个 AABB 是否相交
         * @param other
         * @returns
         */
        intersects(other: AABB): boolean;
        /**
         * 计算与另一个物体的可能碰撞时间
         * @param other
         * @returns
         */
        computeCollisionTime(other: AABB): number;
        clone(): AABB;
    }
}
declare module gs.physics {
    class BVHNode {
        left: BVHNode | null;
        right: BVHNode | null;
        object: AABB | null;
        bounds: AABB;
        constructor(object?: AABB);
        /**
         * 插入物体并返回是否需要重新平衡
         * @param object
         * @returns
         */
        insert(object: AABB): boolean;
        /**
         * 移除物体并返回是否需要重新平衡
         * @param object
         * @returns
         */
        remove(object: AABB): boolean;
        /**
         * 更新边界
         */
        updateBounds(): void;
        /**
         * 查询与给定的AABB相交的所有物体
         * @param aabb
         * @returns
         */
        query(aabb: AABB): AABB[];
        /**
         * 计算节点所包含的物体数量
         * @returns
         */
        size(): number;
        /**
         * 获取节点中的所有物体
         * @returns
         */
        getObjects(): AABB[];
    }
    /**
     * 包围体层次结构
     */
    class BVH {
        root: BVHNode;
        constructor();
        /**
         * 插入物体并在必要时重新平衡
         * @param object
         */
        insert(object: AABB): void;
        /**
         * 查询与给定的AABB相交的所有物体
         * @param aabb
         * @returns
         */
        query(aabb: AABB): AABB[];
        /**
         * 过滤碰撞对
         * @param pairs
         * @returns
         */
        filterPairs(pairs: [AABB, AABB][]): [AABB, AABB][];
        /**
         * 移除物体并在必要时重新平衡
         * @param object
         */
        remove(object: AABB): void;
        /**
         * 更新物体位置
         * @param object
         * @param newPosition
         */
        update(object: AABB, newPosition: {
            minX: number;
            minY: number;
            maxX: number;
            maxY: number;
        }): void;
    }
}
declare module gs.physics {
    class PhysicsComponent extends Component {
        aabb: AABB;
    }
}
declare module gs.physics {
    class PhysicsEngine {
        private quadtree;
        private bvh;
        private entities;
        constructor(boundary?: Rectangle, capacity?: number, cellSize?: number);
        addObject(entityId: number, aabb: AABB): void;
        removeObject(entityId: number): void;
        updateObject(entityId: number, newPosition: {
            minX: number;
            minY: number;
            maxX: number;
            maxY: number;
        }): void;
        step(time: number): void;
    }
}
declare module gs.physics {
    class PhysicsSystem extends System {
        engine: PhysicsEngine;
        constructor(entityManager: EntityManager);
        update(entities: Entity[]): void;
    }
}
declare module gs.physics {
    class Point {
        x: number;
        y: number;
        constructor(x: number, y: number);
    }
}
declare module gs.physics {
    /**
     * 四叉树
     */
    class QuadTree {
        boundary: Rectangle;
        capacity: number;
        cellSize: number;
        private spatialHash;
        private nw;
        private ne;
        private sw;
        private se;
        private aabbs;
        constructor(boundary: Rectangle, capacity: number, cellSize: number);
        insert(aabb: AABB): boolean;
        expandBoundary(aabb: AABB): void;
        subdivide(): void;
        remove(aabb: AABB): any;
        query(range: Rectangle, found?: AABB[]): AABB[];
        queryPairs(): [AABB, AABB][];
        update(point: AABB, newPosition: AABB): boolean;
    }
}
declare module gs.physics {
    class Rectangle {
        x: number;
        y: number;
        width: number;
        height: number;
        constructor(x: number, y: number, width: number, height: number);
        contains(point: Point): boolean;
        intersects(range: Rectangle): boolean;
        intersectsAABB(aabb: AABB): boolean;
    }
}
declare module gs.physics {
    /**
     * 空间哈希
     */
    class SpatialHash {
        cellSize: number;
        private buckets;
        constructor(cellSize: number);
        size(): number;
        private hash;
        insert(aabb: AABB): void;
        remove(aabb: AABB): boolean;
        query(x: number, y: number): AABB[];
        queryPairs(): [AABB, AABB][];
        clear(): void;
    }
}
declare module gs.physics {
    /**
     * 扫描排序
     */
    class SweepAndPrune {
        static sweepAndPrune(pairs: [AABB, AABB][]): [AABB, AABB][];
        private static mergeSort;
        private static merge;
    }
}
declare module gs.physics {
    /**
     * 基于时间基础的碰撞检测
     */
    class TimeBaseCollisionDetection {
        /**
         * 用于处理物体的速度和方向以预测并阻止碰撞
         * @param aabb1
         * @param aabb2
         */
        static handleCollision(aabb1: AABB, aabb2: AABB): [AABB, AABB];
        /**
         * 处理多个碰撞和反弹
         * @param aabbs
         */
        static handleCollisions(aabbs: AABB[]): void;
    }
}
