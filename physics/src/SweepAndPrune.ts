module gs.physics {
    /**
     * 扫描排序
     */
    export class SweepAndPrune {
        public static filterPairs(pairs: [AABB, AABB][]): [AABB, AABB][] {
            // 将所有的 AABB 对平铺到一个数组中
            let aabbs: AABB[] = [];
            pairs.forEach(pair => {
                aabbs.push(pair[0]);
                aabbs.push(pair[1]);
            });
        
            // 去重
            aabbs = [...new Set(aabbs)];
        
            // 应用扫描排序
            let result: [AABB, AABB][] = this.scanSort(aabbs);
        
            return result;
        }

        public static scanSort(aabbs: AABB[]): [AABB, AABB][] {
            // Step 1: 对 AABB 进行排序
            aabbs.sort((a, b) => a.minX - b.minX);
        
            // Step 2: 从左到右扫描 AABB 列表
            let pairs: [AABB, AABB][] = [];
            for (let i = 0; i < aabbs.length; i++) {
                for (let j = i + 1; j < aabbs.length; j++) {
                    // 如果当前 AABB 的 maxX 小于下一个 AABB 的 minX，则结束循环
                    // 因为后面的 AABB 不可能与当前 AABB 相交
                    if (aabbs[i].maxX < aabbs[j].minX) {
                        break;
                    }
        
                    // Step 3: 检查 AABB 是否相交，并将碰撞对添加到列表中
                    if (aabbs[i].intersects(aabbs[j])) {
                        pairs.push([aabbs[i], aabbs[j]]);
                    }
                }
            }
        
            return pairs;
        }
    }
}