module gs.physics {
    export interface Bounds {
        position: Vector2;
        width: FixedPoint;
        height: FixedPoint;
        entity: Entity;

        intersects(other: Bounds): boolean;
        contains(other: Bounds): boolean;
        calculatePenetrationDepthAndNormal(other: Bounds): { penetrationDepth: FixedPoint, collisionNormal: Vector2 }

        accept(visitor: BoundsVisitor): void;
    }
}