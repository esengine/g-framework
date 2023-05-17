module gs {
    export class PhysicsEngine {
        private quadtree: QuadTree;
        private bvh: BVH;
        private entities: Map<number, AABB>;

        constructor(boundary: Rectangle = new Rectangle(0, 0, 1000, 1000), capacity: number = 4, cellSize: number = 10) {
            this.quadtree = new QuadTree(boundary, capacity, cellSize);
            this.bvh = new BVH();
            this.entities = new Map();
        }

        addObject(entityId: number, aabb: AABB) {
            this.entities.set(entityId, aabb);
            this.quadtree.insert(aabb);
            this.bvh.insert(aabb);
        }

        removeObject(entityId: number) {
            const aabb = this.entities.get(entityId);
            if (aabb) {
                this.bvh.remove(aabb);
                this.quadtree.remove(aabb);
                this.entities.delete(entityId);
            }
        }

        updateObject(entityId: number, newPosition: { minX: number, minY: number, maxX: number, maxY: number }) {
            const aabb = this.entities.get(entityId);
            if (aabb) {
                this.bvh.remove(aabb);
                this.quadtree.remove(aabb);
    
                aabb.minX = newPosition.minX;
                aabb.minY = newPosition.minY;
                aabb.maxX = newPosition.maxX;
                aabb.maxY = newPosition.maxY;
    
                this.bvh.insert(aabb);
                this.quadtree.insert(aabb);
            }
        }

        step(time: number) {
            // 1. 利用四叉树找出可能碰撞的物体对
            let potentialCollisions = this.quadtree.queryPairs();

            // 2. 利用扫描排序缩小可能碰撞的范围
            potentialCollisions = SweepAndPrune.sweepAndPrune(potentialCollisions);

            // 3. 使用BVH进一步减少物体对数量
            potentialCollisions = this.bvh.filterPairs(potentialCollisions);

            // 4. 使用基于时间的碰撞检测进行碰撞预测和处理
            for (let pair of potentialCollisions) {
                let [aabb1, aabb2] = pair;

                let [newAabb1, newAabb2] = TimeBaseCollisionDetection.handleCollision(aabb1, aabb2);

                // 5. 立即更新四叉树和 BVH
                this.quadtree.update(aabb1, newAabb1);
                this.bvh.update(aabb1, newAabb1);

                this.quadtree.update(aabb2, newAabb2);
                this.bvh.update(aabb2, newAabb2);
            }
        }
    }
}