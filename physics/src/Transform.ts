module gs.physics {
    export class Transform extends Component {
        public position: Vector2;

        onInitialize(x: number = 0, y: number = 0): void {
            this.position = new Vector2(x, y);
        }
    }
}