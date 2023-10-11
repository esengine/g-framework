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

            const xIn = velocity.x * deltaTime;
            const yIn = velocity.y * deltaTime;
            position.x += xIn;
            position.y += yIn;

            if (xIn != 0 || yIn != 0)
                position.markUpdated(lastSnapshotVersion + 1);
        }
    }
}