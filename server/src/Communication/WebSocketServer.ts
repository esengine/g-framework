import * as WebSocketModule from "ws";
import {Connection} from "./Connection";
import http from "http";
import {WebSocketUtils} from "./WebSocketUtils";
import {GServices} from "../Service/GServices";

/**
 * WebSocket 服务器类，用于处理 WebSocket 连接。
 */
export class WebSocketServer {
    private wsServer: WebSocketModule.Server;

    /**
     * 创建一个新的 WebSocket 服务器实例。
     * @param server - HTTP 服务器实例，WebSocket 服务器将绑定到该服务器上。
     */
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
                receivedMessagesCount: 0,
                sessionId: "",
                totalReceivedBytes: 0,
                totalSentBytes: 0
            };

            GServices.I().ConnectionManager.registerConnection(connection);
            GServices.I().setupConnectionEventHandlers(connection);
            GServices.I().handleClientConnect(connection);
            GServices.I().HeartBeatManager.startHeartbeat(connection);
        });
    }
}