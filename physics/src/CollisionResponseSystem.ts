module gs.physics {
    export class CollisionResponseSystem extends System {
        spatialHash: SpatialHash<Bounds>;
        private processed: Map<number, Set<number>> = new Map();
        private collisionPairs: [Entity, Entity][] = [];

        constructor(entityManager: EntityManager, cellSize: number = 100) {
            super(entityManager, 0, Matcher.empty().all(RigidBody, Collider));
            this.spatialHash = new SpatialHash<Bounds>(cellSize);
        }

        update(entities: Entity[]): void {
            const { spatialHash, processed, collisionPairs } = this;
            spatialHash.clear();
            processed.clear();
            collisionPairs.length = 0;

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
                
                spatialHash.retrieve(bounds, candidate => {
                    const candidateId = candidate.entity.getId();
                    if (entityId === candidateId || processedPairs.has(candidateId)) {
                        return;
                    }
                    collisionPairs.push([entity, candidate.entity]);
                    processedPairs.add(candidateId);
                });
            }
        
            for (const [entity, candidate] of collisionPairs) {
                const collider = entity.getComponent(Collider);
                const collider2 = candidate.getComponent(Collider);
                const bounds = collider.getBounds();
                const bounds2 = collider2.getBounds();
        
                if (this.isColliding(bounds, bounds2)) {
                    collider.isColliding = true;
                    collider2.isColliding = true;
                }
            }
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