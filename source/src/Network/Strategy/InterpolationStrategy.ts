module gs {
    export interface InterpolationStrategy {
        interpolate(prevSnapshot: any, nextSnapshot: any, progress: number): any;
    }
}