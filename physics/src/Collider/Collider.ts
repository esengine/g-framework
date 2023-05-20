module gs.physics {
    export abstract class Collider extends Component {
        abstract getBounds(): Bounds;
    }
}