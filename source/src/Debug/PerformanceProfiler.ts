module gs {
    export class PerformanceProfiler {
        private static instance: PerformanceProfiler;
        private performanceData: Record<string, any>;
        private frameCount: number;
        private totalTime: number;
        private maxFrameTime: number;
        private minFrameTime: number;

        private constructor() {
            this.performanceData = {};
            this.frameCount = 0;
            this.totalTime = 0;
            this.maxFrameTime = 0;
            this.minFrameTime = Infinity;
        }

        static getInstance(): PerformanceProfiler {
            if (!PerformanceProfiler.instance) {
                PerformanceProfiler.instance = new PerformanceProfiler();
            }
            return PerformanceProfiler.instance;
        }

        startFrame() {
            if (Debug.isEnabled) {
                this.performanceData['frameStart'] = performance.now();
            }
        }

        endFrame() {
            if (Debug.isEnabled) {
                const frameStart = this.performanceData['frameStart'];
                if (frameStart) {
                    const frameTime = performance.now() - frameStart;
                    this.totalTime += frameTime;
                    this.frameCount++;
                    this.maxFrameTime = Math.max(this.maxFrameTime, frameTime);
                    this.minFrameTime = Math.min(this.minFrameTime, frameTime);
                    console.log(`帧时间: ${frameTime}ms`);
                }
            }
        }

        reportPerformance() {
            if (Debug.isEnabled) {
                const averageFrameTime = this.totalTime / this.frameCount;
                const averageFrameRate = 1000 / averageFrameTime;
                console.log(`平均帧时间: ${averageFrameTime}ms 在 ${this.frameCount} 帧`);
                console.log(`平均帧率: ${averageFrameRate} FPS`);
                console.log(`最大帧时间: ${this.maxFrameTime}ms`);
                console.log(`最小帧时间: ${this.minFrameTime}ms`);
            }
        }
    }

}