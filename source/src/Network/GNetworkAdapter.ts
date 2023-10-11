module gs {
    export class GNetworkAdapter implements NetworkAdapter {
        private socket: WebSocket;
        private reconnectionAttempts: number = 0;
        private maxReconnectionAttempts: number = 10;
        private connection: Connection;
        private authentication: Authentication;
        private sessionId: string | null = null;
        private lastKnownState: any = null;
        private messageHandler: MessageHandler;
        private roomAPI: RoomApi;

        public get RoomAPI(): RoomApi {
            return this.roomAPI;
        }

        constructor(private serverUrl: string, username: string, password: string) {
            this.connection = new Connection(serverUrl);
            this.messageHandler = new MessageHandler();
            this.authentication = new Authentication(this.connection);
            this.roomAPI = new RoomApi(this);
            this.connect(username, password);
        }

        private connect(username: string, password: string) {
            this.socket = this.connection.Socket;

            this.socket.addEventListener('open', () => {
                console.info('[g-client]: 连接到服务器');
                this.reconnectionAttempts = 0;

                if (this.sessionId) {
                    // 发送断线重连请求
                    const reconnectMsg = { type: 'reconnect', sessionId: this.sessionId, lastKnownState: this.lastKnownState };
                    this.socket.send(JSON.stringify(reconnectMsg));
                } else {
                    // 开始身份验证
                    this.authentication.startAuthentication(username, password);
                }
            });

            this.socket.addEventListener('error', (error: Event) => {
                console.error('[g-client]: 发生错误:', error);
            });

            this.socket.addEventListener('close', () => {
                if (this.reconnectionAttempts < this.maxReconnectionAttempts) {
                    console.warn('[g-client]: 连接关闭, 尝试重新连接...');
                    setTimeout(() => this.connect(username, password), this.getReconnectDelay());
                    this.reconnectionAttempts++;
                } else {
                    console.error('[g-client] 连接关闭, 超出最大重连次数.');
                }
            });

            this.socket.addEventListener('message', (event) => {
                const message: Message = JSON.parse(event.data);
                this.messageHandler.emit(message);
                if (message.type === 'authentication') {
                    if (message.payload.code == ErrorCodes.SUCCESS) {
                        this.sessionId = message.payload.sessionId; // 存储sessionId
                    }

                    this.authentication.handleAuthenticationMessage(message);
                } else if (message.type === 'sessionId') {
                    this.sessionId = message.payload;
                } else if (message.type === 'stateUpdate') {
                    this.lastKnownState = message.payload; // 更新lastKnownState
                } else if(message.type == 'heartbeat') {
                    // 心跳包
                } else if(message.type == 'roomCreated') {
                    // 房间创建
                    this.roomAPI.onRoomCreated(message.payload.room);
                } else if(message.type == 'playerLeft') {
                    // 房间玩家离开
                    this.roomAPI.onPlayerLeft(message.payload.playerId);
                } else if(message.type == 'playerJoined') {
                    // 房间玩家加入
                    this.roomAPI.onPlayerJoined(message.payload.playerId, message.payload.room);
                } else if(message.type == 'frameSync') {
                    // 开始帧同步消息
                    this.roomAPI.onFrameSync(message.payload);
                } else if(message.type == 'snapshot') {
                    this.roomAPI.onSnapShot(message.payload);
                } else {
                    console.warn(`[g-client]: 未知的消息类型: ${message.type}`);
                }
            });
        }

        sendInput(frameNumber: number, inputData: any): void {
            const message = {
                type: 'input',
                payload: {frameNumber: frameNumber, inputData: inputData},
            };
            this.socket.send(JSON.stringify(message));
        }

        send(message: Message) {
            this.socket.send(JSON.stringify(message));
        }

        onServerUpdate(callback: (serverState: any) => void): void {
            this.socket.addEventListener('message', (event) => {
                const serverState = JSON.parse(event.data.toString());
                callback(serverState);
            });
        }

        private getReconnectDelay(): number {
            return Math.min(1000 * Math.pow(2, this.reconnectionAttempts), 10000);
        }
    }
}


