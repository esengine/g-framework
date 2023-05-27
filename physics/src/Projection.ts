module gs.physics {
    export class Projection {
        constructor(public min: number, public max: number) {}

        overlaps(other: Projection): boolean {
            return this.max >= other.min && this.min <= other.max;
        }
    }
}