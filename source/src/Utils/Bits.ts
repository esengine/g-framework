module gs {
    export class Bits {
        private data: Uint32Array;

        constructor(size: number = 32) {
            this.data = new Uint32Array(Math.ceil(size / 32));
        }

        public set(index: number): void {
            const dataIndex = Math.floor(index / 32);
            const bitIndex = index % 32;
            this.data[dataIndex] |= 1 << bitIndex;
        }

        public clear(index: number): void {
            const dataIndex = Math.floor(index / 32);
            const bitIndex = index % 32;
            this.data[dataIndex] &= ~(1 << bitIndex);
        }

        public get(index: number): boolean {
            const dataIndex = Math.floor(index / 32);
            const bitIndex = index % 32;
            return (this.data[dataIndex] & (1 << bitIndex)) !== 0;
        }

        public resize(newSize: number): void {
            const newData = new Uint32Array(Math.ceil(newSize / 32));
            newData.set(this.data);
            this.data = newData;
        }
    }
}