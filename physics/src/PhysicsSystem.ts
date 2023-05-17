module gs.physics {
    export class PhysicsSystem extends System {
        engine: PhysicsEngine;

        constructor(entityManager: EntityManager, boundary: Rectangle = new Rectangle(0, 0, 1000, 1000), capacity: number = 4, cellSize: number = 10) {
            super(entityManager, 0, Matcher.empty().all(PhysicsComponent));
            this.engine = new PhysicsEngine(boundary, capacity, cellSize);
        }

        protected onComponentAdded(entity: Entity, component: Component): void {
            if (component instanceof PhysicsComponent) {
                this.engine.addObject(entity.getId(), component.aabb);
            }
        }

        protected onComponentRemoved(entity: Entity, component: Component): void {
            this.engine.removeObject(entity.getId());
        }

        update(entities: Entity[]): void {
            for (let entity of entities) {
                let physics = entity.getComponent(PhysicsComponent);
                if (physics) {
                    
                }
            }

            // 运行物理引擎
            const dt = TimeManager.getInstance().deltaTime;
            this.engine.step(dt);
        }
    }
}