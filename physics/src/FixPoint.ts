module gs.physics {
    /**
     * FixedPoint 类表示用于物理运算的定点数值。
     * 这种定点数值在游戏和物理模拟中常常用于解决浮点数精度问题。
     */
    export class FixedPoint {
        /**
         * 原始值，根据精度扩大的整数
         */
        rawValue: number;
        /**
        * 精度，扩大的倍数，例如1000表示小数点后三位
        */
        precision: number;

        /**
         * 创建一个新的 FixedPoint 实例
         * @param value - 输入的浮点数值，默认为 0
         * @param precision - 指定的精度，默认为 1000
         */
        constructor(value: number = 0, precision: number = 1000) {
            this.rawValue = Math.round(value * precision);
            this.precision = precision;
        }

        /**
         * 将当前 FixedPoint 实例与另一个 FixedPoint 实例或数字相加
         * @param other - 要添加的其他 FixedPoint 实例或数字
         * @returns 新的 FixedPoint 实例，表示相加的结果
         */
        add(other: FixedPoint | number): FixedPoint {
            if (other instanceof FixedPoint) {
                return FixedPoint.fromRawValue(this.rawValue + other.rawValue, this.precision);
            } else {
                return FixedPoint.fromRawValue(this.rawValue + Math.round(other * this.precision), this.precision);
            }
        }

        /**
         * 将当前 FixedPoint 实例与另一个 FixedPoint 实例或数字相减
         * @param other - 要减去的其他 FixedPoint 实例或数字
         * @returns 新的 FixedPoint 实例，表示相减的结果
         */
        sub(other: FixedPoint | number): FixedPoint {
            const result = new FixedPoint(0, this.precision);
            if (other instanceof FixedPoint) {
                result.rawValue = this.rawValue - other.rawValue;
            } else {
                result.rawValue = this.rawValue - Math.round(other * this.precision);
            }
            return result;
        }

        /**
         * 将当前 FixedPoint 实例与另一个 FixedPoint 实例或数字相乘
         * @param other - 要相乘的其他 FixedPoint 实例或数字
         * @returns 新的 FixedPoint 实例，表示相乘的结果
         */
        mul(other: FixedPoint | number): FixedPoint {
            const result = new FixedPoint(0, this.precision);
            if (other instanceof FixedPoint) {
                result.rawValue = Math.round((this.rawValue * other.rawValue) / this.precision);
            } else {
                result.rawValue = Math.round(this.rawValue * other);
            }
            return result;
        }

        /**
         * 将当前 FixedPoint 实例与另一个 FixedPoint 实例或数字相除
         * @param other - 要相除的其他 FixedPoint 实例或数字
         * @returns 新的 FixedPoint 实例，表示相除的结果
         */
        div(other: FixedPoint | number): FixedPoint {
            const result = new FixedPoint(0, this.precision);
            if (other instanceof FixedPoint) {
                result.rawValue = Math.round((this.rawValue * this.precision) / other.rawValue);
            } else {
                result.rawValue = Math.round(this.rawValue / other);
            }
            return result;
        }

        /**
         * 返回当前 FixedPoint 实例的绝对值
         * @returns 新的 FixedPoint 实例，表示绝对值的结果
         */
        abs(): FixedPoint {
            const result = new FixedPoint(0, this.precision);
            result.rawValue = Math.abs(this.rawValue);
            return result;
        }

        /**
         * 将当前 FixedPoint 实例的值取指定次方
         * @param exponent - 指定的次方数
         * @returns 新的 FixedPoint 实例，表示次方的结果
         */
        pow(exponent: number): FixedPoint {
            const floatResult = Math.pow(this.toFloat(), exponent);
            return FixedPoint.from(floatResult);
        }

        /**
         * 判断当前 FixedPoint 实例是否等于另一个 FixedPoint 实例或数字
         * @param other - 要比较的其他 FixedPoint 实例或数字
         * @returns 如果相等则返回 true，否则返回 false
         */
        equals(other: FixedPoint | number): boolean {
            if (other instanceof FixedPoint) {
                return this.rawValue === other.rawValue;
            } else {
                return this.rawValue === Math.round(other * this.precision);
            }
        }

        /**
         * 判断当前 FixedPoint 实例是否小于另一个 FixedPoint 实例或数字
         * @param other - 要比较的其他 FixedPoint 实例或数字
         * @returns 如果小于则返回 true，否则返回 false
         */
        lt(other: FixedPoint | number): boolean {
            if (other instanceof FixedPoint) {
                return this.rawValue < other.rawValue;
            } else {
                return this.rawValue < Math.round(other * this.precision);
            }
        }

        /**
         * 判断当前 FixedPoint 实例是否大于另一个 FixedPoint 实例或数字
         * @param other - 要比较的其他 FixedPoint 实例或数字
         * @returns 如果大于则返回 true，否则返回 false
         */
        gt(other: FixedPoint | number): boolean {
            if (other instanceof FixedPoint) {
                return this.rawValue > other.rawValue;
            } else {
                return this.rawValue > Math.round(other * this.precision);
            }
        }

        /**
         * 判断当前 FixedPoint 实例是否大于等于另一个 FixedPoint 实例或数字
         * @param other - 要比较的其他 FixedPoint 实例或数字
         * @returns 如果大于等于则返回 true，否则返回 false
         */
        gte(other: FixedPoint | number): boolean {
            if (other instanceof FixedPoint) {
                return this.rawValue >= other.rawValue;
            } else {
                return this.rawValue >= Math.round(other * this.precision);
            }
        }

        /**
         * 判断当前 FixedPoint 实例是否小于等于另一个 FixedPoint 实例或数字
         * @param other - 要比较的其他 FixedPoint 实例或数字
         * @returns 如果小于等于则返回 true，否则返回 false
         */
        lte(other: FixedPoint | number): boolean {
            if (other instanceof FixedPoint) {
                return this.rawValue <= other.rawValue;
            } else {
                return this.rawValue <= Math.round(other * this.precision);
            }
        }

        /**
         * 对当前 FixedPoint 实例的值取反
         * @returns 新的 FixedPoint 实例，表示取反的结果
         */
        negate(): FixedPoint {
            return FixedPoint.fromRawValue(-this.rawValue, this.precision);
        }

        /**
         * 将当前 FixedPoint 实例转换为浮点数
         * @returns 转换后的浮点数
         */
        toFloat() {
            return this.rawValue / this.precision;
        }

        /**
         * 将当前 FixedPoint 实例转换为固定位数的字符串
         * @param digits - 指定的小数位数，默认为 0
         * @returns 转换后的字符串
         */
        toFixed(digits: number = 0): string {
            return this.toFloat().toFixed(digits);
        }

        /**
         * 计算当前 FixedPoint 实例的平方根
         * @returns 新的 FixedPoint 实例，表示平方根的结果
         */
        sqrt(): FixedPoint {
            return FixedPoint.from(Math.sqrt(this.toFloat()));
        }

        /**
         * 对当前 FixedPoint 实例进行四舍五入
         * @returns 新的 FixedPoint 实例，表示四舍五入的结果
         */
        round(): FixedPoint {
            return FixedPoint.from(Math.round(this.toFloat()));
        }

        /**
         * 对两个 FixedPoint 实例进行加法运算
         * @param a - 第一个 FixedPoint 实例
         * @param b - 第二个 FixedPoint 实例或数字
         * @returns 新的 FixedPoint 实例，表示相加的结果
         */
        static add(a: FixedPoint, b: FixedPoint | number): FixedPoint {
            return a.add(b);
        }

        /**
         * 对两个 FixedPoint 实例进行减法运算
         * @param a - 第一个 FixedPoint 实例
         * @param b - 第二个 FixedPoint 实例或数字
         * @returns 新的 FixedPoint 实例，表示相减的结果
         */
        static sub(a: FixedPoint, b: FixedPoint | number): FixedPoint {
            return a.sub(b);
        }

        /**
         * 对两个 FixedPoint 实例进行乘法运算
         * @param a - 第一个 FixedPoint 实例
         * @param b - 第二个 FixedPoint 实例或数字
         * @returns 新的 FixedPoint 实例，表示相乘的结果
         */
        static mul(a: FixedPoint, b: FixedPoint | number): FixedPoint {
            return a.mul(b);
        }

        /**
         * 对两个 FixedPoint 实例进行除法运算
         * @param a - 第一个 FixedPoint 实例
         * @param b - 第二个 FixedPoint 实例或数字
         * @returns 新的 FixedPoint 实例，表示相除的结果
         */
        static div(a: FixedPoint, b: FixedPoint | number): FixedPoint {
            return a.div(b);
        }

        /**
         * 比较两个 FixedPoint 实例，返回较大者
         * @param a - 第一个 FixedPoint 实例
         * @param b - 第二个 FixedPoint 实例
         * @returns 较大的 FixedPoint 实例
         */
        static max(a: FixedPoint, b: FixedPoint): FixedPoint {
            return a.gt(b) ? a : b;
        }

        /**
         * 比较两个 FixedPoint 实例，返回较小者
         * @param a - 第一个 FixedPoint 实例
         * @param b - 第二个 FixedPoint 实例
         * @returns 较小的 FixedPoint 实例
         */
        static min(a: FixedPoint, b: FixedPoint): FixedPoint {
            return a.lt(b) ? a : b;
        }

        /**
         * 从一个原始值和精度创建一个新的 FixedPoint 实例
         * @param rawValue - 原始值，根据精度扩大的整数
         * @param precision - 指定的精度，默认为 1000
         * @returns 新的 FixedPoint 实例
         */
        static fromRawValue(rawValue: number, precision: number = 1000): FixedPoint {
            const result = new FixedPoint(0, precision);
            result.rawValue = rawValue;
            return result;
        }

        /**
         * 从一个浮点数创建一个新的 FixedPoint 实例
         * @param value - 输入的浮点数值
         * @param precision - 指定的精度，默认为 1000
         * @returns 新的 FixedPoint 实例
         */
        static from(value: number, precision: number = 1000): FixedPoint {
            return new FixedPoint(value, precision);
        }
    }
}
