module gs {
    /**
     * 基于时间基础的碰撞检测
     */
    export class TimeBaseCollisionDetection {
        /**
         * 用于处理物体的速度和方向以预测并阻止碰撞
         * @param aabb1 
         * @param aabb2 
         */
        public static handleCollision(aabb1: AABB, aabb2: AABB): [AABB, AABB] {
            let collisionTime = aabb1.computeCollisionTime(aabb2);
            let newAabb1 = aabb1.clone();
            let newAabb2 = aabb2.clone();

            if (collisionTime < 1) {
                aabb1.minX += aabb1.velocityX * collisionTime;
                aabb1.minY += aabb1.velocityY * collisionTime;
                aabb1.maxX += aabb1.velocityX * collisionTime;
                aabb1.maxY += aabb1.velocityY * collisionTime;

                aabb2.minX += aabb2.velocityX * collisionTime;
                aabb2.minY += aabb2.velocityY * collisionTime;
                aabb2.maxX += aabb2.velocityX * collisionTime;
                aabb2.maxY += aabb2.velocityY * collisionTime;
            }

            return [newAabb1, newAabb2];
        }

        /**
         * 处理多个碰撞和反弹
         * @param aabbs 
         */
        public static handleCollisions(aabbs: AABB[]) {
            let collisionPairs: [AABB, AABB][] = [];
            // 计算所有可能的碰撞对
            for (let i = 0; i < aabbs.length; i++) {
                for (let j = i + 1; j < aabbs.length; j++) {
                    collisionPairs.push([aabbs[i], aabbs[j]]);
                }
            }

            while (true) {
                // 找出最早的碰撞
                let earliestCollisionTime = Infinity;
                let earliestCollisionPair: [AABB, AABB] | null = null;
                for (let pair of collisionPairs) {
                    let collisionTime = pair[0].computeCollisionTime(pair[1]);
                    if (collisionTime < earliestCollisionTime) {
                        earliestCollisionTime = collisionTime;
                        earliestCollisionPair = pair;
                    }
                }

                // 如果没有碰撞，那么我们就完成了
                if (earliestCollisionPair === null) {
                    break;
                }

                // 处理碰撞
                let [aabb1, aabb2] = earliestCollisionPair;
                aabb1.minX += aabb1.velocityX * earliestCollisionTime;
                aabb1.minY += aabb1.velocityY * earliestCollisionTime;
                aabb1.maxX += aabb1.velocityX * earliestCollisionTime;
                aabb1.maxY += aabb1.velocityY * earliestCollisionTime;

                aabb2.minX += aabb2.velocityX * earliestCollisionTime;
                aabb2.minY += aabb2.velocityY * earliestCollisionTime;
                aabb2.maxX += aabb2.velocityX * earliestCollisionTime;
                aabb2.maxY += aabb2.velocityY * earliestCollisionTime;

                // 计算反弹
                let normalX = (aabb1.minX + aabb1.maxX) / 2 - (aabb2.minX + aabb2.maxX) / 2;
                let normalY = (aabb1.minY + aabb1.maxY) / 2 - (aabb2.minY + aabb2.maxY) / 2;
                let length = Math.sqrt(normalX * normalX + normalY * normalY);
                normalX /= length;
                normalY /= length;

                let relativeVelocityX = aabb2.velocityX - aabb1.velocityX;
                let relativeVelocityY = aabb2.velocityY - aabb1.velocityY;

                let dotProduct = relativeVelocityX * normalX + relativeVelocityY * normalY;

                if (dotProduct > 0) {
                    let reflectionX = 2 * dotProduct * normalX - relativeVelocityX;
                    let reflectionY = 2 * dotProduct * normalY - relativeVelocityY;

                    aabb1.velocityX -= reflectionX;
                    aabb1.velocityY -= reflectionY;
                    aabb2.velocityX += reflectionX;
                    aabb2.velocityY += reflectionY;
                }

                // 从碰撞对列表中移除已处理的碰撞
                collisionPairs = collisionPairs.filter(pair => pair !== earliestCollisionPair);
            }

            // 移动剩下的物体
            for (let aabb of aabbs) {
                aabb.minX += aabb.velocityX;
                aabb.minY += aabb.velocityY;
                aabb.maxX += aabb.velocityX;
                aabb.maxY += aabb.velocityY;
            }
        }
    }
}