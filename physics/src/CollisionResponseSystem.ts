module gs.physics {
    export class CollisionResponseSystem extends System {
        quadTree: QuadTree<Bounds>;
        private processed: Map<number, Set<number>> = new Map();
        private candidates: Set<Bounds> = new Set();

        constructor(entityManager: EntityManager, position: Vector2, width: FixedPoint, height: FixedPoint) {
            super(entityManager, 0, Matcher.empty().all(RigidBody, Collider));
            this.quadTree = new QuadTree<Bounds>(0, { position: position, width: width, height: height });
        }

        update(entities: Entity[]): void {
            const { quadTree, processed, candidates } = this;

            for (const entity of entities) {
                const collider = entity.getComponent(Collider);
                if (collider) {
                    quadTree.insert(collider.getBounds());
                    collider.isColliding = false;
                }

                const entityId = entity.getId();
                const processedPairs = this.processed.get(entityId);
                if (processedPairs) {
                    processedPairs.clear();
                } else {
                    this.processed.set(entityId, new Set());
                }
                this.processed.get(entityId).add(entityId);
            }


            for (const entity of entities) {
                const collider1 = entity.getComponent(Collider);
                if (!collider1) continue;

                const entityId = entity.getId();
                const bounds1 = collider1.getBounds();
                candidates.clear();
                quadTree.retrieve(candidates, bounds1);

                for (const candidate of candidates) {
                    const candidateId = candidate.entity.getId();
                    if (entityId === candidateId) {
                        continue;
                    }

                    if (this.processed.has(entityId) && this.processed.get(entityId).has(candidateId)) {
                        continue;
                    }

                    const collider2 = candidate.entity.getComponent(Collider);
                    const bounds2 = collider2.getBounds();

                    if (this.isColliding(bounds1, bounds2)) {
                        collider1.isColliding = true;
                        collider2.isColliding = true;
                        // let body1 = entity.getComponent(RigidBody);
                        // let body2 = candidate.entity.getComponent(RigidBody);
                        // const velocityAfterCollision = this.calculateVelocityAfterCollision(body1, body2);
                        // body1.velocity = velocityAfterCollision.v1;
                        // body2.velocity = velocityAfterCollision.v2;
                    }

                    if (!this.processed.has(entityId)) {
                        this.processed.set(entityId, new Set());
                    }
                    this.processed.get(entityId).add(candidateId);
                }
            }

            quadTree.clear();
        }

        calculateVelocityAfterCollision(body1: RigidBody, body2: RigidBody): { v1: Vector2, v2: Vector2 } {
            const massSum = FixedPoint.add(body1.mass, body2.mass);
            const massDiff1 = FixedPoint.sub(body1.mass, body2.mass);
            const massDiff2 = FixedPoint.sub(body2.mass, body1.mass);
            const massDouble1 = FixedPoint.mul(body1.mass, 2);
            const massDouble2 = FixedPoint.mul(body2.mass, 2);

            const v1 = body1.velocity.multiplyScalar(massDiff1.toFloat()).divideScalar(massSum.toFloat())
                .add(body2.velocity.multiplyScalar(massDouble2.toFloat()).divideScalar(massSum.toFloat()));
            const v2 = body1.velocity.multiplyScalar(massDouble1.toFloat()).divideScalar(massSum.toFloat())
                .subtract(body2.velocity.multiplyScalar(massDiff2.toFloat()).divideScalar(massSum.toFloat()));

            return { v1, v2 };
        }

        isColliding(bounds1: BoxBounds, bounds2: BoxBounds): boolean {
            const { position: position1, width: width1, height: height1 } = bounds1;
            const { position: position2, width: width2, height: height2 } = bounds2;

            return !(
                position2.x.gt(FixedPoint.add(position1.x, width1)) ||
                FixedPoint.add(position2.x, width2).lt(position1.x) ||
                position2.y.gt(FixedPoint.add(position1.y, height1)) ||
                FixedPoint.add(position2.y, height2).lt(position1.y)
            );
        }
    }

}