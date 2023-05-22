module gs.physics {
    export class World implements IPlugin {
        gravity: FixedPoint;
        timeStep: FixedPoint;
        bodies: RigidBody[];

        name = "PhysicsPlugin";

        constructor(gravity: FixedPoint = new FixedPoint(0, -9.81), timeStep: FixedPoint = new FixedPoint(1, 60), private cellSize: number) {
            this.gravity = gravity;
            this.timeStep = timeStep;
            this.bodies = [];
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

        step(): void {
        }
    }
}