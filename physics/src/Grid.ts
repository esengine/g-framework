module gs.physics {
    const GRID_SIZE = 100;

    export class Grid<T extends Bounds> {
        grid: Map<string, Set<T>> = new Map();

        getKey(position: Vector2): string {
            const gridX = Math.floor(position.x.toFloat() / GRID_SIZE);
            const gridY = Math.floor(position.y.toFloat() / GRID_SIZE);
            return `${gridX},${gridY}`;
        }

        // 将物体插入到网格中
        insert(obj: T): void {
            const minX = Math.floor(obj.position.x.toFloat() / GRID_SIZE);
            const minY = Math.floor(obj.position.y.toFloat() / GRID_SIZE);
            const maxX = Math.floor((obj.position.x.toFloat() + obj.width.toFloat()) / GRID_SIZE);
            const maxY = Math.floor((obj.position.y.toFloat() + obj.height.toFloat()) / GRID_SIZE);

            for (let x = minX; x <= maxX; x++) {
                for (let y = minY; y <= maxY; y++) {
                    const key = `${x},${y}`;
                    if (!this.grid.has(key)) {
                        this.grid.set(key, new Set());
                    }
                    this.grid.get(key).add(obj);
                }
            }
        }

        // 返回所有可能与给定物体发生碰撞的物体
        retrieve(obj: T): Set<T> {
            const returnObjects: Set<T> = new Set();
            const minX = Math.floor(obj.position.x.toFloat() / GRID_SIZE);
            const minY = Math.floor(obj.position.y.toFloat() / GRID_SIZE);
            const maxX = Math.floor((obj.position.x.toFloat() + obj.width.toFloat()) / GRID_SIZE);
            const maxY = Math.floor((obj.position.y.toFloat() + obj.height.toFloat()) / GRID_SIZE);

            for (let x = minX; x <= maxX; x++) {
                for (let y = minY; y <= maxY; y++) {
                    const key = `${x},${y}`;
                    if (this.grid.has(key)) {
                        for (const object of this.grid.get(key)) {
                            returnObjects.add(object);
                        }
                    }
                }
            }

            return returnObjects;
        }

        // 清空网格
        clear(): void {
            this.grid.clear();
        }
    }
}
