declare module gs.physics {
    class CollisionDetector {
        private shape1;
        private shape2;
        constructor(shape1: PolygonBounds, shape2: PolygonBounds);
        epa(): Vector2;
        gjk(): boolean;
        private updateSimplexAndDirection;
        private addPointToPolytope;
        private support;
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
    function calcBounds(node: DynamicTreeNode, toBounds: (item: any) => Bounds): void;
    function distBounds(node: DynamicTreeNode, k: number, p: number, toBounds: (item: any) => Bounds, destNode?: DynamicTreeNode): DynamicTreeNode;
    function extend(a: Bounds, b: Bounds): Bounds;
    function compareNodeMinX(a: DynamicTreeNode, b: DynamicTreeNode): number;
    function compareNodeMinY(a: DynamicTreeNode, b: DynamicTreeNode): number;
    function boundsArea(a: DynamicTreeNode): number;
    function boundsMargin(a: DynamicTreeNode): number;
    function enlargedArea(a: Bounds, b: Bounds): number;
    function intersectionArea(a: Bounds, b: Bounds): number;
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
        search(bounds: Bounds): DynamicTreeNode[];
        collides(bounds: Bounds): boolean;
        load(data: DynamicTreeNode[]): DynamicTree;
        insert(item: DynamicTreeNode): DynamicTree;
        clear(): DynamicTree;
        remove(item: DynamicTreeNode, equalsFn?: (a: DynamicTreeNode, b: DynamicTreeNode) => boolean): DynamicTree;
        toBounds(item: DynamicTreeNode): Bounds;
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
        bounds: Bounds;
    }
}
declare module gs.physics {
    class Edge {
        readonly distance: FixedPoint;
        readonly pointA: Vector2;
        readonly pointB: Vector2;
        constructor(a: Vector2, b: Vector2);
    }
}
declare module gs.physics {
    class FixedPoint {
        rawValue: number;
        precision: number;
        constructor(value?: number, precision?: number);
        add(other: FixedPoint | number): FixedPoint;
        sub(other: FixedPoint | number): FixedPoint;
        mul(other: FixedPoint | number): FixedPoint;
        div(other: FixedPoint | number): FixedPoint;
        abs(): FixedPoint;
        pow(exponent: number): FixedPoint;
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
    class Projection {
        min: number;
        max: number;
        constructor(min: number, max: number);
        overlaps(other: Projection): boolean;
    }
}
declare module gs.physics {
    class RigidBody extends Component {
        dependencies: ComponentConstructor<Component>[];
        mass: FixedPoint;
        velocity: Vector2;
        acceleration: Vector2;
        isKinematic: boolean;
        onInitialize(mass?: FixedPoint, isKinematic?: boolean): void;
        applyForce(force: Vector2): void;
        update(deltaTime: FixedPoint): void;
    }
}
declare module gs.physics {
    class Simplex {
        vertices: Vector2[];
        constructor();
        add(v: Vector2): void;
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
        static zero(): Vector2;
        x: FixedPoint;
        y: FixedPoint;
        constructor(x?: FixedPoint | number, y?: FixedPoint | number);
        add(other: Vector2): Vector2;
        sub(other: Vector2): Vector2;
        mul(scalar: FixedPoint | number): Vector2;
        div(scalar: FixedPoint | number): Vector2;
        set(x: FixedPoint, y: FixedPoint): Vector2;
        setR(value: Vector2): Vector2;
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
        /** 计算两个向量的叉积 */
        crossR(other: FixedPoint): FixedPoint;
        /** 计算到另一个向量的距离 */
        distanceTo(other: Vector2): FixedPoint;
        /** 获取当前向量逆时针旋转90度的垂直向量 */
        perp(): Vector2;
        /** 获取当前向量顺时针旋转90度的垂直向量 */
        perpR(): Vector2;
        lengthSq(): FixedPoint;
        /**
        * 创建一个包含指定向量反转的新Vector2
        * @returns 矢量反演的结果
        */
        negate(): Vector2;
        /**
        * 创建一个包含指定向量反转的新Vector2
        * @param value
        * @returns 矢量反演的结果
        */
        static negate(value: Vector2): Vector2;
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
        dependencies: ComponentConstructor<Component>[];
        private _bounds;
        isColliding: boolean;
        private _transform;
        readonly transform: Transform;
        getBounds(): Bounds;
        setBounds(bounds: Bounds): void;
        intersects(other: Collider): boolean;
        contains(other: Collider): boolean;
    }
}
declare module gs.physics {
    class BoxCollider extends Collider {
        private size;
        onInitialize(size: Size): void;
    }
}
declare module gs.physics {
    class CircleCollider extends Collider {
        private radius;
        onInitialize(radius: FixedPoint): void;
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
        accept(visitor: BoundsVisitor): void;
    }
}
declare module gs.physics {
    interface BoundsVisitor {
        visitBox(box: BoxBounds): void;
        visitCircle(circle: CircleBounds): void;
        visitPolygon(polygon: PolygonBounds): void;
    }
}
declare module gs.physics {
    class BoxBounds implements Bounds {
        position: Vector2;
        width: FixedPoint;
        height: FixedPoint;
        entity: Entity;
        constructor(position: Vector2, width: FixedPoint, height: FixedPoint, entity: Entity);
        /**
         * 计算方形在指定方向上的投影
         * @param direction
         * @returns
         */
        project(direction: Vector2): Projection;
        intersects(other: Bounds): boolean;
        contains(other: Bounds): boolean;
        accept(visitor: BoundsVisitor): void;
    }
}
declare module gs.physics {
    class CircleBounds implements Bounds {
        position: Vector2;
        width: FixedPoint;
        height: FixedPoint;
        entity: Entity;
        radius: FixedPoint;
        constructor(position: Vector2, radius: FixedPoint, entity: Entity);
        intersects(other: Bounds): boolean;
        contains(other: Bounds): boolean;
        accept(visitor: BoundsVisitor): void;
    }
}
declare module gs.physics {
    class ContainVisitor implements BoundsVisitor {
        private other;
        private result;
        constructor(other: Bounds);
        visitBox(box: BoxBounds): void;
        visitCircle(circle: CircleBounds): void;
        visitPolygon(polygon: PolygonBounds): void;
        getResult(): boolean;
    }
}
declare module gs.physics {
    class IntersectionVisitor implements BoundsVisitor {
        private other;
        private result;
        constructor(other: Bounds);
        visitBox(box: BoxBounds): void;
        visitCircle(circle: CircleBounds): void;
        visitPolygon(polygon: PolygonBounds): void;
        intersectsBoxCircle(box: BoxBounds, circle: CircleBounds): boolean;
        intersectsPolygonCircle(polygon: PolygonBounds, circle: CircleBounds): boolean;
        intersectsPolygonBox(polygon: PolygonBounds, box: BoxBounds): boolean;
        getResult(): boolean;
    }
}
declare module gs.physics {
    class PolygonBounds implements Bounds {
        private _vertices;
        position: Vector2;
        width: FixedPoint;
        height: FixedPoint;
        entity: Entity;
        readonly vertices: Vector2[];
        /**
         * 提供一个方向，返回多边形在该方向上的最远点
         * @param direction
         * @returns
         */
        getFarthestPointInDirection(direction: Vector2): Vector2;
        /**
         * 计算多边形在指定方向上的投影
         * @param direction
         * @returns
         */
        project(direction: Vector2): Projection;
        containsPoint(point: Vector2): boolean;
        intersects(other: Bounds): boolean;
        contains(other: Bounds): boolean;
        accept(visitor: BoundsVisitor): void;
    }
}
