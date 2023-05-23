///<reference path="Collider.ts" />
module gs.physics {
    export class BoxCollider extends Collider {
        private size: Size;
        private transform: Transform;

        dependencies: ComponentConstructor<Component>[] = [
            Transform
        ];

        onInitialize(size: Size): void {
            this.size = size;
            this.transform = this.entity.getComponent(Transform);
            const bounds = new BoxBounds(this.transform.position, this.size.width, this.size.height, this.entity);
            this.setBounds(bounds);
        }
    }
}
