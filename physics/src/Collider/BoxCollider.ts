///<reference path="Collider.ts" />
module gs.physics {
    export class BoxCollider extends Collider {
        private size: Size;

        onInitialize(size: Size): void {
            this.size = size;
            const bounds = new BoxBounds(this.transform.position, this.size.width, this.size.height, this.entity);
            this.setBounds(bounds);
        }
    }
}
