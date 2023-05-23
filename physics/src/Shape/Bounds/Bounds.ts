module gs.physics {
    export interface Bounds {
        position: Vector2;
        width: FixedPoint;
        height: FixedPoint;
        entity: Entity;

        intersects(other: Bounds): boolean;
        contains(other: Bounds): boolean;
    }
}