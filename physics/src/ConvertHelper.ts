module gs.physics {
    export function boxBoundsToAABB(bounds: BoxBounds): AABB {
        const { position, width, height } = bounds;
        const min = position;
        const max = position.add(new Vector2(width, height));
        return new AABB(min, max);
    }
}