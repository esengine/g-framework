module gs.physics {
    export class BoxBounds implements Bounds {
        position: Vector2;
        width: FixedPoint;
        height: FixedPoint;
        entity: Entity; 
        
        constructor(position: Vector2, width: FixedPoint, height: FixedPoint, entity: Entity) {
            this.position = position;
            this.width = width;
            this.height = height;
            this.entity = entity;
        }

        intersects(other: Bounds): boolean {
            return true;
        }

        contains(other: Bounds): boolean {
            return false;
        }
    }
}