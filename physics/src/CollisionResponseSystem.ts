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
                    bounds: collider.getBounds()
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

                const candidates = dynamicTree.search(node.bounds);
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
                const rigidBody = entity.getComponent(RigidBody);
                const rigidBody2 = candidate.getComponent(RigidBody);

                collider.isColliding = true;
                collider2.isColliding = true;

                // 如果两个刚体都是动态的，那么将他们拆开并反转他们的速度
                if (rigidBody && !rigidBody.isKinematic && rigidBody2 && !rigidBody2.isKinematic) {
                    // 反转速度
                    rigidBody.velocity = rigidBody.velocity.mul(new FixedPoint(-1));
                    rigidBody2.velocity = rigidBody2.velocity.mul(new FixedPoint(-1));
                }
            }
        }
    }
}
