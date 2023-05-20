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
        quadTree: QuadTree;
        constructor(entityManager: EntityManager);
        update(entities: Entity[]): void;
        calculateVelocityAfterCollision(body1: RigidBody, body2: RigidBody): {
            v1: Vector2;
            v2: Vector2;
        };
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
        neg(): FixedPoint;
        toFloat(): number;
        static add(a: FixedPoint, b: FixedPoint | number): FixedPoint;
        static subtract(a: FixedPoint, b: FixedPoint | number): FixedPoint;
        static multiply(a: FixedPoint, b: FixedPoint | number): FixedPoint;
        static divide(a: FixedPoint, b: FixedPoint | number): FixedPoint;
        static max(a: FixedPoint, b: FixedPoint): FixedPoint;
        static min(a: FixedPoint, b: FixedPoint): FixedPoint;
    }
}
declare module gs.physics {
    class QuadTree {
        level: number;
        bounds: {
            x: FixedPoint;
            y: FixedPoint;
            width: FixedPoint;
            height: FixedPoint;
        };
        objects: any[];
        nodes: QuadTree[];
        constructor(level: number, bounds: {
            x: FixedPoint;
            y: FixedPoint;
            width: FixedPoint;
            height: FixedPoint;
        });
        split(): void;
        insert(obj: any): void;
        getIndex(obj: any): number;
        retrieve(returnObjects: any[], obj: any): any[];
        clear(): void;
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
        constructor(width: number, height: number);
        add(other: Size): Size;
        subtract(other: Size): Size;
        multiply(scalar: number): Size;
        divide(scalar: number): Size;
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
        constructor(x?: number, y?: number);
        add(other: Vector2): Vector2;
        subtract(other: Vector2): Vector2;
        multiply(scalar: number): Vector2;
        divide(scalar: number): Vector2;
        multiplyScalar(scalar: number): Vector2;
        divideScalar(scalar: number): Vector2;
    }
}
declare module gs.physics {
    class World {
        gravity: FixedPoint;
        timeStep: FixedPoint;
        bodies: RigidBody[];
        size: Size;
        constructor(gravity: FixedPoint, timeStep: FixedPoint, initialSize: Size);
        addBody(body: RigidBody): void;
        updateSize(): void;
        handleBorderCollision(body: RigidBody): void;
        step(): void;
    }
}
declare module gs.physics {
    interface Bounds {
        position: Vector2;
    }
}
declare module gs.physics {
    interface BoxBounds extends Bounds {
        width: FixedPoint;
        height: FixedPoint;
    }
}
declare module gs.physics {
    interface CircleBounds extends Bounds {
        radius: FixedPoint;
    }
}
declare module gs.physics {
    abstract class Collider extends Component {
        abstract getBounds(): Bounds;
    }
}
declare module gs.physics {
    class BoxCollider extends Collider {
        private size;
        private transform;
        onInitialize(size: Size): void;
        getBounds(): BoxBounds;
    }
}
