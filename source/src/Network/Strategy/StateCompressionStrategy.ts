module gs {
    /**
     * 状态压缩策略
     */
    export class StateCompressionStrategy implements ISyncStrategy {
        public onCompressState: (state: any) => any;
        public onDecompressState: (compressedState: any) => any;
        public onSendState: (compressedState: any) => void;
        public onReceiveState: (decompressedState: any) => void;
        public handleStateUpdate: (state: any) => void = () => { };

        /**
         * 发送游戏状态时，将游戏状态压缩
         * @param state 
         */
        sendState(state: any): void {
            let compressedState = state;

            if (this.onCompressState) {
                compressedState = this.onCompressState(state);
            }

            if (this.onSendState) {
                this.onSendState(compressedState);
            }
        }

        /**
         * 接收服务器或客户端发送的压缩后的游戏状态，并解压缩更新
         */
        receiveState(compressedState: any) {
            let decompressedState = compressedState;

            if (this.onDecompressState) {
                decompressedState = this.onDecompressState(compressedState);
            }

            if (this.onReceiveState) {
                this.onReceiveState(decompressedState);
            }

            this.handleStateUpdate(decompressedState);
        }
    }
}