module gs {
    export class LinearInterpolationStrategy implements InterpolationStrategy {
        interpolate(prevSnapshot: any, nextSnapshot: any, progress: number): any {
            if (prevSnapshot && nextSnapshot) {
                const interpolatedState = {};

                // 遍历快照中的所有属性
                for (const key in prevSnapshot) {
                    if (typeof prevSnapshot[key] === 'object' && typeof nextSnapshot[key] === 'object') {
                        // 递归处理嵌套属性
                        interpolatedState[key] = this.interpolate(prevSnapshot[key], nextSnapshot[key], progress);
                    } else if (typeof prevSnapshot[key] === 'number' && typeof nextSnapshot[key] === 'number') {
                        interpolatedState[key] = prevSnapshot[key] + (nextSnapshot[key] - prevSnapshot[key]) * progress;
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