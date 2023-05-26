module gs.physics {
    export class IntersectionVisitor implements BoundsVisitor {
        private other: Bounds;
        private result: boolean;

        constructor(other: Bounds) {
            this.other = other;
            this.result = false;
        }

        visitBox(box: BoxBounds): void {
            if (this.other instanceof BoxBounds) {
                const otherBox = this.other;
                this.result = !(box.position.x.toFloat() + box.width.toFloat() < otherBox.position.x.toFloat() ||
                    otherBox.position.x.toFloat() + otherBox.width.toFloat() < box.position.x.toFloat() ||
                    box.position.y.toFloat() + box.height.toFloat() < otherBox.position.y.toFloat() ||
                    otherBox.position.y.toFloat() + otherBox.height.toFloat() < box.position.y.toFloat());
            } else if (this.other instanceof CircleBounds) {
                this.result = this.intersectsBoxCircle(box, this.other);
            }
        }

        visitCircle(circle: CircleBounds): void {
            if (this.other instanceof CircleBounds) {
                const otherCircle = this.other;
                const dx = circle.position.x.toFloat() - otherCircle.position.x.toFloat();
                const dy = circle.position.y.toFloat() - otherCircle.position.y.toFloat();
                const distance = Math.sqrt(dx * dx + dy * dy);
                this.result = distance < circle.radius.toFloat() + otherCircle.radius.toFloat();
            } else if (this.other instanceof BoxBounds) {
                this.result = this.intersectsBoxCircle(this.other, circle);
            }
        }

        intersectsBoxCircle(box: BoxBounds, circle: CircleBounds): boolean {
            const circleDistanceX = Math.abs(circle.position.x.toFloat() - box.position.x.toFloat() - box.width.toFloat() / 2);
            const circleDistanceY = Math.abs(circle.position.y.toFloat() - box.position.y.toFloat() - box.height.toFloat() / 2);

            if (circleDistanceX > (box.width.toFloat() / 2 + circle.radius.toFloat())) { return false; }
            if (circleDistanceY > (box.height.toFloat() / 2 + circle.radius.toFloat())) { return false; }

            if (circleDistanceX <= (box.width.toFloat() / 2)) { return true; }
            if (circleDistanceY <= (box.height.toFloat() / 2)) { return true; }

            const cornerDistanceSq = Math.pow(circleDistanceX - box.width.toFloat() / 2, 2) +
                Math.pow(circleDistanceY - box.height.toFloat() / 2, 2);

            return (cornerDistanceSq <= Math.pow(circle.radius.toFloat(), 2));
        }

        getResult(): boolean {
            return this.result;
        }
    }
}
