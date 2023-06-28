// 创建系统
class MoveSystem extends gs.System {
    entityFilter(entity: gs.Entity): boolean {
        return entity.hasComponent(PositionComponent) && entity.hasComponent(VelocityComponent);
    }

    update(entities: gs.Entity[]): void {
        const deltaTime = gs.TimeManager.getInstance().deltaTime;
        for (const entity of entities) {
            const position = entity.getComponent(PositionComponent);
            const velocity = entity.getComponent(VelocityComponent);

            position.x += velocity.x * deltaTime;
            position.y += velocity.y * deltaTime;
        }
    }
}