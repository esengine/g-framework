module gs {
    /**
     * 快照插值策略
     */
    export class SnapshotInterpolationStrategy implements ISyncStrategy {
        private snapshotQueue: Array<any> = [];

        private onInterpolation: (prevSnapshot: any, nextSnapshot: any) => void;

        setInterpolationCallback(callback: (prevSnapshot: any, nextSnapshot: any) => void): void {
            this.onInterpolation = callback;
        }
        /**
         * 发送游戏状态
         * @param state 
         */
        sendState(state: any): void {
        }

        /**
         * 在收到新的快照时将其添加到快照队列中
         * @param state 
         */
        receiveState(state: any): void {
            this.snapshotQueue.push(state);
        }

        handleStateUpdate(state: any): void {
            if (this.snapshotQueue.length < 2) {
                // 至少需要2个快照才能执行插值
                return;
            }

            const prevSnapshot = this.snapshotQueue[0];
            const nextSnapshot = this.snapshotQueue[1];
            if (prevSnapshot.timestamp == nextSnapshot.timestamp) {
                this.snapshotQueue.shift();
                return;
            }

            // 调用用户自定义的插值回调方法
            if (this.onInterpolation) {
                this.onInterpolation(prevSnapshot, nextSnapshot);
            }

            this.snapshotQueue.shift();
        }
    }
}