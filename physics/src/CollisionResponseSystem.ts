module gs.physics {
    export class CollisionResponseSystem extends System {
        quadTree: QuadTree;

        constructor(entityManager: EntityManager) {
            super(entityManager, 0, Matcher.empty().all(RigidBody).one(BoxCollider));
            this.quadTree = new QuadTree(0, { x: new FixedPoint(0), y: new FixedPoint(0), width: new FixedPoint(1000), height: new FixedPoint(1000) }); //初始化四叉树的大小
        }

        update(entities: Entity[]): void {
            for (let entity of entities) {
                const collider = entity.getComponent(BoxCollider);
                if (collider) {
                    this.quadTree.insert(collider.getBounds());
                }
            }

            for (let entity of entities) {
                const collider1 = entity.getComponent(BoxCollider);
                if (!collider1) continue;

                const bounds1 = collider1.getBounds();
                let candidates = [];
                this.quadTree.retrieve(candidates, bounds1);

                for (let candidate of candidates) {
                    const collider2 = candidate.entity.getComponent(BoxCollider);
                    const bounds2 = collider2.getBounds();

                    if (this.isColliding(bounds1, bounds2)) {
                        const velocityAfterCollision = this.calculateVelocityAfterCollision(
                            entity.getComponent(RigidBody),
                            candidate.entity.getComponent(RigidBody)
                        );

                        entity.getComponent(RigidBody).velocity = velocityAfterCollision.v1;
                        candidate.entity.getComponent(RigidBody).velocity = velocityAfterCollision.v2;
                        
                        const collisionEvent = new CollisionEvent('collision', entity, candidate.entity, velocityAfterCollision);
                        GlobalEventEmitter.emitEvent(collisionEvent);
                    }
                }
            }

            this.quadTree.clear();
        }

        calculateVelocityAfterCollision(body1: RigidBody, body2: RigidBody): { v1: Vector2, v2: Vector2 } {
            const massSum = body1.mass.add(body2.mass);
            const massDiff1 = body1.mass.sub(body2.mass);
            const massDiff2 = body2.mass.sub(body1.mass);
            const massDouble1 = body1.mass.mul(2);
            const massDouble2 = body2.mass.mul(2);

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
                position2.x.gt(position1.x.add(width1)) ||
                position2.x.add(width2).lt(position1.x) ||
                position2.y.gt(position1.y.add(height1)) ||
                position2.y.add(height2).lt(position1.y)
            );
        }
    }

}