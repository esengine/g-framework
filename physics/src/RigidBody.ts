module gs.physics {
    export class RigidBody extends Component {
        dependencies: ComponentConstructor<Component>[] = [
            Transform
        ];

        public mass: FixedPoint;  // 质量
        public velocity: Vector2;  // 速度
        public acceleration: Vector2;  // 加速度
        public isKinematic: boolean;  // 是否是运动学刚体

        onInitialize(mass: FixedPoint = new FixedPoint(1), isKinematic: boolean = false) {
            this.mass = mass;
            this.velocity = new Vector2(new FixedPoint(0), new FixedPoint(0));
            this.acceleration = new Vector2(new FixedPoint(0), new FixedPoint(0));
            this.isKinematic = isKinematic;
        }

        applyForce(force: Vector2): void {
            // 使用 F = m * a，或者 a = F / m
            const forceAccel = new Vector2(force.x.div(this.mass), force.y.div(this.mass));
            this.acceleration = this.acceleration.add(forceAccel);
        }

        update(deltaTime: FixedPoint): void {
            // 更新速度和位置
            this.velocity = this.velocity.add(new Vector2(this.acceleration.x.mul(deltaTime), this.acceleration.y.mul(deltaTime)));
            const position = this.entity.getComponent(Transform).position;
            this.entity.getComponent(Transform).position = position.add(new Vector2(this.velocity.x.mul(deltaTime), this.velocity.y.mul(deltaTime)));

            // 重置加速度
            this.acceleration.set(new FixedPoint(0), new FixedPoint(0));
        }
    }
}
