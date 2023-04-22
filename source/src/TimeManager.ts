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

        private constructor() {
            this.deltaTime = 0;
            this.timeScale = 1;
            this.totalTime = 0;
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
        }
    }
}
