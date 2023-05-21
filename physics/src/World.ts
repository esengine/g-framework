module gs.physics {
    export class World implements IPlugin {
        gravity: FixedPoint;
        timeStep: FixedPoint;
        bodies: RigidBody[];
        size: Size;
        initialPos: Vector2;

        name = "PhysicsPlugin";

        constructor(gravity: FixedPoint = new FixedPoint(0, -9.81), timeStep: FixedPoint = new FixedPoint(1, 60), initialPos: Vector2 = new Vector2(), initialSize: Size = new Size(1000, 1000)) {
            this.gravity = gravity;
            this.timeStep = timeStep;
            this.bodies = [];
            this.initialPos = initialPos;
            this.size = initialSize;
        }

        onInit(core: Core): void { 
            core.systemManager.registerSystem(new CollisionResponseSystem(core.entityManager));
        }

        onUpdate(deltaTime: number): void {
            this.step();
        }

        addBody(body: RigidBody): void {
            this.bodies.push(body);
        }

        updateSize(): void {
            for (let body of this.bodies) {
                this.size.width = FixedPoint.max(this.size.width, FixedPoint.add(body.position.x, body.size.x));
                this.size.height = FixedPoint.max(this.size.height, FixedPoint.add(body.position.y, body.size.y));
            }
        }

        handleBorderCollision(body: RigidBody): void {
            // 当物体碰到边界时反弹
            if (body.position.x.lt(0) || FixedPoint.add(body.position.x, body.size.x).gt(this.size.width)) {
                body.velocity.x = body.velocity.x.neg();
            }
            if (body.position.y.lt(0) || FixedPoint.add(body.position.y, body.size.y).gt(this.size.height)) {
                body.velocity.y = body.velocity.y.neg();
            }
        }

        step(): void {
            // for (let body of this.bodies) {
            //     // 更新速度
            //     body.velocity.y = FixedPoint.add(body.velocity.y, FixedPoint.mul(this.gravity, this.timeStep));
            //     // 更新位置
            //     body.position.x = FixedPoint.add(body.position.x, FixedPoint.mul(body.velocity.x, this.timeStep));
            //     body.position.y = FixedPoint.add(body.position.y, FixedPoint.mul(body.velocity.y, this.timeStep));
            //     // 处理边界碰撞
            //     this.handleBorderCollision(body);
            // }
            // 更新世界尺寸
            // this.updateSize();
        }
    }
}