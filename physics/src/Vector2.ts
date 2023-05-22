module gs.physics {
    export class Vector2 {
        x: FixedPoint;
        y: FixedPoint;

        constructor(x: FixedPoint | number = 0, y: FixedPoint | number = 0) {
            this.x = x instanceof FixedPoint ? x : new FixedPoint(x);
            this.y = y instanceof FixedPoint ? y : new FixedPoint(y);
        }

        add(other: Vector2): Vector2 {
            return new Vector2(FixedPoint.add(this.x, other.x), FixedPoint.add(this.y, other.y));
        }

        sub(other: Vector2): Vector2 {
            return new Vector2(FixedPoint.sub(this.x, other.x), FixedPoint.sub(this.y, other.y));
        }

        mul(scalar: FixedPoint | number): Vector2 {
            return new Vector2(FixedPoint.mul(this.x, scalar), FixedPoint.mul(this.y, scalar));
        }

        div(scalar: FixedPoint | number): Vector2 {
            return new Vector2(FixedPoint.div(this.x, scalar), FixedPoint.div(this.y, scalar));
        }

        /** 计算向量的长度 */
        length(): FixedPoint {
            const lengthSquared = FixedPoint.add(FixedPoint.mul(this.x, this.x), FixedPoint.mul(this.y, this.y));
            return FixedPoint.from(Math.sqrt(lengthSquared.toFloat()));
        }

        /** 计算向量的平方长度 */
        lengthSquared(): FixedPoint {
            return FixedPoint.add(FixedPoint.mul(this.x, this.x), FixedPoint.mul(this.y, this.y));
        }

        /** 归一化向量 */
        normalize(): Vector2 {
            const len = this.length();
            return new Vector2(FixedPoint.div(this.x, len), FixedPoint.div(this.y, len));
        }

        /** 计算两个向量的点积 */
        dot(other: Vector2): FixedPoint {
            return FixedPoint.add(FixedPoint.mul(this.x, other.x), FixedPoint.mul(this.y, other.y));
        }

        /** 计算两个向量的叉积 */
        cross(other: Vector2): FixedPoint {
            return FixedPoint.sub(FixedPoint.mul(this.x, other.y), FixedPoint.mul(this.y, other.x));
        }

        /** 计算到另一个向量的距离 */
        distanceTo(other: Vector2): FixedPoint {
            const dx = FixedPoint.sub(this.x, other.x);
            const dy = FixedPoint.sub(this.y, other.y);
            const distanceSquared = FixedPoint.add(FixedPoint.mul(dx, dx), FixedPoint.mul(dy, dy));
            return FixedPoint.from(Math.sqrt(distanceSquared.toFloat()));
        }
    }
}