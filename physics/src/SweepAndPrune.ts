module gs {
    /**
     * 扫描排序
     */
    export class SweepAndPrune {
        public static sweepAndPrune(pairs: [AABB, AABB][]): [AABB, AABB][] {
            // 将 AABB 对象提取到一个数组中
            let aabbs: AABB[] = [];
            for (let pair of pairs) {
                aabbs.push(pair[0]);
                aabbs.push(pair[1]);
            }

            // 使用归并排序根据 minX 对 AABB 进行排序
            aabbs = this.mergeSort(aabbs, (a, b) => a.minX - b.minX);

            let potentialCollisions: [AABB, AABB][] = [];

            for (let i = 0; i < aabbs.length; i++) {
                let a = aabbs[i];

                for (let j = i + 1; j < aabbs.length; j++) {
                    let b = aabbs[j];

                    // 如果 b 的 minX 大于 a 的 maxX，那么 b 和后面的物体都不可能和 a 发生碰撞
                    if (b.minX > a.maxX) {
                        break;
                    }

                    // 检查 a 和 b 在 y 轴上是否重叠
                    if (a.minY <= b.maxY && a.maxY >= b.minY) {
                        potentialCollisions.push([a, b]);
                    }
                }
            }

            return potentialCollisions;
        }

        private static mergeSort(aabbs: AABB[], compareFn: (a: AABB, b: AABB) => number): AABB[] {
            if (aabbs.length <= 1) {
                return aabbs;
            }

            const middle = Math.floor(aabbs.length / 2);
            const left = this.mergeSort(aabbs.slice(0, middle), compareFn);
            const right = this.mergeSort(aabbs.slice(middle), compareFn);

            return this.merge(left, right, compareFn);
        }

        private static merge(left: AABB[], right: AABB[], compareFn: (a: AABB, b: AABB) => number): AABB[] {
            let result: AABB[] = [];
            let indexLeft = 0;
            let indexRight = 0;

            while (indexLeft < left.length && indexRight < right.length) {
                if (compareFn(left[indexLeft], right[indexRight]) <= 0) {
                    result.push(left[indexLeft]);
                    indexLeft++;
                } else {
                    result.push(right[indexRight]);
                    indexRight++;
                }
            }

            return result.concat(left.slice(indexLeft)).concat(right.slice(indexRight));
        }
    }
}