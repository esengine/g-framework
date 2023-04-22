module gs {
    export class InputManager {
        private inputBuffer: InputBuffer;
        private adapter?: InputAdapter;

        constructor() {
            this.inputBuffer = new InputBuffer();
        }

        setAdapter(adapter: InputAdapter): void {
            this.adapter = adapter;
        }

        getInputBuffer(): InputBuffer {
            return this.inputBuffer;
        }
    }
}