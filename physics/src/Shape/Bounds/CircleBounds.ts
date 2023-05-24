module gs.physics {
    export class CircleBounds implements Bounds {
        position: Vector2;
        width: FixedPoint;
        height: FixedPoint;
        entity: Entity;
        
        radius: FixedPoint;

        constructor(position: Vector2, radius: FixedPoint, entity: Entity) {
            this.position = position;
            this.radius = radius;
            this.entity = entity;
            this.width = radius.mul(2);
            this.height = radius.mul(2);
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

        accept(visitor: BoundsVisitor): void {
            visitor.visitCircle(this);
        }
    }
}