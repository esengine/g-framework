module gs {
    /**
     * 时间管理器
     */
    export class TimeManager {
        private static instance: TimeManager;
        /**
         * 上一帧到这一帧的时间间隔
         */
        deltaTime: number;
        /**
         * 时间缩放
         */
        timeScale: number;
        /**
         * 游戏运行的总时间
         */
        totalTime: number;

        /**
         * 固定时间步长
         */
        fixedDeltaTime: number;
        accumulatedTime: number = 0;
        isPaused: boolean = false;

        private fixedUpdateCallbacks: ((deltaTime: number) => void)[] = [];

        private constructor() {
            this.deltaTime = 0;
            this.timeScale = 1;
            this.totalTime = 0;

            this.fixedDeltaTime = 1 / 60; // 设定固定更新频率为60次每秒
        }

        public static getInstance(): TimeManager {
            if (!TimeManager.instance) {
                TimeManager.instance = new TimeManager();
            }
            return TimeManager.instance;
        }

        update(deltaTime: number): void {
            this.deltaTime = deltaTime * this.timeScale;
            this.totalTime += this.deltaTime;

            if (!this.isPaused) {
                this.accumulatedTime += deltaTime;

                while (this.accumulatedTime >= this.fixedDeltaTime) {
                    this.fixedUpdate(this.fixedDeltaTime);
                    this.accumulatedTime -= this.fixedDeltaTime;
                }
            }
        }

        fixedUpdate(deltaTime: number): void {
            for (const callback of this.fixedUpdateCallbacks) {
                callback(deltaTime);
            }
        }

        registerFixedUpdate(callback: (deltaTime: number) => void): void {
            this.fixedUpdateCallbacks.push(callback);
        }

        pause(): void {
            this.isPaused = true;
        }

        resume(): void {
            this.isPaused = false;
        }

        isGamePaused(): boolean {
            return this.isPaused;
        }
    }
}
