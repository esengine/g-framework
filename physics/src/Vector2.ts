module gs.physics {
    export class Vector2 {
        x: FixedPoint;
        y: FixedPoint;

        constructor(x: FixedPoint | number = 0, y: FixedPoint | number = 0) {
            this.x = x instanceof FixedPoint ? x : new FixedPoint(x);
            this.y = y instanceof FixedPoint ? y : new FixedPoint(y);
        }

        add(other: Vector2): Vector2 {
            return new Vector2(this.x.toFloat() + other.x.toFloat(), this.y.toFloat() + other.y.toFloat());
        }

        subtract(other: Vector2): Vector2 {
            return new Vector2(this.x.toFloat() - other.x.toFloat(), this.y.toFloat() - other.y.toFloat());
        }

        multiply(scalar: number): Vector2 {
            return new Vector2(this.x.toFloat() * scalar, this.y.toFloat() * scalar);
        }

        divide(scalar: number): Vector2 {
            return new Vector2(this.x.toFloat() / scalar, this.y.toFloat() / scalar);
        }

        multiplyScalar(scalar: number): Vector2 {
            return new Vector2(this.x.toFloat() * scalar, this.y.toFloat() * scalar);
        }

        divideScalar(scalar: number): Vector2 {
            return new Vector2(this.x.toFloat() / scalar, this.y.toFloat() / scalar);
        }

        /** 计算向量的长度 */
        length(): FixedPoint {
            return new FixedPoint(Math.sqrt(this.x.toFloat() * this.x.toFloat() + this.y.toFloat() * this.y.toFloat()));
        }

        /** 计算向量的平方长度 */
        lengthSquared(): FixedPoint {
            return new FixedPoint(this.x.toFloat() * this.x.toFloat() + this.y.toFloat() * this.y.toFloat());
        }

        /** 归一化向量 */
        normalize(): Vector2 {
            const len = this.length();
            return new Vector2(this.x.div(len), this.y.div(len));
        }

        /** 计算两个向量的点积 */
        dot(other: Vector2): FixedPoint {
            return new FixedPoint(this.x.toFloat() * other.x.toFloat() + this.y.toFloat() * other.y.toFloat());
        }

        /** 计算两个向量的叉积 */
        cross(other: Vector2): FixedPoint {
            return new FixedPoint(this.x.toFloat() * other.y.toFloat() - this.y.toFloat() * other.x.toFloat());
        }
        
        /** 计算到另一个向量的距离 */
        distanceTo(other: Vector2): FixedPoint {
            const dx = this.x.sub(other.x);
            const dy = this.y.sub(other.y);
            return new FixedPoint(Math.sqrt(dx.toFloat() * dx.toFloat() + dy.toFloat() * dy.toFloat()));
        }
    }
}