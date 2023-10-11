class MyInputAdapter extends gs.InputAdapter {
    constructor(inputManager: gs.InputManager, private networkAdapter: gs.GNetworkAdapter) {
        super(inputManager);
    }

    // 这个方法将处理游戏引擎或平台特定的输入事件，并将它们转换为通用的 InputEvent 对象
    handleInputEvent(inputEvent: gs.InputEvent[]): void {
        // 将转换后的 InputEvent 发送到 InputManager
        for (let event of inputEvent) {
            this.sendInputToManager(event);
        }
    }

    sendInputEvent(event: any, playerId: string): void {
        // 处理特定的输入事件，例如将它们转换为通用的 InputEvent 对象
        const inputEvent = this.convertEngineEventToInputEvent(event, playerId);

        this.sendInputToManager(inputEvent);
    }

    // 将游戏引擎的输入事件转换为 InputEvent
    private convertEngineEventToInputEvent(event: any, playerId: string): gs.InputEvent {
        let inputEvent: gs.InputEvent = {
            type: 'unknown', // 默认为未知类型
            data: null // 初始化为null，根据需要设置
        };

        if (event.type === 'keydown' || event.type === 'keyup') {
            // 如果事件类型是按键按下或按键松开
            inputEvent.type = 'keyboard'; // 设置为键盘事件类型

            inputEvent.data = {
                key: event.key, // 使用 keyCode 属性获取按下的键码
                isKeyDown: event.type === 'keydown', // 标识按键按下或松开
                playerId: playerId
            };
        }

        return inputEvent;
    }
}