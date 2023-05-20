module gs.physics {
    export class CollisionResponseSystem extends System {
        quadTree: QuadTree<Bounds>;

        constructor(entityManager: EntityManager) {
            super(entityManager, 0, Matcher.empty().all(RigidBody, Collider));
            this.quadTree = new QuadTree<Bounds>(0, { position: new Vector2(0, 0), width: new FixedPoint(1000), height: new FixedPoint(1000) }); //初始化四叉树的大小
        }

        update(entities: Entity[]): void {
            for (let entity of entities) {
                const collider = entity.getComponent(Collider);
                if (collider) {
                    this.quadTree.insert(collider.getBounds());
                    collider.isColliding = false;
                }
            }

            for (let entity of entities) {
                const collider1 = entity.getComponent(Collider);
                if (!collider1) continue;

                const bounds1 = collider1.getBounds();
                let candidates: Set<Bounds> = new Set();
                this.quadTree.retrieve(candidates, bounds1);

                for (let candidate of Array.from(candidates)) {
                    if (candidate.entity.getId() === entity.getId()) { 
                        continue;
                    }

                    const collider2 = candidate.entity.getComponent(Collider);
                    const bounds2 = collider2.getBounds();

                    if (this.isColliding(bounds1, bounds2)) {
                        collider1.isColliding = true;
                        collider2.isColliding = true;
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