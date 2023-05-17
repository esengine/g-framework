module gs {
    export class PhysicsEngine {
        private quadtree: QuadTree;
        private bvh: BVH;

        constructor(private aabbs: AABB[], boundary: Rectangle, capacity: number, cellSize: number) {
            this.quadtree = new QuadTree(boundary, capacity, cellSize);
            this.bvh = new BVH(aabbs);
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

                TimeBaseCollisionDetection.handleCollision(aabb1, aabb2);
            }

            // TODO: 更新四叉树和BVH
            // this.quadtree.update();
            // this.bvh.update();
        }
    }
}