module gs {
    export interface Message {
        type: string;
        subtype?: string;
        payload: any;
    }
}
