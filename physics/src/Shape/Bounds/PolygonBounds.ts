module gs.physics {
    export class PolygonBounds implements Bounds {
        private _vertices: Vector2[];

        position: Vector2;
        width: FixedPoint;
        height: FixedPoint;
        entity: Entity;

        /**
         * 提供一个方向，返回多边形在该方向上的最远点
         * @param direction 
         * @returns 
         */
        public getFarthestPointInDirection(direction: Vector2): Vector2 {
            let maxDotProduct = -Infinity;
            let farthestVertex = null;

            for (let vertex of this._vertices) {
                let dotProduct = vertex.dot(direction).toFloat();

                if (dotProduct > maxDotProduct) {
                    maxDotProduct = dotProduct;
                    farthestVertex = vertex;
                }
            }

            return farthestVertex;
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
            visitor.visitPolygon(this);
        }
    }
}