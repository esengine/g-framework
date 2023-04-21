module gs {
    export class EntityIdAllocator {
        private nextId: number;

        constructor() {
            this.nextId = 0;
        }

        generateId(): number {
            const newId = this.nextId;
            this.nextId += 1;
            return newId;
        }
    }
}