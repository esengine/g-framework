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
    
            const event = this.buffer[0];
            this.buffer.shift();
            return event;
        }

        clear(): void {
            this.buffer = [];
        }
    }
}