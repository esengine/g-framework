module gs.physics {
    export class AABB {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;

        velocityX: number = 0;
        velocityY: number = 0;

        constructor(x: number, y: number, width: number, height: number) {
            this.minX = x;
            this.maxX = x + width;
            this.minY = y;
            this.maxY = y + height;
        }

        /**
         * 计算两个 AABB 的并集
         * @param other 
         * @returns 
         */
        union(other: AABB): AABB {
            const minX = Math.min(this.minX, other.minX);
            const minY = Math.min(this.minY, other.minY);
            const width = Math.max(this.maxX, other.maxX) - minX;
            const height = Math.max(this.maxY, other.maxY) - minY;
        
            return new AABB(minX, minY, width, height);
        }

        /**
         * 计算 AABB 的面积
         * @returns 
         */
        area(): number {
            return (this.maxX - this.minX) * (this.maxY - this.minY);
        }

        /**
         * 检查两个 AABB 是否相交
         * @param other 
         * @returns 
         */
        intersects(other: AABB): boolean {
            return !(this.minX > other.maxX ||
                this.maxX < other.minX ||
                this.minY > other.maxY ||
                this.maxY < other.minY);
        }

        /**
         * 计算与另一个物体的可能碰撞时间
         * @param other 
         * @returns 
         */
        computeCollisionTime(other: AABB): number {
            let relativeVelocityX = other.velocityX - this.velocityX;
            let relativeVelocityY = other.velocityY - this.velocityY;

            let tEnterX, tEnterY, tExitX, tExitY;

            if (relativeVelocityX > 0) {
                tEnterX = (this.minX - other.maxX) / relativeVelocityX;
                tExitX = (this.maxX - other.minX) / relativeVelocityX;
            } else {
                tEnterX = (this.maxX - other.minX) / relativeVelocityX;
                tExitX = (this.minX - other.maxX) / relativeVelocityX;
            }

            if (relativeVelocityY > 0) {
                tEnterY = (this.minY - other.maxY) / relativeVelocityY;
                tExitY = (this.maxY - other.minY) / relativeVelocityY;
            } else {
                tEnterY = (this.maxY - other.minY) / relativeVelocityY;
                tExitY = (this.minY - other.maxY) / relativeVelocityY;
            }

            let tEnter = Math.max(tEnterX, tEnterY);
            let tExit = Math.min(tExitX, tExitY);

            if (tEnter < tExit && tEnter < 1 && tExit > 0) {
                return tEnter;
            } else {
                return Infinity;
            }
        }

        clone(): AABB {
            const width = this.maxX - this.minX;
            const height = this.maxY - this.minY;
            
            let cloned = new AABB(this.minX, this.minY, width, height);
            cloned.velocityX = this.velocityX;
            cloned.velocityY = this.velocityY;
            
            return cloned;
        }
    }
}