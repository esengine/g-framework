module gs {
    export interface Interpolatable {
        savePreviousState(): void;
        applyInterpolation(factor: number): void;
    }
}