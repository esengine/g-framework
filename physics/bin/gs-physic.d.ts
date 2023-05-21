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
        spatialHash: SpatialHash<Bounds>;
        private processed;
        private collisionPairs;
        constructor(entityManager: EntityManager, cellSize?: number);
        update(entities: Entity[]): void;
        isColliding(bounds1: BoxBounds, bounds2: BoxBounds): boolean;
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
        subtract(other: Vector2): Vector2;
        multiply(scalar: number): Vector2;
        divide(scalar: number): Vector2;
        multiplyScalar(scalar: number): Vector2;
        divideScalar(scalar: number): Vector2;
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
        private cellSize;
        gravity: FixedPoint;
        timeStep: FixedPoint;
        bodies: RigidBody[];
        name: string;
        constructor(gravity: FixedPoint, timeStep: FixedPoint, cellSize: number);
        onInit(core: Core): void;
        onUpdate(deltaTime: number): void;
        addBody(body: RigidBody): void;
        step(): void;
    }
}
declare module gs.physics {
    class Collider extends Component {
        isColliding: boolean;
        getBounds(): Bounds;
    }
}
declare module gs.physics {
    class BoxCollider extends Collider {
        private size;
        private transform;
        dependencies: ComponentConstructor<Component>[];
        onInitialize(size: Size): void;
        getBounds(): BoxBounds;
    }
}
declare module gs.physics {
    class Circle implements CircleBounds {
        position: Vector2;
        radius: FixedPoint;
        entity: Entity;
        readonly width: FixedPoint;
        readonly height: FixedPoint;
        /**
         * 计算圆形面积
         * @returns
         */
        area(): FixedPoint;
        /**
         * 计算圆形周长
         * @returns
         */
        circumference(): FixedPoint;
        /**
         * 判断点是否在圆内
         * @param point
         * @returns
         */
        containsPoint(point: Vector2): boolean;
        /**
         * 判断两个圆是否相交
         * @param other
         * @returns
         */
        intersects(other: Circle): boolean;
    }
}
declare module gs.physics {
    class Rectangle implements BoxBounds {
        position: Vector2;
        width: FixedPoint;
        height: FixedPoint;
        entity: Entity;
        /**
         * 计算矩形面积
         * @returns
         */
        area(): FixedPoint;
        /**
         * 判断点是否在矩形内
         * @param point
         * @returns
         */
        containsPoint(point: Vector2): boolean;
        /**
         * 判断两个矩形是否相交
         * @param rect
         * @returns
         */
        intersects(rect: Bounds): boolean;
    }
}
declare module gs.physics {
    interface Bounds {
        position: Vector2;
        width: FixedPoint;
        height: FixedPoint;
        entity: Entity;
    }
}
declare module gs.physics {
    interface BoxBounds extends Bounds {
    }
}
declare module gs.physics {
    interface CircleBounds extends Bounds {
        radius: FixedPoint;
    }
}
