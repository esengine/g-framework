module gs {
    export class InputManager {
        private entityManager: EntityManager;
        private adapter?: InputAdapter;
        private inputBuffer: InputBuffer;
        /** 输入历史记录队列 */
        private inputHistory: Array<{ frameNumber: number, input: InputEvent }> = [];
        private historySizeThreshold = 1000;

        private eventListeners: Array<(event: InputEvent) => void> = [];

        constructor(entityManager: EntityManager) {
            this.entityManager = entityManager;
            this.inputBuffer = new InputBuffer();
        }

        public setHistorySizeThreshold(threshold: number): void {
            this.historySizeThreshold = threshold;
        }

        public addEventListener(callback: (event: InputEvent) => void): void {
            this.eventListeners.push(callback);
        }

        public setAdapter(adapter: InputAdapter): void {
            this.adapter = adapter;
        }

        public sendInput(event: InputEvent): void {
            this.handleInput(event);
        }

        private handleInput(event: InputEvent) {
            this.inputBuffer.addEvent(event);
            // 将输入和当前帧编号存储在输入历史记录中
            this.inputHistory.push({ frameNumber: this.getCurrentFrameNumber(), input: event });

            // 触发输入事件监听器
            this.eventListeners.forEach(listener => listener(event));

            // 当输入历史记录数量超过阈值时，删除最旧的事件
            if (this.inputHistory.length > this.historySizeThreshold) {
                this.inputHistory.splice(0, this.inputHistory.length - this.historySizeThreshold);
            }
        }

        /**
         * 获取当前帧编号的方法
         * @returns 
         */
        private getCurrentFrameNumber(): number {
            return this.entityManager.getCurrentFrameNumber();
        }

        public getInputBuffer(): InputBuffer {
            return this.inputBuffer;
        }

        public getInputHistory(): Array<{ frameNumber: number, input: InputEvent }> {
            return this.inputHistory;
        }
    }
}