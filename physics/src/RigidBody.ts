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
            this.velocity = new Vector2();
            this.acceleration = new Vector2();
            this.isKinematic = isKinematic;
        }

        applyForce(force: Vector2): void {
            // 使用 F = m * a，或者 a = F / m
            const forceAccel = new Vector2(force.x.div(this.mass), force.y.div(this.mass));
            this.acceleration = this.acceleration.add(forceAccel);
        }

        update(deltaTime: number): void {
            this.velocity = this.velocity.add(this.acceleration.mul(deltaTime));
            
            const transform = this.entity.getComponent(Transform);
            // 无论加速度是否为零，都应将速度应用于位置
            transform.position = transform.position.add(this.velocity.mul(deltaTime));

            // 重置加速度
            this.acceleration.set(new FixedPoint(0), new FixedPoint(0));
        }
    }
}
