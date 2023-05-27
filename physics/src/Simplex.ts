module gs.physics {
    export class Simplex {
        vertices: Vector2[];

        constructor() {
            this.vertices = [];
        }
    
        add(v: Vector2) {
            this.vertices.unshift(v);  // 添加新的点到数组前面
        }
    }
}