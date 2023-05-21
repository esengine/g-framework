module gs.physics {
    export class CollisionResponseSystem extends System {
        spatialHash: SpatialHash<Bounds>;
        private processed: Map<number, Set<number>> = new Map();

        constructor(entityManager: EntityManager, cellSize: number = 100) {
            super(entityManager, 0, Matcher.empty().all(RigidBody, Collider));
            this.spatialHash = new SpatialHash<Bounds>(cellSize);
        }

        update(entities: Entity[]): void {
            const { spatialHash, processed } = this;
            spatialHash.clear();
            processed.clear();

            for (const entity of entities) {
                const collider = entity.getComponent(Collider);
                if (!collider) continue;

                const bounds = collider.getBounds();
                spatialHash.insert(bounds);
                collider.isColliding = false;

                const entityId = entity.getId();
                let processedPairs = processed.get(entityId);
                if (!processedPairs) {
                    processedPairs = new Set();
                    processed.set(entityId, processedPairs);
                }
                processedPairs.add(entityId);
                const spatialHashCandidates = spatialHash.retrieve(bounds);

                for (const candidate of spatialHashCandidates) {
                    const candidateId = candidate.entity.getId();
                    if (entityId === candidateId || processedPairs.has(candidateId)) {
                        continue;
                    }

                    const collider2 = candidate.entity.getComponent(Collider);
                    const bounds2 = collider2.getBounds();

                    if (this.isColliding(bounds, bounds2)) {
                        collider.isColliding = true;
                        collider2.isColliding = true;
                        // let body1 = entity.getComponent(RigidBody);
                        // let body2 = candidate.entity.getComponent(RigidBody);
                        // const velocityAfterCollision = this.calculateVelocityAfterCollision(body1, body2);
                        // body1.velocity = velocityAfterCollision.v1;
                        // body2.velocity = velocityAfterCollision.v2;
                    }

                    processedPairs.add(candidateId);
                }
            }
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