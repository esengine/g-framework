module gs {
    /**
     * 快照插值策略
     */
    export class SnapshotInterpolationStrategy implements ISyncStrategy {
        private snapshotQueue: Array<any> = [];
        private interpolationTime: number = 0;
        public onInterpolation: (prevSnapshot: any, nextSnapshot: any, progress: number) => void;

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

            const timeManager = TimeManager.getInstance();
            const deltaTime = timeManager.deltaTime * timeManager.timeScale;
            const timeBetweenSnapshots = (nextSnapshot.timestamp - prevSnapshot.timestamp) / 1000; // 将毫秒转换为秒

            this.interpolationTime += deltaTime;

            let interpolationProgress = this.interpolationTime / timeBetweenSnapshots;

            // 确保插值进度在 0 到 1 之间
            interpolationProgress = Math.min(1, interpolationProgress);

            this.interpolateAndUpdateGameState(prevSnapshot, nextSnapshot, interpolationProgress);

            if (this.interpolationTime >= timeBetweenSnapshots) {
                this.snapshotQueue.shift();
                this.interpolationTime = 0; // 重置插值时间
            }
        }

        private interpolateAndUpdateGameState(prevSnapshot: any, nextSnapshot: any, progress: number): void {
            if (this.onInterpolation) {
                this.onInterpolation(prevSnapshot, nextSnapshot, progress);
            }
        }
    }
}