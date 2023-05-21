module gs.physics {
    export class SpatialHash<T extends Bounds> {
        private cellSize: number;
        private hashTable: Map<number, Set<T>>;
        private objectTable: Map<T, number[]>;

        constructor(cellSize: number) {
            this.cellSize = cellSize;
            this.hashTable = new Map();
            this.objectTable = new Map();
        }

        private hash(x: number, y: number): number {
            const prime1 = 73856093, prime2 = 19349663;
            return x * prime1 ^ y * prime2;
        }

        public insert(obj: T): void {
            const minX = Math.floor(obj.position.x.toFloat() / this.cellSize);
            const minY = Math.floor(obj.position.y.toFloat() / this.cellSize);
            const maxX = Math.floor((obj.position.x.toFloat() + obj.width.toFloat()) / this.cellSize);
            const maxY = Math.floor((obj.position.y.toFloat() + obj.height.toFloat()) / this.cellSize);

            let keys: number[] = [];
            for (let x = minX; x <= maxX; x++) {
                for (let y = minY; y <= maxY; y++) {
                    let key = this.hash(x, y);
                    keys.push(key);
                    let bucket = this.hashTable.get(key);
                    if (!bucket) {
                        bucket = new Set();
                        this.hashTable.set(key, bucket);
                    }
                    bucket.add(obj);
                }
            }
            this.objectTable.set(obj, keys);
        }

        public retrieve(obj: T): T[] {
            const minX = Math.floor(obj.position.x.toFloat() / this.cellSize);
            const minY = Math.floor(obj.position.y.toFloat() / this.cellSize);
            const maxX = Math.floor((obj.position.x.toFloat() + obj.width.toFloat()) / this.cellSize);
            const maxY = Math.floor((obj.position.y.toFloat() + obj.height.toFloat()) / this.cellSize);

            let result: T[] = [];
            for (let x = minX; x <= maxX; x++) {
                for (let y = minY; y <= maxY; y++) {
                    let key = this.hash(x, y);
                    let bucket = this.hashTable.get(key);
                    if (bucket) {
                        result.push(...bucket);
                    }
                }
            }
            return result;
        }

        public retrieveAll(): T[] {
            let result: T[] = [];
            for (let bucket of this.hashTable.values()) {
                result.push(...bucket);
            }
            return result;
        }

        public remove(obj: T): void {
            let keys = this.objectTable.get(obj);
            if (keys) {
                for (let key of keys) {
                    let bucket = this.hashTable.get(key);
                    if (bucket) {
                        bucket.delete(obj);
                    }
                }
                this.objectTable.delete(obj);
            }
        }

        public clear(): void {
            this.hashTable.clear();
            this.objectTable.clear();
        }
    }
}
