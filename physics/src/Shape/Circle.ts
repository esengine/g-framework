module gs.physics {
    export class Circle implements CircleBounds {
        position: Vector2;
        radius: FixedPoint;
        entity: Entity;

        get width(): FixedPoint {
            return this.radius.mul(2);
        }

        get height(): FixedPoint {
            return this.radius.mul(2);
        }

        /**
         * 计算圆形面积
         * @returns 
         */
        area(): FixedPoint {
            return this.radius.mul(this.radius).mul(Math.PI);
        }

        /**
         * 计算圆形周长
         * @returns 
         */
        circumference(): FixedPoint {
            return this.radius.mul(2).mul(Math.PI);
        }

        /**
         * 判断点是否在圆内
         * @param point 
         * @returns 
         */
        containsPoint(point: Vector2): boolean {
            return this.position.distanceTo(point).lte(this.radius);
        }

        /**
         * 判断两个圆是否相交
         * @param other 
         * @returns 
         */
        intersects(other: Circle): boolean {
            return this.position.distanceTo(other.position).lte(this.radius.add(other.radius));
        }
    }
}