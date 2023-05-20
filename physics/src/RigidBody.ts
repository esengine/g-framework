module gs.physics {
    export class RigidBody extends Component {
        public position: Vector2 = new Vector2();
        public velocity: Vector2 = new Vector2();
        public mass: FixedPoint = new FixedPoint();
        public size: Vector2 = new Vector2();
    }
}