module gs {
    /**
     * 四叉树
     */
    export class QuadTree {
        private spatialHash: SpatialHash;
        private nw: QuadTree | null = null;
        private ne: QuadTree | null = null;
        private sw: QuadTree | null = null;
        private se: QuadTree | null = null;

        constructor(public boundary: Rectangle, public capacity: number, cellSize: number) {
            this.spatialHash = new SpatialHash(cellSize);
        }

        insert(aabb: AABB): boolean {
            if (!this.boundary.intersectsAABB(aabb)) {
                return false;
            }

            if (this.spatialHash.size() < this.capacity) {
                this.spatialHash.insert(aabb);
                return true;
            }

            if (this.nw === null) {
                this.subdivide();
            }

            return (this.nw.insert(aabb) || this.ne.insert(aabb) ||
                this.sw.insert(aabb) || this.se.insert(aabb));
        }

        subdivide() {
            let x = this.boundary.x;
            let y = this.boundary.y;
            let w = this.boundary.width / 2;
            let h = this.boundary.height / 2;

            let nw = new Rectangle(x, y, w, h);
            let ne = new Rectangle(x + w, y, w, h);
            let sw = new Rectangle(x, y + h, w, h);
            let se = new Rectangle(x + w, y + h, w, h);

            this.nw = new QuadTree(nw, this.capacity, this.spatialHash.cellSize);
            this.ne = new QuadTree(ne, this.capacity, this.spatialHash.cellSize);
            this.sw = new QuadTree(sw, this.capacity, this.spatialHash.cellSize);
            this.se = new QuadTree(se, this.capacity, this.spatialHash.cellSize);

            let aabbs = this.spatialHash.queryPairs().reduce((acc, val) => acc.concat(val), []);
            for (let aabb of aabbs) {
                this.nw.insert(aabb) || this.ne.insert(aabb) ||
                    this.sw.insert(aabb) || this.se.insert(aabb);
            }

            this.spatialHash.clear();
        }

        remove(aabb: AABB) {
            if (!this.boundary.intersectsAABB(aabb)) {
                return false;
            }

            if (this.spatialHash.remove(aabb)) {
                return true;
            }

            if (this.nw === null) {
                return false;
            }

            return (this.nw.remove(aabb) || this.ne.remove(aabb) ||
                this.sw.remove(aabb) || this.se.remove(aabb));
        }

        query(range: Rectangle, found: AABB[] = []): AABB[] {
            if (!this.boundary.intersects(range)) {
                return found;
            }

            found.push(...this.spatialHash.query(range.x, range.y));

            if (this.nw === null) {
                return found;
            }

            this.nw.query(range, found);
            this.ne.query(range, found);
            this.sw.query(range, found);
            this.se.query(range, found);

            return found;
        }

        queryPairs(): [AABB, AABB][] {
            let pairs: [AABB, AABB][] = [];

            // 如果这个节点没有被分割，那么直接从空间哈希中查询
            if (!this.nw) {
                let potentialCollisions = this.spatialHash.queryPairs();
                for (let pair of potentialCollisions) {
                    pairs.push(pair);
                }
            } else {
                // 如果这个节点已经被分割，那么从四个子节点中查询
                let northwestPairs = this.nw.queryPairs();
                let northeastPairs = this.ne.queryPairs();
                let southwestPairs = this.sw.queryPairs();
                let southeastPairs = this.se.queryPairs();

                pairs = pairs.concat(northwestPairs, northeastPairs, southwestPairs, southeastPairs);
            }

            return pairs;
        }

        update(point: AABB, newPosition: AABB): boolean {
            if (!this.remove(point)) {
                return false;
            }

            point.minX = newPosition.minX;
            point.maxX = newPosition.maxX;
            point.minY = newPosition.minY;
            point.maxY = newPosition.maxY;

            return this.insert(point);
        }
    }
}