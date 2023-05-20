module gs.physics {
    export class CollisionHandlerSystem {
        constructor() {
            GlobalEventEmitter.on('collision', this.handleCollision.bind(this));
        }

        handleCollision(event: Event) {
            const { entity1, entity2, velocities } = event.data as CollisionEvent;

            entity1.getComponent(RigidBody).velocity = velocities.v1;
            entity2.getComponent(RigidBody).velocity = velocities.v2;
        }
    }
}