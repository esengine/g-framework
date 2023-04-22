module gs {
    /**
     * 输入缓冲区
     */
    export class InputBuffer {
        private buffer: InputEvent[];

        constructor() {
            this.buffer = [];
        }

        addEvent(event: InputEvent): void {
            this.buffer.push(event);
        }

        getEvents(): InputEvent[] {
            return this.buffer;
        }

        clear(): void {
            this.buffer = [];
        }
    }
}