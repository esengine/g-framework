module gs {
    export class AABB {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;

        velocityX: number;
        velocityY: number;

        constructor(minX: number, maxX: number, minY: number, maxY: number) {
            this.minX = minX;
            this.maxX = maxX;
            this.minY = minY;
            this.maxY = maxY;
        }

        /**
         * 计算两个 AABB 的并集
         * @param other 
         * @returns 
         */
        union(other: AABB): AABB {
            return new AABB(
                Math.min(this.minX, other.minX),
                Math.max(this.maxX, other.maxX),
                Math.min(this.minY, other.minY),
                Math.max(this.maxY, other.maxY)
            );
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
            let cloned = new AABB(this.minX, this.maxX, this.minY, this.maxY);
            cloned.velocityX = this.velocityX;
            cloned.velocityY = this.velocityY;
            return cloned;
        }
    }
}