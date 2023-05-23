declare module gs.physics {
    interface AABB {
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
    }
}
declare module gs.physics {
    class CollisionEvent extends Event {
        entity1: Entity;
        entity2: Entity;
        velocities: {
            v1: Vector2;
            v2: Vector2;
        };
        constructor(type: string, entity1: Entity, entity2: Entity, velocities: {
            v1: Vector2;
            v2: Vector2;
        });
        reset(): void;
        getEntity1(): Entity;
        getEntity2(): Entity;
        getVelocities(): {
            v1: Vector2;
            v2: Vector2;
        };
    }
}
declare module gs.physics {
    class CollisionHandlerSystem {
        constructor();
        handleCollision(event: Event): void;
    }
}
declare module gs.physics {
    class CollisionResponseSystem extends System {
        dynamicTree: DynamicTree;
        private processed;
        private collisionPairs;
        constructor(entityManager: EntityManager, updateInterval: number);
        update(entities: Entity[]): void;
    }
}
declare module gs.physics {
    function findItem<T>(item: T, items: T[], equalsFn?: (a: T, b: T) => boolean): number;
    function calcBounds(node: DynamicTreeNode, toBounds: (item: any) => Collider): void;
    function distBounds(node: DynamicTreeNode, k: number, p: number, toCollider: (item: any) => Collider, destNode?: DynamicTreeNode): DynamicTreeNode;
    function extend(a: Bounds, b: Bounds): Bounds;
    function compareNodeMinX(a: DynamicTreeNode, b: DynamicTreeNode): number;
    function compareNodeMinY(a: DynamicTreeNode, b: DynamicTreeNode): number;
    function boundsArea(a: DynamicTreeNode): number;
    function boundsMargin(a: DynamicTreeNode): number;
    function enlargedArea(a: Bounds, b: Bounds): number;
    function intersectionArea(a: Bounds, b: Bounds): number;
    function contains(a: AABB, b: AABB): boolean;
    function intersects(a: AABB, b: AABB): boolean;
    function createNode(children: DynamicTreeNode[]): DynamicTreeNode;
    function multiSelect<T>(arr: T[], left: number, right: number, n: number, compare: (a: T, b: T) => number): void;
    function quickselect<T>(arr: T[], k: number, left: number, right: number, compare: (a: T, b: T) => number): void;
    function swap<T>(arr: T[], i: number, j: number): void;
}
declare module gs.physics {
    class DynamicTree {
        private _maxEntries;
        private _minEntries;
        private compareMinX;
        private compareMinY;
        private data;
        constructor(maxEntries?: number);
        all(): DynamicTreeNode[];
        search(collider: Collider): DynamicTreeNode[];
        collides(collider: Collider): boolean;
        load(data: DynamicTreeNode[]): DynamicTree;
        insert(item: DynamicTreeNode): DynamicTree;
        clear(): DynamicTree;
        remove(item: DynamicTreeNode, equalsFn?: (a: DynamicTreeNode, b: DynamicTreeNode) => boolean): DynamicTree;
        toBounds(item: DynamicTreeNode): Collider;
        toJSON(): DynamicTreeNode;
        fromJSON(data: DynamicTreeNode): DynamicTree;
        private _all;
        private _build;
        private _chooseSubtree;
        private _insert;
        private _split;
        private _splitRoot;
        private _chooseSplitIndex;
        private _chooseSplitAxis;
        private _allDistMargin;
        private _adjustParentBounds;
        private _condense;
    }
}
declare module gs.physics {
    interface DynamicTreeNode {
        children: DynamicTreeNode[];
        height: number;
        leaf: boolean;
        collider: Collider;
    }
}
declare module gs.physics {
    class FixedPoint {
        rawValue: number;
        precision: number;
        constructor(value?: number, precision?: number);
        add(other: FixedPoint | number): this;
        sub(other: FixedPoint | number): this;
        mul(other: FixedPoint | number): this;
        div(other: FixedPoint | number): this;
        lt(other: FixedPoint | number): boolean;
        gt(other: FixedPoint | number): boolean;
        gte(other: FixedPoint | number): boolean;
        lte(other: FixedPoint | number): boolean;
        neg(): FixedPoint;
        toFloat(): number;
        static add(a: FixedPoint, b: FixedPoint | number): FixedPoint;
        static sub(a: FixedPoint, b: FixedPoint | number): FixedPoint;
        static mul(a: FixedPoint, b: FixedPoint | number): FixedPoint;
        static div(a: FixedPoint, b: FixedPoint | number): FixedPoint;
        static max(a: FixedPoint, b: FixedPoint): FixedPoint;
        static min(a: FixedPoint, b: FixedPoint): FixedPoint;
        static from(value: number | string): FixedPoint;
    }
}
declare module gs.physics {
    class RigidBody extends Component {
        position: Vector2;
        velocity: Vector2;
        mass: FixedPoint;
        size: Vector2;
    }
}
declare module gs.physics {
    class Size {
        width: FixedPoint;
        height: FixedPoint;
        constructor(width?: number, height?: number);
        add(other: Size): Size;
        subtract(other: Size): Size;
        multiply(scalar: number): Size;
        divide(scalar: number): Size;
    }
}
declare module gs.physics {
    class SpatialHash<T extends Bounds> {
        private cellSize;
        private hashTable;
        private objectTable;
        private setPool;
        constructor(cellSize: number);
        private hash;
        private getSetFromPool;
        private returnSetToPool;
        insert(obj: T): void;
        retrieve(obj: T, callback: (obj: T) => void): void;
        retrieveAll(): T[];
        remove(obj: T): void;
        clear(): void;
    }
}
declare module gs.physics {
    class Transform extends Component {
        position: Vector2;
        onInitialize(x?: number, y?: number): void;
    }
}
declare module gs.physics {
    class Vector2 {
        x: FixedPoint;
        y: FixedPoint;
        constructor(x?: FixedPoint | number, y?: FixedPoint | number);
        add(other: Vector2): Vector2;
        sub(other: Vector2): Vector2;
        mul(scalar: FixedPoint | number): Vector2;
        div(scalar: FixedPoint | number): Vector2;
        /** 计算向量的长度 */
        length(): FixedPoint;
        /** 计算向量的平方长度 */
        lengthSquared(): FixedPoint;
        /** 归一化向量 */
        normalize(): Vector2;
        /** 计算两个向量的点积 */
        dot(other: Vector2): FixedPoint;
        /** 计算两个向量的叉积 */
        cross(other: Vector2): FixedPoint;
        /** 计算到另一个向量的距离 */
        distanceTo(other: Vector2): FixedPoint;
    }
}
declare module gs.physics {
    class World implements IPlugin {
        gravity: FixedPoint;
        timeStep: FixedPoint;
        name: string;
        constructor(gravity?: FixedPoint, timeStep?: FixedPoint);
        onInit(core: Core): void;
        onUpdate(deltaTime: number): void;
    }
}
declare module gs.physics {
    class Collider extends Component {
        bounds: Bounds;
        isColliding: boolean;
        getBounds(): Bounds;
        setBounds(bounds: Bounds): void;
        intersects(other: Collider): boolean;
        contains(other: Collider): boolean;
    }
}
declare module gs.physics {
    class BoxCollider extends Collider {
        private size;
        private transform;
        dependencies: ComponentConstructor<Component>[];
        onInitialize(size: Size): void;
    }
}
declare module gs.physics {
    class CircleCollider extends Collider {
    }
}
declare module gs.physics {
    class PolygonCollider extends Collider {
    }
}
declare module gs.physics {
    interface Bounds {
        position: Vector2;
        width: FixedPoint;
        height: FixedPoint;
        entity: Entity;
        intersects(other: Bounds): boolean;
        contains(other: Bounds): boolean;
    }
}
declare module gs.physics {
    class BoxBounds implements Bounds {
        position: Vector2;
        width: FixedPoint;
        height: FixedPoint;
        entity: Entity;
        constructor(position: Vector2, width: FixedPoint, height: FixedPoint, entity: Entity);
        intersects(other: Bounds): boolean;
        contains(other: Bounds): boolean;
    }
}
declare module gs.physics {
    class CircleBounds implements Bounds {
        position: Vector2;
        width: FixedPoint;
        height: FixedPoint;
        entity: Entity;
        radius: FixedPoint;
        intersects(other: Bounds): boolean;
        contains(other: Bounds): boolean;
    }
}
