module gs.physics {
    export class Collider extends Component {
        isColliding: boolean;
        getBounds(): Bounds {
            return { position: new Vector2(), width: new FixedPoint(), height: new FixedPoint(), entity: this.entity };
        }
    }
}