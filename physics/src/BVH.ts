module gs.physics {
    export class BVHNode {
        left: BVHNode | null;
        right: BVHNode | null;
        object: AABB | null;
        bounds: AABB;

        constructor(object?: AABB) {
            this.left = null;
            this.right = null;
            this.object = object || null;
            this.bounds = object ? object.clone() : new AABB(0, 0, -Infinity, -Infinity);
        }

        /**
         * 插入物体并返回是否需要重新平衡
         * @param object 
         * @returns 
         */
        insert(object: AABB): boolean {
            // 如果这个节点是叶子节点，那么直接插入
            if (!this.left && !this.right) {
                this.object = object;
                this.bounds = object;
                this.createChildNodes();
                return false;
            }

            // 如果这个节点不是叶子节点，那么插入到最小成本的子节点
            let leftBounds = this.left!.bounds.union(object);
            let rightBounds = this.right!.bounds.union(object);

            let leftCost = leftBounds.area() * (this.left!.size() + 1) - this.bounds.area() * this.size();
            let rightCost = rightBounds.area() * (this.right!.size() + 1) - this.bounds.area() * this.size();

            if (leftCost < rightCost) {
                let rebalance = this.left!.insert(object);
                this.bounds = this.bounds.union(object);
                return rebalance;
            } else {
                let rebalance = this.right!.insert(object);
                this.bounds = this.bounds.union(object);
                return rebalance;
            }
        }

        createChildNodes() {
            let center = this.bounds.getCenter();

            // 在 createChildNodes 中
            let leftBounds = new AABB(this.bounds.minX, this.bounds.minY, center.x - this.bounds.minX, this.bounds.maxY - this.bounds.minY);
            let rightBounds = new AABB(center.x, this.bounds.minY, this.bounds.maxX - center.x, this.bounds.maxY - this.bounds.minY);


            this.left = new BVHNode(leftBounds);
            this.right = new BVHNode(rightBounds);
        }

        /**
         * 移除物体并返回是否需要重新平衡
         * @param object 
         * @returns 
         */
        remove(object: AABB): boolean {
            if (this.object === object) {
                this.object = null;
                return true;
            } else if (this.left && this.right) {
                let rebalance = this.left.remove(object) || this.right.remove(object);
                if (rebalance) {
                    this.updateBounds();
                }
                return rebalance;
            }
            return false;
        }

        /**
         * 更新边界
         */
        updateBounds() {
            this.bounds = this.left.bounds.union(this.right.bounds);
        }

        /**
         * 查询与给定的AABB相交的所有物体
         * @param aabb 
         * @returns 
         */
        query(aabb: AABB): AABB[] {
            // 如果这个节点的AABB与给定的AABB不相交，那么返回空数组
            if (!this.bounds.intersects(aabb)) {
                return [];
            }

            let objects = [];

            // 如果这是一个叶子节点，那么检查物体是否与给定的AABB相交
            if (this.object) {
                if (this.object.intersects(aabb)) {
                    objects.push(this.object);
                }
            } else {
                // 如果这不是一个叶子节点，那么在子节点中查询
                if (this.left) {
                    objects.push(...this.left.query(aabb));
                }
                if (this.right) {
                    objects.push(...this.right.query(aabb));
                }
            }

            return objects;
        }

        /**
         * 计算节点所包含的物体数量
         * @returns 
         */
        size(): number {
            if (!this.left && !this.right) {
                return 1;
            } else {
                return this.left.size() + this.right.size();
            }
        }

        /**
         * 获取节点中的所有物体
         * @returns 
         */
        getObjects(): AABB[] {
            if (this.object) {
                return [this.object];
            } else {
                let objects = [];
                if (this.left) {
                    objects.push(...this.left.getObjects());
                }
                if (this.right) {
                    objects.push(...this.right.getObjects());
                }
                return objects;
            }
        }
    }

    /**
     * 包围体层次结构
     */
    export class BVH {
        root: BVHNode;

        constructor() {
            this.root = new BVHNode();
        }

        /**
         * 插入物体并在必要时重新平衡
         * @param object 
         */
        insert(object: AABB) {
            let rebalance = this.root.insert(object);
            if (rebalance) {
                // 如果需要重新平衡，那么重构整个树
                let objects = this.root.getObjects();
                this.root = new BVHNode();
                for (let object of objects) {
                    this.root.insert(object);
                }
            }
        }

        /**
         * 查询与给定的AABB相交的所有物体
         * @param aabb 
         * @returns 
         */
        query(aabb: AABB): AABB[] {
            return this.root.query(aabb);
        }

        /**
         * 过滤碰撞对
         * @param pairs 
         * @returns 
         */
        filterPairs(pairs: [AABB, AABB][]): [AABB, AABB][] {
            let filteredPairs: [AABB, AABB][] = [];

            for (let pair of pairs) {
                let aabb1 = pair[0];
                let aabb2 = pair[1];

                // 用 BVH 树查询可能与 aabb1 相交的所有对象
                let candidates = this.query(aabb1);

                // 如果 aabb2 在候选对象中，那么 aabb1 和 aabb2 可能会碰撞
                if (candidates.indexOf(aabb2) != -1) {
                    filteredPairs.push(pair);
                }
            }

            return filteredPairs;
        }

        /**
         * 移除物体并在必要时重新平衡
         * @param object 
         */
        remove(object: AABB) {
            let rebalance = this.root.remove(object);
            if (rebalance) {
                let objects = this.root.getObjects();
                this.root = new BVHNode();
                for (let object of objects) {
                    this.root.insert(object);
                }
            }
        }

        /**
         * 更新物体位置
         * @param object 
         * @param newPosition 
         */
        update(object: AABB, newPosition: { minX: number, minY: number, maxX: number, maxY: number }) {
            this.remove(object);
            object.minX = newPosition.minX;
            object.minY = newPosition.minY;
            object.maxX = newPosition.maxX;
            object.maxY = newPosition.maxY;
            this.insert(object);
        }
    }
}