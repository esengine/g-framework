module gs.physics {
    export class Vector2 {
        x: FixedPoint;
        y: FixedPoint;

        constructor(x: number = 0, y: number = 0) {
            this.x = new FixedPoint(x);
            this.y = new FixedPoint(y);
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
    }
}