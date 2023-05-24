module gs.physics {
    export class CollisionResponseSystem extends System {
        dynamicTree: DynamicTree;
        private processed: Map<number, Set<number>> = new Map();
        private collisionPairs: [Entity, Entity][] = [];

        constructor(entityManager: EntityManager, updateInterval: number) {
            super(entityManager, 0, Matcher.empty().all(RigidBody, Collider));
            this.dynamicTree = new DynamicTree();
            this.updateInterval = updateInterval;
        }

        update(entities: Entity[]): void {
            const { dynamicTree, processed, collisionPairs } = this;
            dynamicTree.clear();
            processed.clear();
            collisionPairs.length = 0;

            const nodeEntityMap: Map<DynamicTreeNode, Entity> = new Map();

            const boundsArray: DynamicTreeNode[] = [];
            for (const entity of entities) {
                const collider = entity.getComponent(Collider);
                if (!collider) continue;
                const node: DynamicTreeNode = {
                    children: [], 
                    height: 0, 
                    leaf: true, 
                    collider: collider
                };
                boundsArray.push(node);
                nodeEntityMap.set(node, entity);
                collider.isColliding = false;
            }

            dynamicTree.load(boundsArray);

            for (const node of boundsArray) {
                const entity = nodeEntityMap.get(node);
                const entityId = entity.getId();
                let processedPairs = processed.get(entityId);
                if (!processedPairs) {
                    processedPairs = new Set();
                    processed.set(entityId, processedPairs);
                }
            
                const candidates = dynamicTree.search(node.collider);
                for (const candidate of candidates) {
                    const candidateEntity = nodeEntityMap.get(candidate);
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

                collider.isColliding = true;
                collider2.isColliding = true;
            }
        }
    }
}
