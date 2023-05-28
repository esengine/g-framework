///<reference path="AbstractBounds.ts"/>
module gs.physics {
    export class CircleBounds extends AbstractBounds {
        radius: FixedPoint;

        constructor(position: Vector2, radius: FixedPoint, entity: Entity) {
            super(position, radius.mul(2), radius.mul(2), entity);
            this.radius = radius;
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