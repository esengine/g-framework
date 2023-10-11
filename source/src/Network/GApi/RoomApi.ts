module gs {
    export class RoomApi {
        private createRoomCallback: ((room: Room) => void) | null = null;
        private playerLeftCallback: ((playerId: string) => void) | null = null;
        private playerJoinedCallback: ((playerId: string, room: Room) => void) | null = null;
        private frameSyncCallback: ((payload: any) => void) | null = null;
        private snapshotCallback: ((snapshot: any) => void) | null = null;

        constructor(public adapter: NetworkAdapter) {
        }

        public createRoom(maxPlayers: number, callback: (room: Room) => void) {
            this.createRoomCallback = callback;

            const message: Message = {
                type: 'createRoom',
                payload: {'maxPlayers': maxPlayers}
            }

            this.adapter.send(message);
        }

        public joinRoom(roomId: string) {
            const message: Message = {
                type: 'joinRoom',
                payload: {'roomId': roomId}
            }

            this.adapter.send(message);
        }

        /**
         * 离开房间
         * @param roomId - 房间ID
         */
        public leaveRoom(roomId: string) {
            const message: Message = {
                type: 'leaveRoom',
                payload: {'roomId': roomId}
            }

            this.adapter.send(message);
        }

        /**
         * 开始房间帧同步
         * @param roomId - 房间ID
         */
        public startGame(roomId: string) {
            const message: Message = {
                type: 'startGame',
                payload: {'roomId': roomId}
            }

            this.adapter.send(message);
        }

        /**
         * 结束房间帧同步
         * @param roomId
         */
        public endGame(roomId: string) {
            const message: Message = {
                type: 'endGame',
                payload: {'roomId': roomId}
            }

            this.adapter.send(message);
        }

        public action(act: any) {
            const message: Message = {
                type: 'action',
                payload: act
            }

            this.adapter.send(message);
        }

        public snapShot(roomId: string, snapshot: any, lastSnapVersion: number) {
            const message: Message = {
                type: 'snapshot',
                payload: { 'roomId': roomId, 'snapshot': snapshot, 'lastSnapVersion': lastSnapVersion }
            }

            this.adapter.send(message);
        }

        /**
         * 设置玩家离开回调
         * @param callback
         */
        public setPlayerLeftCallback(callback: (playerId: string) => void) {
            this.playerLeftCallback = callback;
        }

        /**
         *
         * @param callback
         */
        public setFrameSync(callback: (payload: any)=>void) {
            this.frameSyncCallback = callback;
        }

        /**
         * 设置玩家加入回调
         * @param callback
         */
        public setPlayerJoinedCallback(callback: (playerId: string, room: Room) => void) {
            this.playerJoinedCallback = callback;
        }

        public setSnapshotCallback(callback: (snapshot: any) => void) {
            this.snapshotCallback = callback;
        }

        /**
         * 当房间创建成功时被调用
         * @param room - 房间信息
         */
        public onRoomCreated(room: Room) {
            if (this.createRoomCallback) {
                this.createRoomCallback(room);
            }
        }

        /**
         * 当有玩家离开房间时调用
         * @param playerId
         */
        public onPlayerLeft(playerId: string) {
            if (this.playerLeftCallback) {
                this.playerLeftCallback(playerId);
            }
        }

        /**
         *
         * @param playerId
         * @param room
         */
        public onPlayerJoined(playerId: string, room: Room) {
            if (this.playerJoinedCallback)
                this.playerJoinedCallback(playerId, room);
        }

        /**
         *
         * @param payload
         */
        public onFrameSync(payload: any) {
            if (this.frameSyncCallback) {
                this.frameSyncCallback(payload);
            }
        }

        public onSnapShot(snapshot: any) {
            if (this.snapshotCallback)
                this.snapshotCallback(snapshot);
        }
    }
}