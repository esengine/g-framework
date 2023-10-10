module gs {
    export class RoomApi {
        private createRoomCallback: ((roomId: string) => void) | null = null;
        private roomCallback: ((roomId: string) => void) | null = null;

        constructor(public adapter: NetworkAdapter) { }

        public createRoom(maxPlayers: number, callback: (roomId: string) => void) {
            this.createRoomCallback = callback;

            const message: Message = {
                type: 'createRoom',
                payload: { 'maxPlayers': maxPlayers }
            }

            this.adapter.send(message);
        }

        public joinRoom(roomId: string) {
            const message: Message = {
                type: 'joinRoom',
                payload: { 'roomId': roomId }
            }

            this.adapter.send(message);
        }

        public leaveRoom() {
            const message: Message = {
                type: 'leaveRoom',
                payload: null
            }

            this.adapter.send(message);
        }

        /**
         * 当房间创建成功时被调用
         * @param roomId - 房间ID
         */
        public onRoomCreated(roomId: string) {
            if (this.createRoomCallback) {
                this.createRoomCallback(roomId);
            }
        }

        public onPlayerLeft(playerId: string) {

        }
    }
}