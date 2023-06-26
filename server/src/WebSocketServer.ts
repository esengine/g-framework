import * as WebSocketModule from "ws";
import {Connection} from "./Connection";
import http from "http";
import {WebSocketUtils} from "./WebSocketUtils";
import {GServices} from "./GServices";

export class WebSocketServer {
    private wsServer: WebSocketModule.Server;

    constructor(server: http.Server) {
        // 创建 WebSocket 服务器，并绑定到 HTTP 服务器上
        this.wsServer = new WebSocketModule.Server({ server });

        // 当有新的 WebSocket 连接建立时触发回调函数
        this.wsServer.on('connection', socket => {
            const connection: Connection = {
                id: WebSocketUtils.generateToken(),
                socket: socket,
                reconnectAttempts: 3,
                isAuthenticated: false,
                state: '',
                lastUpdated: new Date(),
                sentMessagesCount: 0,
                receivedMessagesCount: 0
            };

            GServices.I().ConnectionManager.registerConnection(connection);
            GServices.I().setupConnectionEventHandlers(connection);
            GServices.I().handleClientConnect(connection);
            GServices.I().HeartBeatManager.startHeartbeat(connection);
        });
    }
}