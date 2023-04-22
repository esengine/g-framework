module gs {
    export class Random {
        private seed: number;

        constructor(seed: number) {
            this.seed = seed;
        }

        /**
         * 生成 [0, 1) 范围内的随机浮点数
         * @returns 
         */
        next(): number {
            this.seed = (this.seed * 9301 + 49297) % 233280;
            return this.seed / 233280;
        }

        /**
         * 生成 [min, max) 范围内的随机整数
         * @param min 
         * @param max 
         * @returns 
         */
        nextInt(min: number, max: number): number {
            return min + Math.floor(this.next() * (max - min));
        }

        /**
         * 生成 [min, max) 范围内的随机浮点数
         * @param min 
         * @param max 
         * @returns 
         */
        nextFloat(min: number, max: number): number {
            return min + this.next() * (max - min);
        }

        /**
         * 从数组中随机选择一个元素
         * @param array 
         * @returns 
         */
        choose<T>(array: T[]): T {
            const index = this.nextInt(0, array.length);
            return array[index];
        }
    }

}