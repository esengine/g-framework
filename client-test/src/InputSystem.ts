class InputSystem extends gs.System {

    entityFilter(entity: gs.Entity): boolean {
        return entity.hasTag("player");
    }

    update(entities: gs.Entity[]): void {
        const inputBuffer = this.entityManager.getInputManager().getInputBuffer();

        // 处理输入缓冲区中的事件
        while (inputBuffer.hasEvents()) {
            const inputEvent = inputBuffer.consumeEvent();

            // 遍历实体并根据输入事件更新它们
            for (const entity of entities) {
                if (entity instanceof Player && entity.playerId == inputEvent.data.playerId) {
                    this.applyInputToEntity(entity, inputEvent);
                    break;
                }
            }
        }
    }

    private applyInputToEntity(entity: gs.Entity, inputEvent: gs.InputEvent): void {
        if (inputEvent.type == 'keyboard') {
            let velocity = entity.getComponent(VelocityComponent);
            velocity.x = 0;
            velocity.y = 0;
            if (inputEvent.data.isKeyDown) {
                switch (inputEvent.data.key.toLowerCase()) {
                    case 'w':
                        velocity.y = -100;
                        break;
                    case 's':
                        velocity.y = 100;
                        break;
                    case 'a':
                        velocity.x = -100;
                        break;
                    case 'd':
                        velocity.x = 100;
                        break;
                }
            }
        }
    }
}