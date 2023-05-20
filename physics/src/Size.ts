module gs.physics {
    export class Size {
        public width: FixedPoint;
        public height: FixedPoint;

        constructor(width: number = 0, height: number = 0) {
            this.width = new FixedPoint(width);
            this.height = new FixedPoint(height);
        }

        add(other: Size): Size {
            return new Size(this.width.toFloat() + other.width.toFloat(), this.height.toFloat() + other.height.toFloat());
        }

        subtract(other: Size): Size {
            return new Size(this.width.toFloat() - other.width.toFloat(), this.height.toFloat() - other.height.toFloat());
        }

        multiply(scalar: number): Size {
            return new Size(this.width.toFloat() * scalar, this.height.toFloat() * scalar);
        }

        divide(scalar: number): Size {
            return new Size(this.width.toFloat() / scalar, this.height.toFloat() / scalar);
        }
    }
}
