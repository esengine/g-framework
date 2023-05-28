///<reference path="AbstractBounds.ts"/>
module gs.physics {
    export class BoxBounds extends AbstractBounds {
        private _center: Vector2;
        private _halfExtents: Vector2;

        constructor(position: Vector2, width: FixedPoint, height: FixedPoint, entity: Entity) {
            super(position, width, height, entity);
            this._center = new Vector2(this.position.x.add(this.width.div(2)), this.position.y.add(this.height.div(2)));
            this._halfExtents = new Vector2(this.width.div(2), this.height.div(2));
        }

        get center(): Vector2 {
            return this._center;
        }

        get halfExtents(): Vector2 {
            return this._halfExtents;
        }

        public toPolygon(): PolygonBounds {
            const vertices = [
                this.position,
                new Vector2(this.position.x.add(this.width), this.position.y),
                new Vector2(this.position.x.add(this.width), this.position.y.add(this.height)),
                new Vector2(this.position.x, this.position.y.add(this.height)),
            ];
            return new PolygonBounds(this.position, vertices, this.entity);
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

        accept(visitor: BoundsVisitor): void {
            visitor.visitBox(this);
        }
    }
}