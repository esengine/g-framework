module gs.physics {
    export class Vector2 {
        public static zero() {
            return new Vector2();
        }

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

        isZero(): boolean {
            return this.x.toFloat() == 0 && this.y.toFloat() == 0;
        }

        set(x: FixedPoint, y: FixedPoint): Vector2 {
            this.x = x;
            this.y = y;
            return this;
        }

        setR(value: Vector2): Vector2 {
            this.x = value.x;
            this.y = value.y;
            return this;
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

        /** 计算两个向量的叉积 */
        crossR(other: FixedPoint): FixedPoint {
            return FixedPoint.sub(this.x.mul(other), this.y.mul(other));
        }

        /** 计算到另一个向量的距离 */
        distanceTo(other: Vector2): FixedPoint {
            const dx = FixedPoint.sub(this.x, other.x);
            const dy = FixedPoint.sub(this.y, other.y);
            const distanceSquared = FixedPoint.add(FixedPoint.mul(dx, dx), FixedPoint.mul(dy, dy));
            return FixedPoint.from(Math.sqrt(distanceSquared.toFloat()));
        }

        /** 获取当前向量逆时针旋转90度的垂直向量 */
        perp(): Vector2 {
            return new Vector2(this.y.negate(), this.x);
        }

        /** 获取当前向量顺时针旋转90度的垂直向量 */
        perpR(): Vector2 {
            return new Vector2(this.y, this.x.negate());
        }

        lengthSq(): FixedPoint {
            return this.x.mul(this.x).add(this.y.mul(this.y));
        }

        /**
        * 对该向量进行夹紧操作
        * @param min 最小值
        * @param max 最大值
        */
        public clamp(min: Vector2, max: Vector2): Vector2 {
            let x = FixedPoint.clamp(this.x, min.x, max.x);
            let y = FixedPoint.clamp(this.y, min.y, max.y);

            return new Vector2(x, y);
        }

        /**
        * 创建一个包含指定向量反转的新Vector2
        * @returns 矢量反演的结果
        */
        public negate(): Vector2 {
            return new Vector2(this.x.negate(), this.y.negate());
        }

        /**
        * 创建一个包含指定向量反转的新Vector2
        * @param value
        * @returns 矢量反演的结果
        */
        public static negate(value: Vector2) {
            value.x = value.x.negate();
            value.y = value.y.negate();

            return value;
        }
    }
}