module gs.physics {
    export class DynamicTree {
        private _maxEntries: number;
        private _minEntries: number;
        private compareMinX(a: AABB, b: AABB) { return a.minX - b.minX; }
        private compareMinY(a: AABB, b: AABB) { return a.minY - b.minY; }
        private data: DynamicTreeNode;

        constructor(maxEntries = 9) {
            // 默认情况下，节点中的最大条目数为9；最佳性能时，最小节点填充为40%
            this._maxEntries = Math.max(4, maxEntries);
            this._minEntries = Math.max(
                2,
                Math.ceil(this._maxEntries * 0.4)
            );
            this.clear();
        }

        all(): DynamicTreeNode[] {
            return this._all(this.data, []);
        }

        search(bbox: AABB): DynamicTreeNode[] {
            let node = this.data;
            const result: DynamicTreeNode[] = [];

            if (!intersects(bbox, node)) return result;

            const toBBox = this.toBBox;
            const nodesToSearch: DynamicTreeNode[] = [];

            while (node) {
                for (let i = 0; i < node.children.length; i++) {
                    const child = node.children[i];
                    const childBBox = node.leaf ? toBBox(child) : child;

                    if (intersects(bbox, childBBox)) {
                        if (node.leaf) result.push(child);
                        else if (contains(bbox, childBBox)) this._all(child, result);
                        else nodesToSearch.push(child);
                    }
                }
                node = nodesToSearch.pop()!;
            }

            return result;
        }

        collides(bbox: AABB): boolean {
            let node = this.data;

            if (!intersects(bbox, node)) return false;

            const nodesToSearch: DynamicTreeNode[] = [];
            while (node) {
                for (let i = 0; i < node.children.length; i++) {
                    const child = node.children[i];
                    const childBBox = node.leaf ? this.toBBox(child) : child;

                    if (intersects(bbox, childBBox)) {
                        if (node.leaf || contains(bbox, childBBox)) return true;
                        nodesToSearch.push(child);
                    }
                }
                node = nodesToSearch.pop()!;
            }

            return false;
        }

        load(data: DynamicTreeNode[]): DynamicTree {
            if (!(data && data.length)) return this;

            if (data.length < this._minEntries) {
                for (let i = 0; i < data.length; i++) {
                    this.insert(data[i]);
                }
                return this;
            }

            // 使用OMT算法从头开始递归构建树结构
            let node = this._build(data.slice(), 0, data.length - 1, 0);

            if (!this.data.children.length) {
                // 如果树为空，则保存
                this.data = node;
            } else if (this.data.height === node.height) {
                // 如果树的高度相同，则分割根节点
                this._splitRoot(this.data, node);
            } else {
                if (this.data.height < node.height) {
                    // 如果插入的树较大，则交换树
                    const tmpNode = this.data;
                    this.data = node;
                    node = tmpNode;
                }

                // 在合适的层级将小树插入大树中
                this._insert(node, this.data.height - node.height - 1, true);
            }

            return this;
        }

        insert(item: DynamicTreeNode): DynamicTree {
            if (item) this._insert(item, this.data.height - 1);
            return this;
        }

        clear(): DynamicTree {
            this.data = createNode([]);
            return this;
        }

        remove(item: DynamicTreeNode, equalsFn?: (a: AABB, b: AABB) => boolean): DynamicTree {
            if (!item) return this;

            let node = this.data;
            const bbox = this.toBBox(item);
            const path: DynamicTreeNode[] = [];
            const indexes: number[] = [];
            let i, parent, goingUp;

            // 深度优先的迭代树遍历
            while (node || path.length) {
                if (!node) {
                    node = path.pop()!;
                    parent = path[path.length - 1];
                    i = indexes.pop()!;
                    goingUp = true;
                }

                if (node.leaf) {
                    // 检查当前节点
                    const index = findItem(item, node.children, equalsFn);

                    if (index !== -1) {
                        // 找到项目，删除项目并向上调整树
                        node.children.splice(index, 1);
                        path.push(node);
                        this._condense(path);
                        return this;
                    }
                }

                if (!goingUp && !node.leaf && contains(node, bbox)) {
                    path.push(node);
                    indexes.push(i);
                    i = 0;
                    parent = node;
                    node = node.children[0];
                } else if (parent) {
                    i++;
                    node = parent.children[i];
                    goingUp = false;
                } else node = null;
            }

            return this;
        }

