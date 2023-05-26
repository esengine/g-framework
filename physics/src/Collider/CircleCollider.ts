module gs.physics {
    export class CircleCollider extends Collider {
        private radius: FixedPoint;

        onInitialize(radius: FixedPoint): void {
            this.radius = radius;
            const bounds = new CircleBounds(this.transform.position, this.radius, this.entity);
            this.setBounds(bounds);
        }
    }
}