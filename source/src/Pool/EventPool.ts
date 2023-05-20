///<reference path="./ObjectPool.ts" />
module gs {
    export class EventPool extends ObjectPool<Event> {
        constructor() {
            super(
                () => new Event("", null),
                (event: Event) => event.reset()
            );
        }
    }
}
