module gs.physics {
    export class BoxBounds implements Bounds {
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

        accept(visitor: BoundsVisitor): void {
            visitor.visitBox(this);
        }
    }
}