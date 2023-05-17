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

            aabbs.sort((a, b) => a.minX - b.minX);

            let potentialCollisions: [AABB, AABB][] = [];
            let activeList: AABB[] = [];

            for (let a of aabbs) {
                // 从 activeList 中移除 maxX 小于 a.minX 的 AABB
                activeList = activeList.filter(b => b.maxX > a.minX);

                for (let b of activeList) {
                    // 检查 a 和 b 是否在 y 轴上重叠
                    if (a.minY <= b.maxY && a.maxY >= b.minY) {
                        potentialCollisions.push([a, b]);
                    }
                }

                // 将 a 添加到 activeList 中
                activeList.push(a);
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