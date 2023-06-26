import {Connection} from "./Connection";
import {Message} from "./Message";
import {WebSocketUtils} from "./WebSocketUtils";
import {GServices} from "./GServices";

/**
 * 管理服务器和客户端之间的心跳
 */
export class HeartbeatManager {
    private heartbeatInterval: number = 5000;
    private heartbeatTimeout: number = 7000; // 设置心跳超时时间
    private heartbeatTimer: NodeJS.Timeout | null = null;

    /**
     * 创建一个新的心跳管理器实例。
     * @param heartbeatInterval - 心跳间隔时间（毫秒）。
     * @param heartbeatTimeout - 心跳超时时间（毫秒）。
     */
    constructor(heartbeatInterval: number, heartbeatTimeout: number) {
        this.heartbeatInterval = heartbeatInterval;
        this.heartbeatTimeout = heartbeatTimeout;
        this.heartbeatTimer = null;
    }

    /**
     * 开始心跳。
     * @param connection - 要发送心跳的连接。
     */
    public startHeartbeat(connection: Connection): void {
        // 清除之前的心跳定时器
        this.stopHeartbeat();

        // 设置新的心跳定时器
        this.heartbeatTimer = setInterval(() => {
            this.sendHeartbeat(connection);

            // 设置心跳超时定时器
            setTimeout(() => {
                this.handleHeartbeatTimeout(connection);
            }, this.heartbeatTimeout);

        }, this.heartbeatInterval);
    }

    /**
     * 停止心跳。
     */
    private stopHeartbeat(): void {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    /**
     * 发送心跳消息。
     * @param connection - 要发送心跳的连接。
     */
    private sendHeartbeat(connection: Connection): void {
        const heartbeatMessage: Message = {
            type: 'heartbeat',
            payload: null,
        };

        WebSocketUtils.sendToConnection(connection, heartbeatMessage);
    }

    /**
     * 处理心跳超时。
     * @param connection - 连接对象。
     */
    public handleHeartbeatTimeout(connection: Connection): void {
        // 心跳超时，连接可能已经断开或出现其他问题
        // 可根据需要进行相关处理，如关闭连接、重新连接等
        GServices.I().invokeExtensionMethod('onHeartbeatTimeout', connection);
    }
}