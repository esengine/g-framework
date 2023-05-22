module gs.physics {
    export class SpatialHash<T extends Bounds> {
        private cellSize: number;
        private hashTable: Map<number, Set<T>>;
        private objectTable: Map<T, number[]>;
        private setPool: Set<T>[] = [];

        constructor(cellSize: number) {
            this.cellSize = cellSize;
            this.hashTable = new Map();
            this.objectTable = new Map();
        }

        private hash(x: number, y: number): number {
            const prime1 = 73856093, prime2 = 19349663;
            return x * prime1 ^ y * prime2;
        }

        private getSetFromPool(): Set<T> {
            if (this.setPool.length > 0) {
                return this.setPool.pop()!;
            } else {
                return new Set();
            }
        }

        private returnSetToPool(set: Set<T>): void {
            set.clear();
            this.setPool.push(set);
        }

        public insert(obj: T): void {
            const minX = Math.floor(obj.position.x.toFloat() / this.cellSize);
            const minY = Math.floor(obj.position.y.toFloat() / this.cellSize);
            const maxX = Math.floor((obj.position.x.toFloat() + obj.width.toFloat()) / this.cellSize);
            const maxY = Math.floor((obj.position.y.toFloat() + obj.height.toFloat()) / this.cellSize);

            const keys: number[] = [];
            for (let x = minX; x <= maxX; x++) {
                for (let y = minY; y <= maxY; y++) {
                    const key = this.hash(x, y);
                    keys.push(key);
                    let bucket = this.hashTable.get(key);
                    if (!bucket) {
                        bucket = this.getSetFromPool();
                        this.hashTable.set(key, bucket);
                    }
                    bucket.add(obj);
                }
            }
            this.objectTable.set(obj, keys);
        }

        public retrieve(obj: T, callback: (obj: T) => void): void {
            const keys = this.objectTable.get(obj);
            if (keys) {
                for (const key of keys) {
                    const bucket = this.hashTable.get(key);
                    if (bucket) {
                        for (const obj of bucket) {
                            callback(obj);
                        }
                    }
                }
            }
        }

        public retrieveAll(): T[] {
            const result: T[] = [];
            for (const bucket of this.hashTable.values()) {
                result.push(...bucket);
            }
            return result;
        }

        public remove(obj: T): void {
            const keys = this.objectTable.get(obj);
            if (keys) {
                for (const key of keys) {
                    const bucket = this.hashTable.get(key);
                    if (bucket) {
                        bucket.delete(obj);
                        if (bucket.size === 0) {
                            this.returnSetToPool(bucket);
                            this.hashTable.delete(key);
                        }
                    }
                }
                this.objectTable.delete(obj);
            }
        }

        public clear(): void {
            for (const set of this.setPool) {
                set.clear();
            }
            this.hashTable.clear();
            this.objectTable.clear();
        }
    }
}
