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
        private resetForNewFrame;
        private initializeNodesAndEntities;
        private processCollisions;
        private resolveCollisions;
        private handleCollisionExits;
        private resolveDynamicCollision;
    }
}
declare module gs.physics {
    function findItem<T>(item: T, items: T[], equalsFn?: (a: T, b: T) => boolean): number;
    function calcBounds(node: DynamicTreeNode, toBounds: (item: any) => Bounds): void;
    function distBounds(node: DynamicTreeNode, k: number, p: number, toBounds: (item: any) => Bounds, destNode?: DynamicTreeNode): DynamicTreeNode;
    function extend(a: Bounds, b: Bounds): Bounds;
    function compareNodeMinX(a: DynamicTreeNode, b: DynamicTreeNode): FixedPoint;
    function compareNodeMinY(a: DynamicTreeNode, b: DynamicTreeNode): FixedPoint;
    function boundsArea(a: DynamicTreeNode): FixedPoint;
    function boundsMargin(a: DynamicTreeNode): FixedPoint;
    function enlargedArea(a: Bounds, b: Bounds): FixedPoint;
    function intersectionArea(a: Bounds, b: Bounds): FixedPoint;
    function createNode(children: DynamicTreeNode[]): DynamicTreeNode;
    function multiSelect<T>(arr: T[], left: number, right: number, n: number, compare: (a: T, b: T) => FixedPoint): void;
    function quickselect<T>(arr: T[], k: number, left: number, right: number, compare: (a: T, b: T) => FixedPoint): void;
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
    /**
     * FixedPoint 类表示用于物理运算的定点数值。
     * 这种定点数值在游戏和物理模拟中常常用于解决浮点数精度问题。
     */
    class FixedPoint {
        /**
         * 原始值，根据精度扩大的整数
         */
        rawValue: number;
        /**
        * 精度，扩大的倍数，例如1000表示小数点后三位
        */
        precision: number;
        /**
         * 创建一个新的 FixedPoint 实例
         * @param value - 输入的浮点数值，默认为 0
         * @param precision - 指定的精度，默认为 1000
         */
        constructor(value?: number, precision?: number);
        /**
         * 将当前 FixedPoint 实例与另一个 FixedPoint 实例或数字相加
         * @param other - 要添加的其他 FixedPoint 实例或数字
         * @returns 新的 FixedPoint 实例，表示相加的结果
         */
        add(other: FixedPoint | number): FixedPoint;
        /**
         * 将当前 FixedPoint 实例与另一个 FixedPoint 实例或数字相减
         * @param other - 要减去的其他 FixedPoint 实例或数字
         * @returns 新的 FixedPoint 实例，表示相减的结果
         */
        sub(other: FixedPoint | number): FixedPoint;
        /**
         * 将当前 FixedPoint 实例与另一个 FixedPoint 实例或数字相乘
         * @param other - 要相乘的其他 FixedPoint 实例或数字
         * @returns 新的 FixedPoint 实例，表示相乘的结果
         */
        mul(other: FixedPoint | number): FixedPoint;
        /**
         * 将当前 FixedPoint 实例与另一个 FixedPoint 实例或数字相除
         * @param other - 要相除的其他 FixedPoint 实例或数字
         * @returns 新的 FixedPoint 实例，表示相除的结果
         */
        div(other: FixedPoint | number): FixedPoint;
        /**
         * 返回当前 FixedPoint 实例的绝对值
         * @returns 新的 FixedPoint 实例，表示绝对值的结果
         */
        abs(): FixedPoint;
        /**
         * 将当前 FixedPoint 实例的值取指定次方
         * @param exponent - 指定的次方数
         * @returns 新的 FixedPoint 实例，表示次方的结果
         */
        pow(exponent: number): FixedPoint;
        /**
         * 判断当前 FixedPoint 实例是否等于另一个 FixedPoint 实例或数字
         * @param other - 要比较的其他 FixedPoint 实例或数字
         * @returns 如果相等则返回 true，否则返回 false
         */
        equals(other: FixedPoint | number): boolean;
        /**
         * 判断当前 FixedPoint 实例是否小于另一个 FixedPoint 实例或数字
         * @param other - 要比较的其他 FixedPoint 实例或数字
         * @returns 如果小于则返回 true，否则返回 false
         */
        lt(other: FixedPoint | number): boolean;
        /**
         * 判断当前 FixedPoint 实例是否大于另一个 FixedPoint 实例或数字
         * @param other - 要比较的其他 FixedPoint 实例或数字
         * @returns 如果大于则返回 true，否则返回 false
         */
        gt(other: FixedPoint | number): boolean;
        /**
         * 判断当前 FixedPoint 实例是否大于等于另一个 FixedPoint 实例或数字
         * @param other - 要比较的其他 FixedPoint 实例或数字
         * @returns 如果大于等于则返回 true，否则返回 false
         */
        gte(other: FixedPoint | number): boolean;
        /**
         * 判断当前 FixedPoint 实例是否小于等于另一个 FixedPoint 实例或数字
         * @param other - 要比较的其他 FixedPoint 实例或数字
         * @returns 如果小于等于则返回 true，否则返回 false
         */
        lte(other: FixedPoint | number): boolean;
        /**
         * 对当前 FixedPoint 实例的值取反
         * @returns 新的 FixedPoint 实例，表示取反的结果
         */
        negate(): FixedPoint;
        /**
         * 将当前 FixedPoint 实例转换为浮点数
         * @returns 转换后的浮点数
         */
        toFloat(): number;
        /**
         * 将当前 FixedPoint 实例转换为固定位数的字符串
         * @param digits - 指定的小数位数，默认为 0
         * @returns 转换后的字符串
         */
        toFixed(digits?: number): string;
        /**
         * 计算当前 FixedPoint 实例的平方根
         * @returns 新的 FixedPoint 实例，表示平方根的结果
         */
        sqrt(): FixedPoint;
        /**
         * 对当前 FixedPoint 实例进行四舍五入
         * @returns 新的 FixedPoint 实例，表示四舍五入的结果
         */
        round(): FixedPoint;
        /**
         * 对两个 FixedPoint 实例进行加法运算
         * @param a - 第一个 FixedPoint 实例
         * @param b - 第二个 FixedPoint 实例或数字
         * @returns 新的 FixedPoint 实例，表示相加的结果
         */
        static add(a: FixedPoint, b: FixedPoint | number): FixedPoint;
        /**
         * 对两个 FixedPoint 实例进行减法运算
         * @param a - 第一个 FixedPoint 实例
         * @param b - 第二个 FixedPoint 实例或数字
         * @returns 新的 FixedPoint 实例，表示相减的结果
         */
        static sub(a: FixedPoint, b: FixedPoint | number): FixedPoint;
        /**
         * 对两个 FixedPoint 实例进行乘法运算
         * @param a - 第一个 FixedPoint 实例
         * @param b - 第二个 FixedPoint 实例或数字
         * @returns 新的 FixedPoint 实例，表示相乘的结果
         */
        static mul(a: FixedPoint, b: FixedPoint | number): FixedPoint;
        /**
         * 对两个 FixedPoint 实例进行除法运算
         * @param a - 第一个 FixedPoint 实例
         * @param b - 第二个 FixedPoint 实例或数字
         * @returns 新的 FixedPoint 实例，表示相除的结果
         */
        static div(a: FixedPoint, b: FixedPoint | number): FixedPoint;
        /**
         * 比较两个 FixedPoint 实例，返回较大者
         * @param a - 第一个 FixedPoint 实例
         * @param b - 第二个 FixedPoint 实例
         * @returns 较大的 FixedPoint 实例
         */
        static max(a: FixedPoint, b: FixedPoint): FixedPoint;
        /**
         * 比较两个 FixedPoint 实例，返回较小者
         * @param a - 第一个 FixedPoint 实例
         * @param b - 第二个 FixedPoint 实例
         * @returns 较小的 FixedPoint 实例
         */
        static min(a: FixedPoint, b: FixedPoint): FixedPoint;
        /**
         * 从一个原始值和精度创建一个新的 FixedPoint 实例
         * @param rawValue - 原始值，根据精度扩大的整数
         * @param precision - 指定的精度，默认为 1000
         * @returns 新的 FixedPoint 实例
         */
        static fromRawValue(rawValue: number, precision?: number): FixedPoint;
        /**
         * 从一个浮点数创建一个新的 FixedPoint 实例
         * @param value - 输入的浮点数值
         * @param precision - 指定的精度，默认为 1000
         * @returns 新的 FixedPoint 实例
         */
        static from(value: number, precision?: number): FixedPoint;
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
        update(deltaTime: number): void;
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
        isZero(): boolean;
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
        collidingEntities: Set<Entity>;
        onCollisionEnter: (other: Entity) => void;
        onCollisionStay: (other: Entity) => void;
        onCollisionExit: (other: Entity) => void;
        private _transform;
        readonly transform: Transform;
        getBounds(): Bounds;
        setBounds(bounds: Bounds): void;
        handleCollision(other: Entity): void;
        handleCollisionExit(other: Entity): void;
        getCollisionNormal(other: Collider): Vector2;
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
