module gs.physics {
    export class Collider extends Component {
        dependencies: ComponentConstructor<Component>[] = [
            Transform
        ];
        
        private _bounds: Bounds;
        collidingEntities: Set<Entity> = new Set();

        onCollisionEnter: (other: Entity) => void = () => {};
        onCollisionStay: (other: Entity) => void = () => {};
        onCollisionExit: (other: Entity) => void = () => {};
        
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

        handleCollision(other: Entity): void {
            if (!this.collidingEntities.has(other)) {
                this.collidingEntities.add(other);
                this.onCollisionEnter(other);
            } else {
                this.onCollisionStay(other);
            }
        }

        handleCollisionExit(other: Entity): void {
            if (this.collidingEntities.has(other)) {
                this.collidingEntities.delete(other);
                this.onCollisionExit(other);
            }
        }

        getCollisionNormal(other: Collider): Vector2 {
            const boundsA = this.getBounds();
            const boundsB = other.getBounds();
        
            // 计算两个矩形的中心点
            const centerA = boundsA.position.add(new Vector2(new FixedPoint(boundsA.width.toFloat() / 2), new FixedPoint(boundsA.height.toFloat() / 2)));
            const centerB = boundsB.position.add(new Vector2(new FixedPoint(boundsB.width.toFloat() / 2), new FixedPoint(boundsB.height.toFloat() / 2)));
        
            // 计算相对位置
            const relativePosition = centerB.sub(centerA);
        
            // 计算相对位置在X和Y方向上的分量，然后比较它们，确定碰撞发生在哪个轴上
            if (Math.abs(relativePosition.x.toFloat()) > Math.abs(relativePosition.y.toFloat())) {
                // 如果X分量更大，那么碰撞发生在X轴上，法线应该是(1, 0)或者(-1, 0)
                return new Vector2(new FixedPoint(relativePosition.x.toFloat() > 0 ? 1 : -1), new FixedPoint(0));
            } else {
                // 如果Y分量更大或者相等，那么碰撞发生在Y轴上，法线应该是(0, 1)或者(0, -1)
                return new Vector2(new FixedPoint(0), new FixedPoint(relativePosition.y.toFloat() > 0 ? 1 : -1));
            }
        }

        calculatePenetrationDepthAndNormal(other: Collider): { penetrationDepth: FixedPoint, collisionNormal: Vector2 } {
            return this.getBounds().calculatePenetrationDepthAndNormal(other.getBounds());
        }

        intersects(other: Collider): boolean {
            return this.getBounds().intersects(other.getBounds());
        }

        contains(other: Collider): boolean {
            return this.getBounds().contains(other.getBounds());
        }
    }
}