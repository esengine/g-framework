///<reference path="Collider.ts" />
module gs.physics {
    export class BoxCollider extends Collider {
        private size: Size;
        private transform: Transform;

        public onInitialize(size: Size): void {
            this.size = size;
            this.transform = this.entity.getComponent(Transform);
        }

        getBounds(): BoxBounds {
            return {
                position: this.transform.position,
                width: this.size.width,
                height: this.size.height,
            };
        }
    }
}
