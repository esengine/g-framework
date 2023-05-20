module gs.physics {
    const MAX_OBJECTS = 10;
    const MAX_LEVELS = 5;

    export class QuadTree {
        level: number;
        bounds: { x: FixedPoint, y: FixedPoint, width: FixedPoint, height: FixedPoint };
        objects: any[];
        nodes: QuadTree[];

        constructor(level: number, bounds: { x: FixedPoint, y: FixedPoint, width: FixedPoint, height: FixedPoint }) {
            this.level = level;
            this.bounds = bounds;
            this.objects = [];
            this.nodes = [];
        }

        // 将物体分配到四个象限中
        split(): void {
            let subWidth = this.bounds.width.div(2);
            let subHeight = this.bounds.height.div(2);
            let x = this.bounds.x;
            let y = this.bounds.y;

            this.nodes[0] = new QuadTree(this.level + 1, { x: x.add(subWidth), y: y, width: subWidth, height: subHeight });
            this.nodes[1] = new QuadTree(this.level + 1, { x: x, y: y, width: subWidth, height: subHeight });
            this.nodes[2] = new QuadTree(this.level + 1, { x: x, y: y.add(subHeight), width: subWidth, height: subHeight });
            this.nodes[3] = new QuadTree(this.level + 1, { x: x.add(subWidth), y: y.add(subHeight), width: subWidth, height: subHeight });
        }

        // 将物体插入到四叉树中
        insert(obj: any): void {
            if (this.nodes[0] != null) {
                let index = this.getIndex(obj);

                if (index != -1) {
                    this.nodes[index].insert(obj);
                    return;
                }
            }

            this.objects.push(obj);

            if (this.objects.length > MAX_OBJECTS && this.level < MAX_LEVELS) {
                if (this.nodes[0] == null) {
                    this.split();
                }

                let i = 0;
                while (i < this.objects.length) {
                    let index = this.getIndex(this.objects[i]);
                    if (index != -1) {
                        this.nodes[index].insert(this.objects.splice(i, 1)[0]);
                    } else {
                        i++;
                    }
                }
            }
        }

        // 获取物体应该位于哪个象限
        getIndex(obj: any): number {
            let index = -1;
            let verticalMidpoint = this.bounds.x.add(this.bounds.width.div(2));
            let horizontalMidpoint = this.bounds.y.add(this.bounds.height.div(2));

            let topQuadrant = (obj.y.lt(horizontalMidpoint) && obj.y.add(obj.height).lt(horizontalMidpoint));
            let bottomQuadrant = obj.y.gt(horizontalMidpoint);

            if (obj.x.lt(verticalMidpoint) && obj.x.add(obj.width).lt(verticalMidpoint)) {
                if (topQuadrant) {
                    index = 1;
                } else if (bottomQuadrant) {
                    index = 2;
                }
            } else if (obj.x.gt(verticalMidpoint)) {
                if (topQuadrant) {
                    index = 0;
                } else if (bottomQuadrant) {
                    index = 3;
                }
            }

            return index;
        }

        // 返回所有可能与给定物体发生碰撞的物体
        retrieve(returnObjects: any[], obj: any): any[] {
            let index = this.getIndex(obj);
            if (index != -1 && this.nodes[0] != null) {
                this.nodes[index].retrieve(returnObjects, obj);
            }

            returnObjects.push(...this.objects);

            return returnObjects;
        }

        clear(): void {
            // 清空当前节点的对象数组
            this.objects = [];
            
            // 递归清空所有子节点
            for(let i = 0; i < this.nodes.length; i++) {
                if (this.nodes[i] != null) {
                    this.nodes[i].clear();
                    this.nodes[i] = null;
                }
            }
        }
    }
}