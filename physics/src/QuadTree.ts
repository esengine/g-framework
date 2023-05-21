module gs.physics {
    const MAX_OBJECTS = 50;
    const MAX_LEVELS = 5;

    export class QuadTree<T extends Bounds> {
        level: number;
        bounds: { position: Vector2, width: FixedPoint, height: FixedPoint };
        spatialHash: SpatialHash<T>;
        nodes: QuadTree<T>[];

        constructor(level: number, bounds: { position: Vector2, width: FixedPoint, height: FixedPoint }, public cellSize: number = 100) {
            this.level = level;
            this.bounds = bounds;
            this.spatialHash = new SpatialHash<T>(cellSize);
            this.nodes = [];
        }

        // 将物体分配到四个象限中
        split(): void {
            const subWidth = FixedPoint.div(this.bounds.width, 2);
            const subHeight = FixedPoint.div(this.bounds.height, 2);
            const x = this.bounds.position.x;
            const y = this.bounds.position.y;

            const topLeftPosition = new Vector2(x.toFloat(), y.toFloat());
            const topRightPosition = new Vector2(FixedPoint.add(x, subWidth).toFloat(), y.toFloat());
            const bottomLeftPosition = new Vector2(x.toFloat(), FixedPoint.add(y, subHeight).toFloat());
            const bottomRightPosition = new Vector2(FixedPoint.add(x, subWidth).toFloat(), FixedPoint.add(y, subHeight).toFloat());

            this.nodes[0] = new QuadTree<T>(this.level + 1, { position: topRightPosition, width: subWidth, height: subHeight }, this.cellSize);
            this.nodes[1] = new QuadTree<T>(this.level + 1, { position: topLeftPosition, width: subWidth, height: subHeight }, this.cellSize);
            this.nodes[2] = new QuadTree<T>(this.level + 1, { position: bottomRightPosition, width: subWidth, height: subHeight }, this.cellSize);
            this.nodes[3] = new QuadTree<T>(this.level + 1, { position: bottomLeftPosition, width: subWidth, height: subHeight }, this.cellSize);

            const objects = this.spatialHash.retrieveAll();
            this.spatialHash.clear();

            for (const object of objects) {
                this.insert(object);
            }
        }


        // 将物体插入到四叉树中
        insert(obj: T): void {
            if (this.nodes[0]) {
                const indexes = this.getIndexes(obj);
                for (const index of indexes) {
                    this.nodes[index].insert(obj);
                }
            }

            if (this.spatialHash.retrieve(obj).length > MAX_OBJECTS && this.level < MAX_LEVELS && !this.nodes[0]) {
                this.split();
            }

            this.spatialHash.insert(obj);
        }


        // 获取物体应该位于哪个象限
        getIndex(obj: T): number {
            let index = -1;
            let verticalMidpoint = FixedPoint.add(this.bounds.position.x, FixedPoint.div(this.bounds.width, 2));
            let horizontalMidpoint = FixedPoint.add(this.bounds.position.y, FixedPoint.div(this.bounds.height, 2));

            let topQuadrant = (obj.position.y.lt(horizontalMidpoint) && FixedPoint.add(obj.position.y, obj.height).lt(horizontalMidpoint));
            let bottomQuadrant = obj.position.y.gt(horizontalMidpoint);

            if (obj.position.x.lt(verticalMidpoint) && FixedPoint.add(obj.position.x, obj.width).lt(verticalMidpoint)) {
                if (topQuadrant) {
                    index = 1;
                } else if (bottomQuadrant) {
                    index = 2;
                }
            }
            else if (obj.position.x.gt(verticalMidpoint)) {
                if (topQuadrant) {
                    index = 0;
                } else if (bottomQuadrant) {
                    index = 3;
                }
            }

            return index;
        }

        // 获取物体可能位于的所有象限
        getIndexes(obj: T): number[] {
            const indexes: number[] = [];
            const verticalMidpoint = FixedPoint.add(this.bounds.position.x, FixedPoint.div(this.bounds.width, 2));
            const horizontalMidpoint = FixedPoint.add(this.bounds.position.y, FixedPoint.div(this.bounds.height, 2));

            const objRight = FixedPoint.add(obj.position.x, obj.width);
            const objBottom = FixedPoint.add(obj.position.y, obj.height);

            const topQuadrant = (obj.position.y.lt(horizontalMidpoint) && objBottom.lt(horizontalMidpoint));
            const bottomQuadrant = obj.position.y.gt(horizontalMidpoint);

            if (obj.position.x.lt(verticalMidpoint) && objRight.lt(verticalMidpoint)) {
                if (topQuadrant) {
                    indexes.push(1);
                }
                if (bottomQuadrant) {
                    indexes.push(2);
                }
            } else if (obj.position.x.gt(verticalMidpoint)) {
                if (topQuadrant) {
                    indexes.push(0);
                }
                if (bottomQuadrant) {
                    indexes.push(3);
                }
            }

            return indexes;
        }


        // 返回所有可能与给定物体发生碰撞的物体
        retrieve(returnObjects: Set<T>, obj: T): Set<T> {
            if (!this.boundsIntersects(obj)) {
                return returnObjects;
            }

            const objects = this.spatialHash.retrieve(obj);
            for (const object of objects) {
                if (this.collidesWith(object, obj)) {
                    returnObjects.add(object);
                }
            }

            if (this.nodes[0]) {
                for (const node of this.nodes) {
                    node.retrieve(returnObjects, obj);
                }
            }

            return returnObjects;
        }

        // 使用包围盒相交测试
        collidesWith(obj1: T, obj2: T): boolean {
            const obj1Right = FixedPoint.add(obj1.position.x, obj1.width);
            const obj1Bottom = FixedPoint.add(obj1.position.y, obj1.height);
            const obj2Right = FixedPoint.add(obj2.position.x, obj2.width);
            const obj2Bottom = FixedPoint.add(obj2.position.y, obj2.height);

            return !(obj1Right.lt(obj2.position.x) ||
                obj1Bottom.lt(obj2.position.y) ||
                obj1.position.x.gt(obj2Right) ||
                obj1.position.y.gt(obj2Bottom));
        }

        retrieveAll(): T[] {
            let objects: T[] = this.spatialHash.retrieveAll();

            if (this.nodes[0] != null) {
                for (let i = 0; i < this.nodes.length; i++) {
                    if (this.nodes[i] != null) {
                        objects = objects.concat(this.nodes[i].retrieveAll());
                    }
                }
            }

            return objects;
        }

        // 使用简化的相交检测
        boundsIntersects(obj: T): boolean {
            const objRight = FixedPoint.add(obj.position.x, obj.width);
            const objBottom = FixedPoint.add(obj.position.y, obj.height);
            const boundsRight = FixedPoint.add(this.bounds.position.x, this.bounds.width);
            const boundsBottom = FixedPoint.add(this.bounds.position.y, this.bounds.height);

            return !(objRight.lt(this.bounds.position.x) ||
                objBottom.lt(this.bounds.position.y) ||
                obj.position.x.gt(boundsRight) ||
                obj.position.y.gt(boundsBottom));
        }


        clear(): void {
            this.spatialHash.clear();

            for (let i = 0; i < this.nodes.length; i++) {
                if (this.nodes[i] != null) {
                    this.nodes[i].clear();
                    this.nodes[i] = null;
                }
            }
        }
    }
}