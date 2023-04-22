module gs {
    export interface EventListener {
        (event: Event): void;
    }
}