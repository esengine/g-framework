module gs {
    export interface EventListener {
        (event: GEvent): void;
    }
}