module gs {
    export interface EventListener {
        (event: Event): void;
    }

    export class Event {
        type: string;
        data: any;

        constructor(type: string, data?: any) {
            this.type = type;
            this.data = data;
        }
    }

    export class EventEmitter {
        private listeners: Map<string, EventListener[]>;
        private eventPool: EventPool;

        constructor() {
            this.listeners = new Map();
            this.eventPool = new EventPool();
        }

        /**
         * 用于订阅特定事件类型的侦听器。当事件类型不存在时，将创建一个新的侦听器数组
         * @param eventType 
         * @param listener 
         */
        on(eventType: string, listener: EventListener): void {
            if (!this.listeners.has(eventType)) {
                this.listeners.set(eventType, []);
            }
            const eventListeners = this.listeners.get(eventType) as EventListener[];
            if (eventListeners)
                eventListeners.push(listener);
        }

        /**
         * 用于订阅特定事件类型的侦听器。当事件类型不存在时，将创建一个新的侦听器数组。该方法只会在回调函数被执行后，移除监听器
         * @param eventType 
         * @param callback 
         */
        once(eventType: string, callback: (event: Event) => void): void {
            const wrappedCallback = (event: Event) => {
                // 在回调函数被执行后，移除监听器
                this.off(eventType, wrappedCallback);
                callback(event);
            };
            this.on(eventType, wrappedCallback);
        }

        /**
         * 用于取消订阅特定事件类型的侦听器。如果找到侦听器，则将其从数组中移除
         * @param eventType 
         * @param listener 
         */
        off(eventType: string, listener: EventListener): void {
            const eventListeners = this.listeners.get(eventType);
            if (eventListeners) {
                const index = eventListeners.indexOf(listener);
                if (index > -1) {
                    eventListeners.splice(index, 1);
                }
            }
        }

        /**
         * 用于触发事件。该方法将遍历所有订阅给定事件类型的侦听器，并调用它们
         * @param event 
         */
        emit(type: string, data: any): void {
            const event = this.eventPool.acquire();
            event.type = type;
            event.data = data;

            const listeners = this.listeners[type];
            if (listeners) {
                for (const listener of listeners) {
                    listener(event);
                }
            }

            this.eventPool.release(event);
        }
    }
}