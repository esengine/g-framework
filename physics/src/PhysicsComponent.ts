module gs.physics {
    export class PhysicsComponent extends Component {
        aabb: AABB;

        onInitialize(aabb: AABB): void {
            this.aabb = aabb;
        }
    }
}