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

        /**
         * 计算方形在指定方向上的投影
         * @param direction 
         * @returns 
         */
        public project(direction: Vector2): Projection {
            // 方形的四个顶点
            const vertices = [
                this.position,
                this.position.add(new Vector2(this.width.toFloat(), 0)),
                this.position.add(new Vector2(this.width.toFloat(), this.height.toFloat())),
                this.position.add(new Vector2(0, this.height.toFloat())),
            ];

            let min = Infinity;
            let max = -Infinity;

            for (let vertex of vertices) {
                let dot = vertex.dot(direction).toFloat();
                min = Math.min(min, dot);
                max = Math.max(max, dot);
            }

            return new Projection(min, max);
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