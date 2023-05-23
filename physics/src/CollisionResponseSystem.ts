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
            dynamicTree.clear();
            processed.clear();
            collisionPairs.length = 0;

            const nodeEntityMap: Map<DynamicTreeNode, Entity> = new Map();

            const boundsArray: DynamicTreeNode[] = [];
            for (const entity of entities) {
                const collider = entity.getComponent(Collider);
                if (!collider) continue;
                const bounds = collider.getBounds();
                const node: DynamicTreeNode = {
                    children: [], 
                    height: 0, 
                    leaf: true, 
                    minX: bounds.position.x.toFloat(), 
                    minY: bounds.position.y.toFloat(), 
                    maxX: FixedPoint.add(bounds.position.x, bounds.width).toFloat(), 
                    maxY: FixedPoint.add(bounds.position.y, bounds.height).toFloat()
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
            
                const candidates = dynamicTree.search(node);
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
