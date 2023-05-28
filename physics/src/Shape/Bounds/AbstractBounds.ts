module gs.physics {
    export abstract class AbstractBounds implements Bounds {
        position: Vector2;
        width: FixedPoint;
        height: FixedPoint;
        entity: Entity;

        constructor(position: Vector2, width: FixedPoint, height: FixedPoint, entity: Entity) {
            this.position = position;
            this.width = width;
            this.height = height;
            this.entity = entity;
        }

        intersects(other: Bounds): boolean {
            const visitor = new IntersectionVisitor(other);
            this.accept(visitor);
            return visitor.getResult();
        }

        contains(other: Bounds): boolean {
            const visitor = new ContainVisitor(other);
            this.accept(visitor);
            return visitor.getResult();
        }
        
        calculatePenetrationDepthAndNormal(other: Bounds): { penetrationDepth: FixedPoint; collisionNormal: Vector2; } {
            const visitor = new CollisionResolver(other);
            this.accept(visitor);
            return visitor.getResult();
        }

        abstract accept(visitor: BoundsVisitor): void;
    }
}