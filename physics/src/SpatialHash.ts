module gs.physics {
    export class SpatialHash<T extends Bounds> {
        private cellSize: number;
        private hashTable: Map<number, T[]>;

        constructor(cellSize: number) {
            this.cellSize = cellSize;
            this.hashTable = new Map();
        }

        private hash(x: number, y: number): number {
            let cellX = Math.floor(x / this.cellSize);
            let cellY = Math.floor(y / this.cellSize);
            return cellY * 1000000 + cellX;
        }

        public insert(obj: T): void {
            let minX = Math.floor(obj.position.x.toFloat() / this.cellSize);
            let minY = Math.floor(obj.position.y.toFloat() / this.cellSize);
            let maxX = Math.floor((obj.position.x.toFloat() + obj.width.toFloat()) / this.cellSize);
            let maxY = Math.floor((obj.position.y.toFloat() + obj.height.toFloat()) / this.cellSize);

            for (let x = minX; x <= maxX; x++) {
                for (let y = minY; y <= maxY; y++) {
                    let key = this.hash(x, y);
                    let bucket = this.hashTable.get(key);
                    if (bucket === undefined) {
                        bucket = [];
                        this.hashTable.set(key, bucket);
                    }
                    bucket.push(obj);
                }
            }
        }

        public retrieve(obj: T): T[] {
            let minX = Math.floor(obj.position.x.toFloat() / this.cellSize);
            let minY = Math.floor(obj.position.y.toFloat() / this.cellSize);
            let maxX = Math.floor((obj.position.x.toFloat() + obj.width.toFloat()) / this.cellSize);
            let maxY = Math.floor((obj.position.y.toFloat() + obj.height.toFloat()) / this.cellSize);

            let result: T[] = [];
            for (let x = minX; x <= maxX; x++) {
                for (let y = minY; y <= maxY; y++) {
                    let key = this.hash(x, y);
                    let bucket = this.hashTable.get(key);
                    if (bucket !== undefined) {
                        result.push(...bucket);
                    }
                }
            }
            return result;
        }

        public clear(): void {
            this.hashTable.clear();
        }
    }
}
