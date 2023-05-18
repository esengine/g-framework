module gs.physics {
    export class PhysicsEngine {
        private quadtree: QuadTree;
        private entities: Map<number, AABB>;

        constructor(boundary: Rectangle = new Rectangle(0, 0, 1000, 1000), capacity: number = 4, cellSize: number = 10) {
            this.quadtree = new QuadTree(boundary, capacity, cellSize);
            this.entities = new Map();
        }

        addObject(entityId: number, aabb: AABB) {
            this.entities.set(entityId, aabb);
            this.quadtree.insert(aabb);
        }

        getObject(entityId: number): AABB {
            return this.entities.get(entityId);
        }

        removeObject(entityId: number) {
            const aabb = this.entities.get(entityId);
            if (aabb) {
                this.quadtree.remove(aabb);
                this.entities.delete(entityId);
            }
        }

        updateObject(entityId: number, newPosition: { minX: number, minY: number, maxX: number, maxY: number }) {
            const aabb = this.entities.get(entityId);
            if (aabb) {
                this.quadtree.remove(aabb);
    
                aabb.minX = newPosition.minX;
                aabb.minY = newPosition.minY;
                aabb.maxX = newPosition.maxX;
                aabb.maxY = newPosition.maxY;
    
                this.quadtree.insert(aabb);
            }
        }

        step(time: number) {
            let potentialCollisions = this.quadtree.queryPairs();

            for (let pair of potentialCollisions) {
                let [aabb1, aabb2] = pair;
        
                aabb1.colliding = true;
                aabb2.colliding = true;
            }
        }
    }
}