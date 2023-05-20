module gs {
    export class Event {
        type: string;
        data: any;

        constructor(type: string, data?: any) {
            this.type = type;
            this.data = data;
        }

        reset(): void {
            this.type = "";
            this.data = null;
        }

        getType(): string {
            return this.type;
        }

        getData(): any {
            return this.data;
        }
    }
}