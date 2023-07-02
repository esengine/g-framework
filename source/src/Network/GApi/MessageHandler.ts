module gs {
    export class MessageHandler {
        private messageHandlers: Record<string, (msg: Message) => void>;

        public emit(message: Message) {
            this.handleMessage(message);
        }

        public on(type: string, handler: (msg: Message) => void) {
            this.messageHandlers[type] = handler;
        }

        private handleMessage(message: Message) {
            const handler = this.messageHandlers[message.type];
            if (handler) {
                handler(message);
            }
        }
    }
}