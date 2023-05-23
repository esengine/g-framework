module gs.physics {
    export class World implements IPlugin {
        gravity: FixedPoint;
        timeStep: FixedPoint;

        name = "PhysicsPlugin";

        constructor(gravity: FixedPoint = new FixedPoint(0, -9.81), timeStep: FixedPoint = new FixedPoint(1 / 60)) {
            this.gravity = gravity;
            this.timeStep = timeStep;
        }

        onInit(core: Core): void { 
            core.systemManager.registerSystem(new CollisionResponseSystem(core.entityManager, this.timeStep.toFloat() * 1000));
        }

        onUpdate(deltaTime: number): void { }
    }
}