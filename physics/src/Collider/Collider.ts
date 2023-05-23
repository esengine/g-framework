module gs.physics {
    export class Collider extends Component {
        bounds: Bounds;
        isColliding: boolean;
        
        getBounds(): Bounds {
            return this.bounds;
        }

        setBounds(bounds: Bounds): void {
            this.bounds = bounds;
        }

        intersects(other: Collider): boolean {
            return this.getBounds().intersects(other.getBounds());
        }

        contains(other: Collider): boolean {
            return this.getBounds().contains(other.getBounds());
        }
    }
}