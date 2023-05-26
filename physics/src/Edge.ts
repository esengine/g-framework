module gs.physics {
    export class Edge {
        public readonly distance: FixedPoint;
        public readonly pointA: Vector2;
        public readonly pointB: Vector2;

        constructor(a: Vector2, b: Vector2) {
            this.pointA = a;
            this.pointB = b;
            let AB = b.sub(a);
            let AO = a.negate();
            this.distance = AB.cross(AO).div(AB.length());  // 到原点O的垂直距离
        }
    }
}