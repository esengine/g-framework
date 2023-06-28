class Player extends gs.Entity {
    onCreate(): void {
        console.log('player 实体创建');
    }

    onDestroy(): void {
        console.log('player 实体销毁');
    }
}