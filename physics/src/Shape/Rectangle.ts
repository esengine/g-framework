module gs.physics {
    export class Rectangle implements BoxBounds {
        position: Vector2;
        width: FixedPoint;
        height: FixedPoint;
        entity: Entity;

        /**
         * 计算矩形面积
         * @returns 
         */
        area(): FixedPoint {
            return this.width.mul(this.height);
        }

        /**
         * 判断点是否在矩形内
         * @param point 
         * @returns 
         */
        containsPoint(point: Vector2): boolean {
            return point.x.gte(this.position.x) &&
                   point.x.lte(this.position.x.add(this.width)) &&
                   point.y.gte(this.position.y) &&
                   point.y.lte(this.position.y.add(this.height));
        }

        /**
         * 判断两个矩形是否相交
         * @param rect 
         * @returns 
         */
        intersects(rect: Rectangle): boolean {
            return !(rect.position.x.add(rect.width).lt(this.position.x) ||
                     rect.position.y.add(rect.height).lt(this.position.y) ||
                     rect.position.x.gt(this.position.x.add(this.width)) ||
                     rect.position.y.gt(this.position.y.add(this.height)));
        }
    }
}