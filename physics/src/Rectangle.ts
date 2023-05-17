module gs {
    export class Rectangle {
        constructor(public x: number, public y: number, public width: number, public height: number) { }

        contains(point: Point) {
            return (point.x >= this.x &&
                point.x < this.x + this.width &&
                point.y >= this.y &&
                point.y < this.y + this.height);
        }

        intersects(range: Rectangle): boolean {
            return !(range.x >= this.x + this.width ||
                range.x + range.width <= this.x ||
                range.y >= this.y + this.height ||
                range.y + range.height <= this.y);
        }

        intersectsAABB(aabb: AABB): boolean {
            return this.x < aabb.maxX &&
                this.y > aabb.minX &&
                this.width < aabb.maxY &&
                this.height > aabb.minY;
        }
    }
}