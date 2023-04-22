module gs {
    export class ObjectPool<T> {
        private pool: T[];

        constructor(private createFn: () => T, private resetFn: (obj: T) => void) {
            this.pool = [];
        }

        acquire(): T {
            if (this.pool.length > 0) {
                const obj = this.pool.pop() as T;
                this.resetFn(obj);
                return obj;
            } else {
                return this.createFn();
            }
        }

        release(obj: T): void {
            this.pool.push(obj);
        }
    }
}