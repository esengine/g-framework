module gs.physics {
    export class AABB {
        min: Vector2;
        max: Vector2;

        constructor(min: Vector2, max: Vector2) {
            this.min = min;
            this.max = max;
        }

        get width(): FixedPoint {
            return this.max.x.sub(this.min.x);
        }

        get height(): FixedPoint {
            return this.max.y.sub(this.min.y);
        }

        /**
         * 检查这个AABB是否与另一个AABB相交
         * @param other 另一个AABB
         * @returns 是否相交
         */
        intersects(other: AABB): boolean {
            return !(this.max.x.lt(other.min.x) || this.min.x.gt(other.max.x) || this.max.y.lt(other.min.y) || this.min.y.gt(other.max.y));
        }

        /**
         * 扩展这个AABB以包含另一个AABB
         * @param other 另一个AABB
         */
        expandToInclude(other: AABB): void {
            this.min = new Vector2(FixedPoint.min(this.min.x, other.min.x), FixedPoint.min(this.min.y, other.min.y));
            this.max = new Vector2(FixedPoint.max(this.max.x, other.max.x), FixedPoint.max(this.max.y, other.max.y));
        }

        /**
         * 检查一个点是否在这个AABB内
         * @param point 要检查的点
         * @returns 点是否在AABB内
         */
        contains(point: Vector2): boolean {
            return point.x.gte(this.min.x) && point.x.lte(this.max.x) && point.y.gte(this.min.y) && point.y.lte(this.max.y);
        }
    }
}
