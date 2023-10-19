module gs {
    export class SplineInterpolationStrategy implements InterpolationStrategy {
        interpolate(prevSnapshot: any, nextSnapshot: any, progress: number): any {
            if (prevSnapshot && nextSnapshot) {
                const interpolatedState = {};

                // 遍历快照中的所有属性
                for (const key in prevSnapshot) {
                    if (typeof prevSnapshot[key] === 'object' && typeof nextSnapshot[key] === 'object') {
                        // 递归处理嵌套属性
                        interpolatedState[key] = this.interpolate(prevSnapshot[key], nextSnapshot[key], progress);
                    } else if (typeof prevSnapshot[key] === 'number' && typeof nextSnapshot[key] === 'number') {
                        // 使用三次样条插值计算插值后的值
                        const p0 = prevSnapshot[key];
                        const p1 = nextSnapshot[key];
                        const t = progress;

                        const a = p1 - p0;
                        const b = p0;
                        const c = (-3 * p0 + 3 * p1 - 2 * a) / t;
                        const d = (2 * p0 - 2 * p1 + a) / (t * t);

                        interpolatedState[key] = a * t * t * t + b * t * t + c * t + d;
                    } else {
                        // 非数值属性，直接复制
                        interpolatedState[key] = nextSnapshot[key];
                    }
                }

                return interpolatedState;
            } else {
                // 如果无法插值，返回上一个快照
                return prevSnapshot;
            }
        }
    }
}