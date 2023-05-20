module gs.physics {
    export class CollisionEvent extends Event {
        entity1: Entity;
        entity2: Entity;
        velocities: { v1: Vector2, v2: Vector2 };

        constructor(type: string, entity1: Entity, entity2: Entity, velocities: { v1: Vector2, v2: Vector2 }) { 
            super(type);
            this.entity1 = entity1;
            this.entity2 = entity2;
            this.velocities = velocities;
        }

        reset(): void {
            super.reset();
            this.entity1 = null;
            this.entity2 = null;
            this.velocities = { v1: new Vector2(0, 0), v2: new Vector2(0, 0) };
        }

        getEntity1(): Entity {
            return this.entity1;
        }

        getEntity2(): Entity {
            return this.entity2;
        }

        getVelocities(): { v1: Vector2, v2: Vector2 } {
            return this.velocities;
        }
    }
}
