module gs.physics {
    export class ContainVisitor implements BoundsVisitor {
        private other: Bounds;
        private result: boolean;

        constructor(other: Bounds) {
            this.other = other;
            this.result = false;
        }

        visitBox(box: BoxBounds): void {
            if (this.other instanceof BoxBounds) {
                const otherBox = this.other;
                this.result = (box.position.x.toFloat() <= otherBox.position.x.toFloat() &&
                    box.position.y.toFloat() <= otherBox.position.y.toFloat() &&
                    box.position.x.toFloat() + box.width.toFloat() >= otherBox.position.x.toFloat() + otherBox.width.toFloat() &&
                    box.position.y.toFloat() + box.height.toFloat() >= otherBox.position.y.toFloat() + otherBox.height.toFloat());
            } else if (this.other instanceof CircleBounds) {
                const otherCircle = this.other;
                const circleBoundingBox = new BoxBounds(otherCircle.position, otherCircle.radius.mul(2), otherCircle.radius.mul(2), otherCircle.entity);
                this.result = (box.position.x.toFloat() <= circleBoundingBox.position.x.toFloat() &&
                    box.position.y.toFloat() <= circleBoundingBox.position.y.toFloat() &&
                    box.position.x.toFloat() + box.width.toFloat() >= circleBoundingBox.position.x.toFloat() + circleBoundingBox.width.toFloat() &&
                    box.position.y.toFloat() + box.height.toFloat() >= circleBoundingBox.position.y.toFloat() + circleBoundingBox.height.toFloat());
            }
        }

        visitCircle(circle: CircleBounds): void {
            if (this.other instanceof CircleBounds) {
                const otherCircle = this.other;
                const dx = circle.position.x.toFloat() - otherCircle.position.x.toFloat();
                const dy = circle.position.y.toFloat() - otherCircle.position.y.toFloat();
                const distance = Math.sqrt(dx * dx + dy * dy);
                this.result = (distance + otherCircle.radius.toFloat() <= circle.radius.toFloat());
            } else if (this.other instanceof BoxBounds) {
                const otherBox = this.other;
                const boxBoundingCircleRadius = Math.sqrt(Math.pow(otherBox.width.toFloat() / 2, 2) + Math.pow(otherBox.height.toFloat() / 2, 2));
                const boxBoundingCircle = new CircleBounds(otherBox.position.add(new Vector2(otherBox.width.div(2), otherBox.height.div(2))), new FixedPoint(boxBoundingCircleRadius), otherBox.entity);
                const dx = circle.position.x.toFloat() - boxBoundingCircle.position.x.toFloat();
                const dy = circle.position.y.toFloat() - boxBoundingCircle.position.y.toFloat();
                const distance = Math.sqrt(dx * dx + dy * dy);
                this.result = (distance + boxBoundingCircle.radius.toFloat() <= circle.radius.toFloat());
            }
        }

        getResult(): boolean {
            return this.result;
        }
    }
}
