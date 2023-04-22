///<reference path="../Core/System.ts" />
module gs {
    export class StateMachineSystem extends System {
        constructor(entityManager: EntityManager) {
            super(entityManager, 1);
        }

        entityFilter(entity: Entity): boolean {
            return entity.hasComponent(StateMachineComponent);
        }

        update(entities: Entity[]): void {
            for (const entity of entities) {
                const stateMachineComponent = entity.getComponent(StateMachineComponent) as StateMachineComponent;
                stateMachineComponent.stateMachine.update();
            }
        }
    }
}
