module gs {
    export abstract class InputAdapter {
        protected inputManager: InputManager;

        constructor(inputManager: InputManager) {
            this.inputManager = inputManager;
        }

        /**
         * 需要实现此方法以适应使用的游戏引擎
         * @param event 
         */
        abstract handleInputEvent(event: any): void;
    }
}