///<reference path="./ObjectPool.ts" />
module gs {
    export class EventPool extends ObjectPool<GEvent> {
        constructor() {
            super(
                () => new GEvent("", null),
                (event: GEvent) => event.reset()
            );
        }
    }
}
