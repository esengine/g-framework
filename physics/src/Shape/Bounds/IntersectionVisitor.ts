module gs.physics {
    export class IntersectionVisitor implements BoundsVisitor {
        private other: Bounds;
        private result: boolean;

        constructor(other: Bounds) {
            this.other = other;
            this.result = false;
        }

        visitBox(box: BoxBounds): void {
            if (this.other instanceof BoxBounds) {
                const otherBox = this.other;
                this.result = !(box.position.x.add(box.width).lt(otherBox.position.x) ||
                    otherBox.position.x.add(otherBox.width).lt(box.position.x) ||
                    box.position.y.add(box.height).lt(otherBox.position.y) ||
                    otherBox.position.y.add(otherBox.height).lt(box.position.y));
            } else if (this.other instanceof CircleBounds) {
                this.result = this.intersectsBoxCircle(box, this.other);
            } else if(this.other instanceof PolygonBounds) {
                this.result = this.intersectsPolygonBox(this.other, box);
            }
        }

        visitCircle(circle: CircleBounds): void {
            if (this.other instanceof CircleBounds) {
                const otherCircle = this.other;
                const dx = circle.position.x.toFloat() - otherCircle.position.x.toFloat();
                const dy = circle.position.y.toFloat() - otherCircle.position.y.toFloat();
                const distance = Math.sqrt(dx * dx + dy * dy);
                this.result = distance < circle.radius.toFloat() + otherCircle.radius.toFloat();
            } else if (this.other instanceof BoxBounds) {
                this.result = this.intersectsBoxCircle(this.other, circle);
            } else if(this.other instanceof PolygonBounds) {
                this.result = this.intersectsPolygonCircle(this.other, circle);
            }
        }

        visitPolygon(polygon: PolygonBounds): void {
            if (this.other instanceof PolygonBounds) {
                const otherPolygon = this.other;
                const detector = new PolygonCollisionDetector(polygon, otherPolygon);
                this.result = detector.gjk();
            } else if (this.other instanceof CircleBounds) {
                // 处理多边形与圆形的相交
                this.result = this.intersectsPolygonCircle(polygon, this.other);
            } else if (this.other instanceof BoxBounds) {
                // 处理多边形与方形的相交
                this.result = this.intersectsPolygonBox(polygon, this.other);
            }
        }

        intersectsBoxCircle(box: BoxBounds, circle: CircleBounds): boolean {
            const circleDistanceX = circle.position.x.sub(box.position.x.add(box.width.div(2))).abs();
            const circleDistanceY = circle.position.y.sub(box.position.y.add(box.height.div(2))).abs();

            if (circleDistanceX.gte(box.width.div(2).add(circle.radius))) { return false; }
            if (circleDistanceY.gte(box.height.div(2).add(circle.radius))) { return false; }

            if (circleDistanceX.lte(box.width.div(2))) { return true; }
            if (circleDistanceY.lte(box.height.div(2))) { return true; }

            const cornerDistanceSq = circleDistanceX.sub(box.width.div(2)).pow(2).add(circleDistanceY.sub(box.height.div(2)).pow(2));
            return cornerDistanceSq.lte(circle.radius.pow(2));
        }

        intersectsPolygonCircle(polygon: PolygonBounds, circle: CircleBounds): boolean {
            // 找到最近的顶点
            let minDistanceSq = Infinity;
            let nearestVertex: Vector2 = null;
            for (let vertex of polygon.vertices) {
                let distanceSq = vertex.sub(circle.position).lengthSq().toFloat();
                if (distanceSq < minDistanceSq) {
                    minDistanceSq = distanceSq;
                    nearestVertex = vertex;
                }
            }
        
            // 判断该顶点到圆心的距离是否小于等于圆的半径
            if (nearestVertex) {
                return nearestVertex.sub(circle.position).lengthSq().toFloat() <= Math.pow(circle.radius.toFloat(), 2);
            } else {
                return false;
            }
        }

        intersectsPolygonBox(polygon: PolygonBounds, box: BoxBounds): boolean {
            // 四个方向向量，表示方形的四个边
            const directions = [
                new Vector2(1, 0),   // 右
                new Vector2(0, 1),   // 上
                new Vector2(-1, 0),  // 左
                new Vector2(0, -1)   // 下
            ];
        
            // 添加多边形的每条边的方向向量
            for (let i = 0; i < polygon.vertices.length; i++) {
                const vertex1 = polygon.vertices[i];
                const vertex2 = polygon.vertices[(i+1) % polygon.vertices.length]; // 下一个顶点，考虑到最后一个顶点和第一个顶点的边
                const edge = vertex2.sub(vertex1);
                directions.push(edge.normalize().perp()); // 取这条边的单位法线向量
            }
        
            // 对每个方向进行投影检查
            for (let direction of directions) {
                const polygonProjection = polygon.project(direction);
                const boxProjection = box.project(direction);
                if (!polygonProjection.overlaps(boxProjection)) { // 如果在某个方向上的投影没有重叠，那么多边形和方形不相交
                    return false;
                }
            }
        
            // 所有方向上的投影都有重叠，所以多边形和方形相交
            return true;
        }

        getResult(): boolean {
            return this.result;
        }
    }
}