        toBBox(item: DynamicTreeNode): AABB {
            return item;
        }

        toJSON(): DynamicTreeNode {
            return this.data;
        }

        fromJSON(data: DynamicTreeNode): DynamicTree {
            this.data = data;
            return this;
        }

        private _all(node: DynamicTreeNode, result: DynamicTreeNode[]): DynamicTreeNode[] {
            const nodesToSearch: DynamicTreeNode[] = [];
            while (node) {
                if (node.leaf) result.push(...node.children);
                else nodesToSearch.push(...node.children);

                node = nodesToSearch.pop()!;
            }
            return result;
        }

        private _build(
            items: DynamicTreeNode[],
            left: number,
            right: number,
            height: number
        ): DynamicTreeNode {
            const N = right - left + 1;
            let M = this._maxEntries;
            let node: DynamicTreeNode;

            if (N <= M) {
                // 达到叶级别；返回叶节点
                node = createNode(items.slice(left, right + 1));
                calcBBox(node, this.toBBox);
                return node;
            }

            if (!height) {
                // 目标高度为批量加载的树
                height = Math.ceil(Math.log(N) / Math.log(M));

                // 目标根节点条目数量以最大化存储利用率
                M = Math.ceil(N / Math.pow(M, height - 1));
            }

            node = createNode([]);
            node.leaf = false;
            node.height = height;

            // 将条目拆分为M个方形的瓦片
            const N2 = Math.ceil(N / M);
            const N1 = N2 * Math.ceil(Math.sqrt(M));

            multiSelect(items, left, right, N1, this.compareMinX);

            for (let i = left; i <= right; i += N1) {
                const right2 = Math.min(i + N1 - 1, right);

                multiSelect(items, i, right2, N2, this.compareMinY);

                for (let j = i; j <= right2; j += N2) {
                    const right3 = Math.min(j + N2 - 1, right2);

                    node.children.push(
                        this._build(items, j, right3, height - 1)
                    );
                }
            }

            calcBBox(node, this.toBBox);

            return node;
        }

        private _chooseSubtree(
            bbox: AABB,
            node: DynamicTreeNode,
            level: number,
            path: DynamicTreeNode[]
        ): DynamicTreeNode {
            while (true) {
                path.push(node);

                if (node.leaf || path.length - 1 === level) break;

                let minArea = Infinity;
                let minEnlargement = Infinity;
                let targetNode: DynamicTreeNode;

                for (let i = 0; i < node.children.length; i++) {
                    const child = node.children[i];
                    const area = bboxArea(child);
                    const enlargement = enlargedArea(bbox, child) - area;

                    // 选择面积扩展最小的条目
                    if (enlargement < minEnlargement) {
                        minEnlargement = enlargement;
                        minArea = area < minArea ? area : minArea;
                        targetNode = child;
                    } else if (enlargement === minEnlargement) {
                        // 否则选择面积最小的条目
                        if (area < minArea) {
                            minArea = area;
                            targetNode = child;
                        }
                    }
                }

                node = targetNode || node.children[0];
            }

            return node;
        }

        private _insert(item: DynamicTreeNode, level: number, isNode?: boolean): void {
            const bbox = isNode ? item : this.toBBox(item);
            const insertPath: DynamicTreeNode[] = [];

            // 找到最适合容纳条目的节点，并保存沿途的所有节点
            const node = this._chooseSubtree(bbox, this.data, level, insertPath);

            // 将条目放入节点中
            node.children.push(item);
            extend(node, bbox);

            // 分割节点溢出；如有必要，向上传播
            while (level >= 0) {
                if (insertPath[level].children.length > this._maxEntries) {
                    this._split(insertPath, level);
                    level--;
                } else break;
            }

            // 调整沿插入路径的bbox
            this._adjustParentBBoxes(bbox, insertPath, level);
        }

