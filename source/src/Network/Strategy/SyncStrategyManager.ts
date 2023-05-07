module gs {
    /**
     * 同步策略管理器类
     */
    export class SyncStrategyManager {
        private strategy: ISyncStrategy;

        /**
         * 构造函数
         * @param strategy - 同步策略实现
         */
        constructor(strategy: ISyncStrategy) {
            // 将传入的策略实现赋值给私有变量
            this.strategy = strategy;
        }

        /**
         * 发送状态方法
         * @param state - 需要发送的状态对象
         */
        sendState(state: any): void {
            this.strategy.sendState(state);
        }

        /**
         * 接收状态方法
         * @param state - 接收到的状态对象
         */
        receiveState(state: any): void {
            this.strategy.receiveState(state);
        }

        /**
         * 处理状态更新方法
         * @param deltaTime - 时间增量
         */
        handleStateUpdate(deltaTime: number): void {
            this.strategy.handleStateUpdate(deltaTime);
        }

        /**
         * 设置策略方法
         * @param strategy - 新的同步策略实现
         */
        setStrategy(strategy: ISyncStrategy): void {
            this.strategy = strategy;
        }
    }
}