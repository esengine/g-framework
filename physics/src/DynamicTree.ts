module gs.physics {
    /**
     * 节点类
     */
    export class TreeNode {
        aabb: AABB; // 包围盒
        data: any; // 数据
        height: number; // 高度
        left?: TreeNode; // 左子节点
        right?: TreeNode; // 右子节点

        /**
         * 创建一个节点
         * @param aabb 节点的包围盒
         * @param data 节点的数据
         */
        constructor(aabb: AABB, data: any) {
            this.aabb = aabb;
            this.data = data;
            this.height = 0;
        }

        /**
         * 更新节点的高度
         */
        updateHeight() {
            this.height = Math.max(this.left?.height || -1, this.right?.height || -1) + 1;
        }

        /**
         * 获取节点的平衡因子
         * @returns 节点的平衡因子
         */
        getBalance() {
            return (this.left?.height || -1) - (this.right?.height || -1);
        }

        /**
         * 获取节点的表面积
         * @returns 节点的表面积
         */
        getSurfaceArea() {
            return FixedPoint.mul(this.aabb.width, this.aabb.height).toFloat();
        }

        /**
         * 右旋转节点
         * @returns 旋转后的节点
         */
        rotateRight(): TreeNode {
            let x = this.left!;
            let T2 = x.right;
            x.right = this;
            this.left = T2;
            this.updateHeight();
            x.updateHeight();
            return x;
        }

        /**
         * 左旋转节点
         * @returns 旋转后的节点
         */
        rotateLeft(): TreeNode {
            let y = this.right!;
            let T2 = y.left;
            y.left = this;
            this.right = T2;
            this.updateHeight();
            y.updateHeight();
            return y;
        }

        /**
         * 如果进行左旋转，节点表面积的变化量
         * @returns 左旋转后的表面积变化量
         */
        getSurfaceAreaChangeIfRotatedLeft() {
            const saBefore = this.getSurfaceArea() + (this.right?.getSurfaceArea() || 0);
            const tempRoot = this.rotateLeft();
            const saAfter = tempRoot.getSurfaceArea() + (tempRoot.left?.getSurfaceArea() || 0);
            return saAfter - saBefore;
        }

        /**
         * 如果进行右旋转，节点表面积的变化量
         * @returns 右旋转后的表面积变化量
         */
        getSurfaceAreaChangeIfRotatedRight() {
            const saBefore = this.getSurfaceArea() + (this.left?.getSurfaceArea() || 0);
            const tempRoot = this.rotateRight();
            const saAfter = tempRoot.getSurfaceArea() + (tempRoot.right?.getSurfaceArea() || 0);
            return saAfter - saBefore;
        }
    }

    /**
     * 动态树类
     */
    export class DynamicTree {
        root?: TreeNode; // 根节点

        /**
         * 优化树结构
         */
        optimize() {
            if (this.root) {
                this._optimize(this.root);
            }
        }

        /**
         * 递归优化节点
         * @param node 节点
         * @returns 优化后的节点
         */
        _optimize(node: TreeNode): TreeNode {
            node.left = node.left && this._optimize(node.left);
            node.right = node.right && this._optimize(node.right);
            return this.tryRotation(node);
        }

        /**
        * 插入节点
        * @param aabb 节点的包围盒
        * @param data 节点的数据
        * @returns 插入后的根节点
        */
        insert(aabb: AABB, data: any): TreeNode {
            this.root = this._insert(this.root, aabb, data);
            return this.root;
        }

        /**
         * 递归插入节点
         * @param node 节点
         * @param aabb 节点的包围盒
         * @param data 节点的数据
         * @returns 插入后的节点
         */
        _insert(node: TreeNode | undefined, aabb: AABB, data: any): TreeNode {
            if (!node) {
                return new TreeNode(aabb, data);
            }

            // 正常的二叉搜索树插入
            if (data < node.data) {
                node.left = this._insert(node.left, aabb, data);
            } else if (data > node.data) {
                node.right = this._insert(node.right, aabb, data);
            } else {
                return node;
            }

            // 更新祖先节点的高度
            node.updateHeight();

            // 返回（可能发生变化的）节点指针
            return this.tryRotation(node);
        }

        /**
         * 移除节点
         * @param node 节点
         */
        remove(node: TreeNode): void {
            this.root = this._remove(this.root, node);
        }

        /**
         * 递归移除节点
         * @param currentNode 当前节点
         * @param targetNode 要移除的节点
         * @returns 移除后的节点
         */
        _remove(currentNode: TreeNode | undefined, targetNode: TreeNode): TreeNode | undefined {
            if (!currentNode) return undefined;

            if (targetNode.data < currentNode.data) {
                currentNode.left = this._remove(currentNode.left, targetNode);
            } else if (targetNode.data > currentNode.data) {
                currentNode.right = this._remove(currentNode.right, targetNode);
            } else {
                // 当前节点就是要移除的节点
                if (!currentNode.left && !currentNode.right) {
                    // 叶子节点
                    return undefined;
                } else if (!currentNode.left) {
                    // 只有右子节点
                    return currentNode.right;
                } else if (!currentNode.right) {
                    // 只有左子节点
                    return currentNode.left;
                } else {
                    // 左右子节点都存在，选择右子树中最小的节点替代当前节点
                    const successor = this.findMinNode(currentNode.right);
                    currentNode.aabb = successor.aabb;
                    currentNode.data = successor.data;
                    currentNode.right = this._remove(currentNode.right, successor);
                }
            }

            currentNode.updateHeight();
            return this.tryRotation(currentNode);
        }

        /**
         * 查询范围内的节点
         * @param aabb 查询范围的包围盒
         * @returns 符合查询范围的节点数组
         */
        queryRange(aabb: AABB): any[] {
            const result: any[] = [];
            this._queryRange(this.root, aabb, result);
            return result;
        }

        /**
         * 尝试旋转节点
         * @param node 节点
         * @returns 旋转后的节点
         */
        tryRotation(node: TreeNode): TreeNode {
            const saChangeIfRotatedLeft = node.getSurfaceAreaChangeIfRotatedLeft();
            const saChangeIfRotatedRight = node.getSurfaceAreaChangeIfRotatedRight();

            if (saChangeIfRotatedLeft < 0 && saChangeIfRotatedLeft < saChangeIfRotatedRight) {
                return node.rotateLeft();
            } else if (saChangeIfRotatedRight < 0 && saChangeIfRotatedRight < saChangeIfRotatedLeft) {
                return node.rotateRight();
            } else {
                return node;
            }
        }

        /**
        * 查询最小的节点
        * @param node 节点
        * @returns 最小的节点
        */
        findMinNode(node: TreeNode): TreeNode {
            while (node.left) {
                node = node.left;
            }
            return node;
        }

        private _queryRange(node?: TreeNode, aabb?: AABB, result: any[] = []): void {
            if (!node) return;
            if (node.aabb.intersects(aabb)) {
                if (node.data) result.push(node.data);
                this._queryRange(node.left, aabb, result);
                this._queryRange(node.right, aabb, result);
            }
        }
    }
}
