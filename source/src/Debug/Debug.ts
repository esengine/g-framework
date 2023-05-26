module gs {
    export class Debug {
        static isEnabled: boolean = false;

        static enable() {
            this.isEnabled = true;
        }

        static disable() {
            this.isEnabled = false;
        }
    }
}