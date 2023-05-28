module gs.physics {
    export class PolygonCollisionDetector {
        private shape1: PolygonBounds;
        private shape2: PolygonBounds;

        constructor(shape1: PolygonBounds, shape2: PolygonBounds) {
            this.shape1 = shape1;
            this.shape2 = shape2;
        }

        epa(): Vector2 {
            const edges: Edge[] = [];
            while (true) {
                // 1. 找到到原点最近的边
                let closestEdge = edges[0];
                for (let edge of edges) {
                    if (edge.distance.lt(closestEdge.distance)) {
                        closestEdge = edge;
                    }
                }

                // 2. 计算该边的法线方向，并求解support点
                let normal = closestEdge.pointB.sub(closestEdge.pointA).perp();
                let newPoint = this.support(normal);

                // 3. 检查新的support点是否带来了明显的改进
                let improvement = newPoint.sub(closestEdge.pointA).dot(normal);
                if (improvement.lte(0) || newPoint.distanceTo(Vector2.zero()).sub(closestEdge.distance).lte(0)) {
                    // 新的support点没有带来明显的改进，所以我们可以停止了
                    return normal.mul(closestEdge.distance);
                } else {
                    // 将新的support点添加到多边形中
                    this.addPointToPolytope(edges, newPoint);
                }
            }
        }

        gjk(): boolean {
            let direction = new Vector2(1, 0);  // 可以从任意非零向量开始
            let simplex = new Simplex();

            simplex.add(this.support(direction));

            Vector2.negate(direction);  // 反向

            while (true) {
                simplex.add(this.support(direction));

                if (simplex.vertices[0].dot(direction).toFloat() <= 0) {
                    return false;  // 没有碰撞
                } else {
                    // 更新方向
                    if (this.updateSimplexAndDirection(simplex, direction)) {
                        return true;  // 发现碰撞
                    }
                }
            }
        }

        private updateSimplexAndDirection(simplex: Simplex, direction: Vector2): boolean {
            if (simplex.vertices.length === 2) {
                // Simplex是一条线段
                let B = simplex.vertices[1];
                let A = simplex.vertices[0];
                let AO = A.negate();
                let AB = B.sub(A);

                // 更新方向
                if (AB.cross(AO).gt(0)) {
                    // 右手侧
                    direction.setR(AB.perp().negate());
                } else {
                    // 左手侧或者前方
                    direction.setR(AB.perp());
                }
            } else if (simplex.vertices.length === 3) {
                // Simplex是一个三角形
                let C = simplex.vertices[2];
                let B = simplex.vertices[1];
                let A = simplex.vertices[0];
                let AO = A.negate();
                let AB = B.sub(A);
                let AC = C.sub(A);
                let ABC = AB.cross(AC);

                // 更新方向
                if (AB.cross(AO).gt(0)) {
                    // 在AB边的外侧
                    simplex.vertices.splice(2, 1);  // 删除C
                    direction.setR(AB.perp().negate());  // 沿着AB边，指向原点O
                } else if (AC.cross(AO).gt(0)) {
                    // 在AC边的外侧
                    simplex.vertices.splice(1, 1);  // 删除B
                    direction.setR(AC.perp());  // 沿着AC边，指向原点O
                } else {
                    // A点在三角形ABC中
                    return true;
                }
            }

            return false;
        }

        private addPointToPolytope(edges: Edge[], newPoint: Vector2) {
            let edgesToRemove = [];

            for (let i = 0; i < edges.length; i++) {
                let edge = edges[i];
                let A = edge.pointA;
                let B = edge.pointB;

                let AB = B.sub(A);
                let AP = newPoint.sub(A);

                // 计算叉积
                let crossProduct = AB.cross(AP);

                // 如果叉积大于0，新点在边AB的逆时针方向
                if (crossProduct.gt(0)) {
                    edgesToRemove.push(edge);
                }
            }

            // 移除所有新点在逆时针方向上的边
            for (let edge of edgesToRemove) {
                let index = edges.indexOf(edge);
                if (index !== -1) {
                    edges.splice(index, 1);
                }
            }

            // 对于每条被移除的边，从其顶点到新点创建两条新边
            for (let edge of edgesToRemove) {
                edges.push(new Edge(edge.point1, newPoint));
                edges.push(new Edge(newPoint, edge.point2));
            }
        }

        private support(direction: Vector2): Vector2 {
            let pointOnShape1 = this.shape1.getFarthestPointInDirection(direction);
            let pointOnShape2 = this.shape2.getFarthestPointInDirection(direction.negate());
            return pointOnShape1.sub(pointOnShape2);
        }
    }
}