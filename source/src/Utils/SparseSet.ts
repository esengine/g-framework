module gs {
    /**
     * SparseSet数据结构
     */
    export class SparseSet<T> {
        private sparse: number[];
        private dense: number[];
        private items: T[];
        private count: number;

        constructor() {
            this.sparse = [];
            this.dense = [];
            this.items = [];
            this.count = 0;
        }

        public add(index: number, item: T): void {
            if (index >= this.sparse.length) {
                this.sparse.length = index + 1;
            }

            this.sparse[index] = this.count;
            this.dense[this.count] = index;
            this.items[this.count] = item;
            this.count++;
        }

        public remove(index: number): void {
            const denseIndex = this.sparse[index];
            const lastIndex = this.count - 1;
            const lastDense = this.dense[lastIndex];
            const lastItem = this.items[lastIndex];

            this.dense[denseIndex] = lastDense;
            this.items[denseIndex] = lastItem;
            this.sparse[lastDense] = denseIndex;

            this.count--;
        }

        public has(index: number): boolean {
            return this.sparse[index] < this.count && this.dense[this.sparse[index]] === index;
        }

        public get(index: number): T {
            if (!this.has(index)) {
                return null;
            }
            return this.items[this.sparse[index]];
        }

        public getCount(): number {
            return this.count;
        }
    }
}