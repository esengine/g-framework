module gs.physics {
    export class CircleBounds implements Bounds {
        position: Vector2;
        width: FixedPoint;
        height: FixedPoint;
        entity: Entity;
        
        radius: FixedPoint;

        intersects(other: Bounds): boolean {
            return false;
        }
        contains(other: Bounds): boolean {
            return false;
        }
    }
}