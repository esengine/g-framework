class DrawSystem extends gs.System {
    entityFilter(entity: gs.Entity): boolean {
        return entity.hasTag("player");
    }

    update(entities: gs.Entity[]) {
        const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let entity of entities) {
            let color = entity.getComponent(ColorComponent);
            let position = entity.getComponent(PositionComponent);
            ctx.fillStyle = color.color;
            ctx.fillRect(position.x, position.y, 50, 50);
        }
    }
}