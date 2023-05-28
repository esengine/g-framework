module gs.physics {
    export class CollisionResponseSystem extends System {
        dynamicTree: DynamicTree;
        private processed: Map<number, Set<number>> = new Map();
        private collisionPairs: [Entity, Entity][] = [];

        constructor(entityManager: EntityManager, updateInterval: number) {
            super(entityManager, 0, Matcher.empty().all(RigidBody, Collider, Transform));
            this.dynamicTree = new DynamicTree();
            this.updateInterval = updateInterval;
        }

        update(entities: Entity[]): void {
            this.resetForNewFrame();
            const nodeEntityMap = this.initializeNodesAndEntities(entities);
            this.processCollisions(nodeEntityMap);
        }

        private resetForNewFrame(): void {
            this.dynamicTree.clear();
            this.processed.clear();
            this.collisionPairs.length = 0;
        }

        private initializeNodesAndEntities(entities: Entity[]): Map<DynamicTreeNode, Entity> {
            const nodeEntityMap: Map<DynamicTreeNode, Entity> = new Map();
            const deltaTime = TimeManager.getInstance().deltaTime;
            const boundsArray: DynamicTreeNode[] = [];

            for (const entity of entities) {
                const collider = entity.getComponent(Collider);
                const rigidBody = entity.getComponent(RigidBody);
                const transform = entity.getComponent(Transform);

                if (rigidBody && !rigidBody.isKinematic) {
                    rigidBody.update(deltaTime);
                }

                rigidBody.lastPosition = transform.position;
                const node: DynamicTreeNode = {
                    children: [],
                    height: 0,
                    leaf: true,
                    bounds: collider.getBounds()
                };

                boundsArray.push(node);
                nodeEntityMap.set(node, entity);
            }

            this.dynamicTree.load(boundsArray);

            return nodeEntityMap;
        }

        private processCollisions(nodeEntityMap: Map<DynamicTreeNode, Entity>): void {
            const checkedPairs: Set<string> = new Set();

            for (const node of nodeEntityMap.keys()) {
                const entity = nodeEntityMap.get(node);
                const entityId = entity.getId();

                let processedPairs = this.processed.get(entityId);
                if (!processedPairs) {
                    processedPairs = new Set();
                    this.processed.set(entityId, processedPairs);
                }

                const candidates = this.dynamicTree.search(node.bounds);
                for (const candidate of candidates) {
                    const candidateEntity = nodeEntityMap.get(candidate);
                    const candidateId = candidateEntity.getId();

                    if (entityId === candidateId) {
                        continue;
                    }

                    const idPair = entityId < candidateId ? `${entityId},${candidateId}` : `${candidateId},${entityId}`;

                    if (checkedPairs.has(idPair)) {
                        continue;
                    }

                    this.collisionPairs.push([entity, candidateEntity]);
                    checkedPairs.add(idPair);
                }
            }

            this.resolveCollisions();
        }

        private resolveCollisions(): void {
            const penetrationResolutionFactor = new FixedPoint(0.8);

            for (const [entity, candidate] of this.collisionPairs) {
                const collider = entity.getComponent(Collider);
                const collider2 = candidate.getComponent(Collider);

                const rigidBody = entity.getComponent(RigidBody);
                const rigidBody2 = candidate.getComponent(RigidBody);

                if (rigidBody && !rigidBody.isKinematic && rigidBody2 && !rigidBody2.isKinematic) {
                    const { penetrationDepth, collisionNormal } = collider.calculatePenetrationDepthAndNormal(collider2);
                    if (penetrationDepth && collisionNormal) {
                        this.resolvePBD(rigidBody, rigidBody2, penetrationDepth, collisionNormal, penetrationResolutionFactor);
                        this.resolveDynamicCollision(rigidBody, rigidBody2, collisionNormal);
                    }
                }

                collider.handleCollision(candidate);
                collider2.handleCollision(entity);
            }

            this.handleCollisionExits();
        }

        private handleCollisionExits(): void {
            for (const entitySet of this.processed.values()) {
                for (const entityId of entitySet) {
                    const entity = this.entityManager.getEntity(entityId);
                    const collider = entity.getComponent(Collider);
                    for (const otherEntity of collider.collidingEntities) {
                        if (!entitySet.has(otherEntity.getId())) {
                            collider.handleCollisionExit(otherEntity);
                            otherEntity.getComponent(Collider).handleCollisionExit(entity);
                        }
                    }
                }
            }
        }

        private resolveDynamicCollision(
            rigidBody: RigidBody,
            rigidBody2: RigidBody,
            collisionNormal: Vector2
        ): void {
            const velocityAlongNormal1 = rigidBody.velocity.dot(collisionNormal);
            const velocityAlongNormal2 = rigidBody2.velocity.dot(collisionNormal);

            const newVelocityAlongNormal1 = FixedPoint.div(FixedPoint.add(FixedPoint.mul(velocityAlongNormal1, FixedPoint.sub(rigidBody.mass, rigidBody2.mass)), FixedPoint.mul(FixedPoint.mul(new FixedPoint(2), rigidBody2.mass), velocityAlongNormal2)), FixedPoint.add(rigidBody.mass, rigidBody2.mass));
            const newVelocityAlongNormal2 = FixedPoint.div(FixedPoint.add(FixedPoint.mul(velocityAlongNormal2, FixedPoint.sub(rigidBody2.mass, rigidBody.mass)), FixedPoint.mul(FixedPoint.mul(new FixedPoint(2), rigidBody.mass), velocityAlongNormal1)), FixedPoint.add(rigidBody.mass, rigidBody2.mass));

            rigidBody.velocity = rigidBody.velocity.add(collisionNormal.mul(FixedPoint.sub(newVelocityAlongNormal1, velocityAlongNormal1)));
            rigidBody2.velocity = rigidBody2.velocity.add(collisionNormal.mul(FixedPoint.sub(newVelocityAlongNormal2, velocityAlongNormal2)));
        }

        private resolvePBD(
            rigidBody1: RigidBody,
            rigidBody2: RigidBody,
            penetrationDepth: FixedPoint,
            collisionNormal: Vector2,
            resolutionFactor: FixedPoint
        ): void {
            const positionCorrection = collisionNormal.mul(penetrationDepth.mul(resolutionFactor));
            const totalMass = FixedPoint.add(rigidBody1.mass, rigidBody2.mass);
        
            rigidBody1.transform.position = rigidBody1.transform.position.sub(positionCorrection.mul(FixedPoint.div(rigidBody1.mass, totalMass)));
            rigidBody2.transform.position = rigidBody2.transform.position.add(positionCorrection.mul(FixedPoint.div(rigidBody2.mass, totalMass)));
        }
    }
}
