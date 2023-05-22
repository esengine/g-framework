module gs.physics {
    export class CollisionResponseSystem extends System {
        dynamicTree: DynamicTree;
        private processed: Map<number, Set<number>> = new Map();
        private collisionPairs: [Entity, Entity][] = [];

        constructor(entityManager: EntityManager) {
            super(entityManager, 0, Matcher.empty().all(RigidBody, Collider));
            this.dynamicTree = new DynamicTree();
        }

        update(entities: Entity[]): void {
            const { dynamicTree, processed, collisionPairs } = this;
            dynamicTree.optimize();
            processed.clear();
            collisionPairs.length = 0;

            for (const entity of entities) {
                const collider = entity.getComponent(Collider);
                if (!collider) continue;
                const bounds = collider.getBounds();
                dynamicTree.insert(boxBoundsToAABB(bounds), entity);
                collider.isColliding = false;
        
                const entityId = entity.getId();
                let processedPairs = processed.get(entityId);
                if (!processedPairs) {
                    processedPairs = new Set();
                    processed.set(entityId, processedPairs);
                }
                
                const candidates = dynamicTree.queryRange(boxBoundsToAABB(bounds));
                for (const candidate of candidates) {
                    const candidateEntity = candidate;
                    const candidateId = candidateEntity.getId();
                    if (entityId === candidateId || processedPairs.has(candidateId)) {
                        continue;
                    }
                    collisionPairs.push([entity, candidateEntity]);
                    processedPairs.add(candidateId);
                }
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
            const aabb1 = boxBoundsToAABB(bounds1);
            const aabb2 = boxBoundsToAABB(bounds2);
            return aabb1.intersects(aabb2);
        }
    }
}
