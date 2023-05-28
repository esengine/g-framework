module gs.physics {
    export class RigidBody extends Component {
        dependencies: ComponentConstructor<Component>[] = [
            Transform
        ];

        public lastPosition: Vector2;
        /** 质量 */
        public mass: FixedPoint;
        /** 速度 */
        public velocity: Vector2;
        /** 刚体的加速度 */
        public acceleration: Vector2;
        /** 是否是运动学刚体 */
        public isKinematic: boolean;
        /** 刚体的弹性 */
        public restitution: FixedPoint;
        /** 质量的倒数 */
        public inv_mass: FixedPoint;

        _transform: Transform;
        get transform() {
            if (!this._transform)
                this._transform = this.entity.getComponent(Transform);
            return this._transform;
        }

        onInitialize(mass: FixedPoint = new FixedPoint(1), isKinematic: boolean = false) {
            this.mass = mass;
            this.velocity = new Vector2();
            this.acceleration = new Vector2();
            this.isKinematic = isKinematic;
            this.restitution = new FixedPoint(1);

            // 如果质量为0，为了防止除数为0，设置其倒数为无穷大，否则为1/mass
            this.inv_mass = this.mass.equals(0) ? FixedPoint.MAX_VALUE : new FixedPoint(1).div(this.mass);

            // 初始化上次位置为当前位置
            this.lastPosition = this.transform.position;
        }

        /**
         * 对刚体施加力，根据 F = m * a 计算加速度
         * @param force 
         */
        applyForce(force: Vector2): void {
            const forceAccel = new Vector2(force.x.div(this.mass), force.y.div(this.mass));
            this.acceleration = this.acceleration.add(forceAccel);
        }

        update(deltaTime: number): void {
           // 根据 a = v / t 计算速度
           this.velocity = this.velocity.add(this.acceleration.mul(deltaTime));

           // 更新上次位置
           this.lastPosition = this.transform.position;

           // 无论加速度是否为零，都应将速度应用于位置
           this.transform.position = this.transform.position.add(this.velocity.mul(deltaTime));

           // 重置加速度
           this.acceleration.set(new FixedPoint(0), new FixedPoint(0));
        }
    }
}
