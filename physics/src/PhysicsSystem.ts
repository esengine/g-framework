module gs {
    export class PhysicsSystem extends System {
        engine: PhysicsEngine;

        constructor(entityManager: EntityManager, engine: PhysicsEngine) {
            super(entityManager, 0, Matcher.empty().all(PhysicsComponent));
            this.engine = engine;
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