module gs.physics {
    export class CollisionResolver implements BoundsVisitor {
        private other: Bounds;
        private result: { penetrationDepth: FixedPoint, collisionNormal: Vector2 } = {penetrationDepth: null, collisionNormal: null};

        constructor(other: Bounds) {
            this.other = other;
        }

        visitCircle(bounds: CircleBounds): void {
            this.dispatchCircleCollision(bounds);
        }

        visitBox(bounds: BoxBounds): void {
            this.dispatchBoxCollision(bounds);
        }

        visitPolygon(bounds: PolygonBounds): void {
            this.dispatchPolygonCollision(bounds);
        }

        private dispatchCircleCollision(circle: CircleBounds) {
            if (this.other instanceof CircleBounds) {
                this.resolveCircleCircleCollision(circle, this.other);
            } else if (this.other instanceof BoxBounds) {
                this.resolveCircleBoxCollision(circle, this.other);
            } else if (this.other instanceof PolygonBounds) {
                this.resolveCirclePolygonCollision(circle, this.other);
            }
        }

        private dispatchBoxCollision(box: BoxBounds) {
            if (this.other instanceof CircleBounds) {
                this.resolveCircleBoxCollision(this.other, box);
            } else if (this.other instanceof BoxBounds) {
                this.resolveBoxBoxCollision(box, this.other);
            } else if (this.other instanceof PolygonBounds) {
                this.resolveBoxPolygonCollision(box, this.other);
            }
        }

        private dispatchPolygonCollision(polygon: PolygonBounds) {
            if (this.other instanceof CircleBounds) {
                this.resolveCirclePolygonCollision(this.other, polygon);
            } else if (this.other instanceof BoxBounds) {
                this.resolveBoxPolygonCollision(this.other, polygon);
            } else if (this.other instanceof PolygonBounds) {
                this.resolvePolygonPolygonCollision(polygon, this.other);
            }
        }


        private resolveBoxBoxCollision(box1: BoxBounds, box2: BoxBounds): void {
            this.resolvePolygonPolygonCollision(box1.toPolygon(), box2.toPolygon());
        }

        private resolveCircleBoxCollision(circle: CircleBounds, box: BoxBounds): void {
            let boxToCircle = circle.position.sub(box.center);
            let closestPoint = boxToCircle.clamp(box.halfExtents.negate(), box.halfExtents);
            let circleToClosestPoint = boxToCircle.sub(closestPoint);

            if (circleToClosestPoint.lengthSquared().gt(circle.radius.mul(circle.radius))) {
                return;
            }

            let collisionNormal = circleToClosestPoint.normalize();
            let penetrationDepth = circle.radius.sub(circleToClosestPoint.length());
            this.result = { penetrationDepth: penetrationDepth, collisionNormal: collisionNormal };
        }

        private resolveCirclePolygonCollision(circle: CircleBounds, polygon: PolygonBounds): void {
            let minDistanceSquared = new FixedPoint(Number.MAX_VALUE);
            let collisionNormal: Vector2;
            let penetrationDepth: FixedPoint;

            for (let i = 0; i < polygon.vertices.length; i++) {
                let nextIndex = (i + 1 == polygon.vertices.length) ? 0 : i + 1;
                let edge = polygon.vertices[nextIndex].sub(polygon.vertices[i]);
                let circleToVertex = circle.position.sub(polygon.vertices[i]);

                let t = circleToVertex.dot(edge).div(edge.lengthSquared());
                t = FixedPoint.clamp(t, 0, 1);

                let closestPoint = polygon.vertices[i].add(edge.mul(t));
                let circleToClosestPoint = circle.position.sub(closestPoint);

                let distanceSquared = circleToClosestPoint.lengthSquared();
                if (distanceSquared.lt(minDistanceSquared)) {
                    minDistanceSquared = distanceSquared;
                    collisionNormal = circleToClosestPoint.normalize();
                    penetrationDepth = circle.radius.sub(distanceSquared.sqrt());
                }
            }

            if (minDistanceSquared.gt(circle.radius.mul(circle.radius))) {
                return;
            }

            this.result = { penetrationDepth: penetrationDepth, collisionNormal: collisionNormal };
        }

        private resolveBoxPolygonCollision(box: BoxBounds, polygon: PolygonBounds): void {
            this.resolvePolygonPolygonCollision(box.toPolygon(), polygon);
        }

        private resolveCircleCircleCollision(circle1: CircleBounds, circle2: CircleBounds): void {
            let distance = circle1.position.sub(circle2.position).length();

            if (distance < circle1.radius.add(circle2.radius)) {
                let collisionNormal = circle1.position.sub(circle2.position).normalize();
                let penetrationDepth = circle1.radius.add(circle2.radius).sub(distance);

                this.result = { penetrationDepth: penetrationDepth, collisionNormal: collisionNormal };
            }
        }

        private resolvePolygonPolygonCollision(polygon1: PolygonBounds, polygon2: PolygonBounds): void {
            let minPenetration = new FixedPoint(Number.MAX_VALUE);
            let collisionNormal: Vector2;

            for (let shape of [polygon1, polygon2]) {
                for (let i = 0; i < shape.vertices.length; i++) {
                    let p1 = shape.vertices[i];
                    let p2 = shape.vertices[i + 1 == shape.vertices.length ? 0 : i + 1];

                    let axis = new Vector2(p2.y.sub(p1.y), p1.x.sub(p2.x)).normalize();

                    let minA: FixedPoint = null;
                    let maxA: FixedPoint = null;
                    for (let v of polygon1.vertices) {
                        let projection = axis.dot(v);
                        minA = (minA === null) ? projection : FixedPoint.min(minA, projection);
                        maxA = (maxA === null) ? projection : FixedPoint.max(maxA, projection);
                    }

                    let minB: FixedPoint = null;
                    let maxB: FixedPoint = null;
                    for (let v of polygon2.vertices) {
                        let projection = axis.dot(v);
                        minB = (minB === null) ? projection : FixedPoint.min(minB, projection);
                        maxB = (maxB === null) ? projection : FixedPoint.max(maxB, projection);
                    }

                    let overlap = FixedPoint.min(maxA, maxB).sub(FixedPoint.max(minA, minB));

                    if (overlap.lt(0)) {
                        return;
                    } else {
                        if (overlap.lt(minPenetration)) {
                            minPenetration = overlap;
                            collisionNormal = axis;
                        }
                    }
                }
            }

            this.result = { penetrationDepth: minPenetration, collisionNormal: collisionNormal };
        }

        getResult(): { penetrationDepth: FixedPoint, collisionNormal: Vector2 } {
            return this.result;
        }
    }
}