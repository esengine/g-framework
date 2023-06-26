import {Connection} from "./Connection";
import {Message} from "./Message";
import {WebSocketUtils} from "./WebSocketUtils";

/**
 * 管理服务器和客户端之间的心跳
 */
export class HeartbeatManager {
    private heartbeatInterval: number = 5000;
    private heartbeatTimer: NodeJS.Timeout | null = null;

    constructor(heartbeatInterval: number) {
        this.heartbeatInterval = heartbeatInterval;
        this.heartbeatTimer = null;
    }

    /**
     * 开始心跳
     * @param connection 连接
     */
    public startHeartbeat(connection: Connection): void {
        // 清除之前的心跳定时器
        this.stopHeartbeat();

        // 设置新的心跳定时器
        this.heartbeatTimer = setInterval(() => {
            this.sendHeartbeat(connection);
        }, this.heartbeatInterval);
    }

    private stopHeartbeat(): void {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    /**
     * 发送心跳消息
     * @param connection 连接
     */
    private sendHeartbeat(connection: Connection): void {
        const heartbeatMessage: Message = {
            type: 'heartbeat',
            payload: null,
        };

        WebSocketUtils.sendToConnection(connection, heartbeatMessage);
    }

}