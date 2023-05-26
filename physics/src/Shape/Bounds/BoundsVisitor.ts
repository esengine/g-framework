module gs.physics {
    export interface BoundsVisitor {
        visitBox(box: BoxBounds): void;
        visitCircle(circle: CircleBounds): void;
    }
}