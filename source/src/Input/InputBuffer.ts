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

        hasEvents(): boolean {
            return this.buffer.length > 0;
        }

        getEvents(): InputEvent[] {
            return this.buffer;
        }

        consumeEvent(): InputEvent | null {
            if (this.buffer.length === 0) {
                return null;
            }

            return this.buffer.shift();
        }

        clear(): void {
            this.buffer = [];
        }
    }
}