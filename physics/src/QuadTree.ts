module gs.physics {
    const MAX_OBJECTS = 10;
    const MAX_LEVELS = 5;

    export class QuadTree<T extends Bounds> {
        level: number;
        bounds: {position: Vector2, width: FixedPoint, height: FixedPoint};
        objects: T[];
        nodes: QuadTree<T>[];

        constructor(level: number, bounds: {position: Vector2, width: FixedPoint, height: FixedPoint}) {
            this.level = level;
            this.bounds = bounds;
            this.objects = [];
            this.nodes = [];
        }

        // 将物体分配到四个象限中
        split(): void {
            let subWidth = FixedPoint.div(this.bounds.width, 2);
            let subHeight = FixedPoint.div(this.bounds.height, 2);
            let x = this.bounds.position.x;
            let y = this.bounds.position.y;

            this.nodes[0] = new QuadTree<T>(this.level + 1, { position: new Vector2(x.toFloat(), y.toFloat()), width: subWidth, height: subHeight });
            this.nodes[1] = new QuadTree<T>(this.level + 1, { position: new Vector2(FixedPoint.add(x, subWidth).toFloat(), y.toFloat()), width: subWidth, height: subHeight });
            this.nodes[2] = new QuadTree<T>(this.level + 1, { position: new Vector2(x.toFloat(), FixedPoint.add(y, subHeight).toFloat()), width: subWidth, height: subHeight });
            this.nodes[3] = new QuadTree<T>(this.level + 1, { position: new Vector2(FixedPoint.add(x, subWidth).toFloat(), FixedPoint.add(y, subHeight).toFloat()), width: subWidth, height: subHeight });
        }

        // 将物体插入到四叉树中
        insert(obj: T): void {
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
        getIndex(obj: T): number {
            let index = -1;
            let verticalMidpoint = FixedPoint.add(this.bounds.position.x, FixedPoint.div( this.bounds.width, 2));
            let horizontalMidpoint = FixedPoint.add(this.bounds.position.y, FixedPoint.div(this.bounds.height, 2));

            let topQuadrant = (obj.position.y.lt(horizontalMidpoint) && FixedPoint.add(obj.position.y, obj.height).lt(horizontalMidpoint));
            let bottomQuadrant = obj.position.y.gt(horizontalMidpoint);

            if (obj.position.x.lt(verticalMidpoint) && FixedPoint.add(obj.position.x, obj.width).lt(verticalMidpoint)) {
                if (topQuadrant) {
                    index = 1;
                } else if (bottomQuadrant) {
                    index = 2;
                }
            } else if (obj.position.x.gt(verticalMidpoint)) {
                if (topQuadrant) {
                    index = 0;
                } else if (bottomQuadrant) {
                    index = 3;
                }
            }

            return index;
        }

        // 返回所有可能与给定物体发生碰撞的物体
        retrieve(returnObjects: Set<T>, obj: T): Set<T> {
            let index = this.getIndex(obj);
            if (index != -1 && this.nodes[0] != null) {
                this.nodes[index].retrieve(returnObjects, obj);
            }
        
            for(let object of this.objects) {
                returnObjects.add(object);
            }
        
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