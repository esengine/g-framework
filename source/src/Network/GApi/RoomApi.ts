module gs {
    export class RoomApi {
        constructor(public adapter: NetworkAdapter) { }

        public createRoom() {
            const message: Message = {
                type: 'createRoom',
                payload: null
            }

            this.adapter.send(message);
        }

        public joinRoom() {
            const message: Message = {
                type: 'joinRoom',
                payload: null
            }

            this.adapter.send(message);
        }
    }
}