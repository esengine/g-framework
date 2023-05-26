module gs.physics {
    export class Collider extends Component {
        dependencies: ComponentConstructor<Component>[] = [
            Transform
        ];
        
        private _bounds: Bounds;
        isColliding: boolean;
        
        private _transform: Transform;
        public get transform() {
            if (this._transform == null) {
                this._transform = this.entity.getComponent(Transform);
            }

            return this._transform;
        }

        getBounds(): Bounds {
            this._bounds.position = this.transform.position;
            return this._bounds;
        }

        setBounds(bounds: Bounds): void {
            this._bounds = bounds;
        }

        intersects(other: Collider): boolean {
            return this.getBounds().intersects(other.getBounds());
        }

        contains(other: Collider): boolean {
            return this.getBounds().contains(other.getBounds());
        }
    }
}