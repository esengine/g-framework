module gs {
    /**
     * 空间哈希
     */
    export class SpatialHash {
        private buckets: Map<string, AABB[]> = new Map();

        constructor(public cellSize: number) { }

        size(): number {
            let size = 0;
            for (let bucket of this.buckets.values()) {
                size += bucket.length;
            }
            return size;
        }

        private hash(x: number, y: number): string {
            let cellX = Math.floor(x / this.cellSize);
            let cellY = Math.floor(y / this.cellSize);
            return `${cellX},${cellY}`;
        }

        insert(aabb: AABB) {
            const { minX, minY, maxX, maxY } = aabb;
            for (let x = minX; x <= maxX; x += this.cellSize) {
                for (let y = minY; y <= maxY; y += this.cellSize) {
                    const key = this.hash(x, y);
                    if (!this.buckets.has(key)) {
                        this.buckets.set(key, []);
                    }
                    this.buckets.get(key)!.push(aabb);
                }
            }
        }

        remove(aabb: AABB) {
            const { minX, minY, maxX, maxY } = aabb;
            for (let x = minX; x <= maxX; x += this.cellSize) {
                for (let y = minY; y <= maxY; y += this.cellSize) {
                    const key = this.hash(x, y);
                    let bucket = this.buckets.get(key);
                    if (bucket) {
                        const index = bucket.indexOf(aabb);
                        if (index !== -1) {
                            bucket.splice(index, 1);
                            if (bucket.length === 0) {
                                this.buckets.delete(key);
                            }

                            return true;
                        }
                    }
                }
            }
            return false;
        }

        query(x: number, y: number): AABB[] {
            let key = this.hash(x, y);
            return this.buckets.get(key) || [];
        }

        queryPairs(): [AABB, AABB][] {
            let pairs: [AABB, AABB][] = [];

            // 遍历每个 bucket
            this.buckets.forEach((bucket, key) => {

                // 在每个 bucket 中，对所有物体进行两两对比
                for (let i = 0; i < bucket.length; i++) {
                    for (let j = i + 1; j < bucket.length; j++) {
                        pairs.push([bucket[i], bucket[j]]);
                    }
                }
            });

            return pairs;
        }

        clear() {
            this.buckets.clear();
        }
    }
}