        // 将溢出的节点分割为两个节点
        private _split(insertPath: DynamicTreeNode[], level: number): void {
            const node = insertPath[level];
            const M = node.children.length;
            const m = this._minEntries;

            this._chooseSplitAxis(node, m, M);

            const splitIndex = this._chooseSplitIndex(node, m, M);

            const newNode = createNode(
                node.children.splice(splitIndex, node.children.length - splitIndex)
            );
            newNode.height = node.height;
            newNode.leaf = node.leaf;

            calcBBox(node, this.toBBox);
            calcBBox(newNode, this.toBBox);

            if (level) insertPath[level - 1].children.push(newNode);
            else this._splitRoot(node, newNode);
        }

        private _splitRoot(node: DynamicTreeNode, newNode: DynamicTreeNode): void {
            this.data = createNode([node, newNode]);
            this.data.height = node.height + 1;
            this.data.leaf = false;
            calcBBox(this.data, this.toBBox);
        }

        private _chooseSplitIndex(
            node: DynamicTreeNode,
            m: number,
            M: number
        ): number {
            let index;
            let minOverlap = Infinity;
            let minArea = Infinity;

            for (let i = m; i <= M - m; i++) {
                const bbox1 = distBBox(node, 0, i, this.toBBox);
                const bbox2 = distBBox(node, i, M, this.toBBox);

                const overlap = intersectionArea(bbox1, bbox2);
                const area = bboxArea(bbox1) + bboxArea(bbox2);

                // 选择重叠最小的分布
                if (overlap < minOverlap) {
                    minOverlap = overlap;
                    index = i;

                    minArea = area < minArea ? area : minArea;
                } else if (overlap === minOverlap) {
                    // 否则选择面积最小的分布
                    if (area < minArea) {
                        minArea = area;
                        index = i;
                    }
                }
            }

            return index || M - m;
        }

        // 根据最佳分割轴对节点的子项进行排序
        private _chooseSplitAxis(node: DynamicTreeNode, m: number, M: number): void {
            const compareMinX = node.leaf ? this.compareMinX : compareNodeMinX;
            const compareMinY = node.leaf ? this.compareMinY : compareNodeMinY;
            const xMargin = this._allDistMargin(node, m, M, compareMinX);
            const yMargin = this._allDistMargin(node, m, M, compareMinY);

            // 如果总分布边距值对于x最小，则按minX排序，
            // 否则已经按minY排序
            if (xMargin < yMargin) node.children.sort(compareMinX);
        }

        // 所有可能的分布中，每个节点至少为m时的总边距
        private _allDistMargin(
            node: DynamicTreeNode,
            m: number,
            M: number,
            compare: (a: DynamicTreeNode, b: DynamicTreeNode) => number
        ): number {
            node.children.sort(compare);

            const toBBox = this.toBBox;
            const leftBBox = distBBox(node, 0, m, toBBox);
            const rightBBox = distBBox(node, M - m, M, toBBox);
            let margin = bboxMargin(leftBBox) + bboxMargin(rightBBox);

            for (let i = m; i < M - m; i++) {
                const child = node.children[i];
                extend(leftBBox, node.leaf ? toBBox(child) : child);
                margin += bboxMargin(leftBBox);
            }

            for (let i = M - m - 1; i >= m; i--) {
                const child = node.children[i];
                extend(rightBBox, node.leaf ? toBBox(child) : child);
                margin += bboxMargin(rightBBox);
            }

            return margin;
        }

        private _adjustParentBBoxes(
            bbox: AABB,
            path: DynamicTreeNode[],
            level: number
        ): void {
            // 调整给定树路径上的bbox
            for (let i = level; i >= 0; i--) {
                extend(path[i], bbox);
            }
        }

        private _condense(path: DynamicTreeNode[]): void {
            // 遍历路径，删除空节点并更新bbox
            for (let i = path.length - 1, siblings; i >= 0; i--) {
                if (path[i].children.length === 0) {
                    if (i > 0) {
                        siblings = path[i - 1].children;
                        siblings.splice(siblings.indexOf(path[i]), 1);
                    } else this.clear();
                } else calcBBox(path[i], this.toBBox);
            }
        }
    }
}