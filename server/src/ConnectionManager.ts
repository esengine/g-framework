import {Connection, FrameInfo} from "./Connection";
import {Message} from "./Message";
import {WebSocketUtils} from "./WebSocketUtils";
import {MessageQueueItem} from "./MessageQueueItem";
import {GServices} from "./GServices";

/**
 * 连接管理器类，用于管理 WebSocket 连接。
 */
export class ConnectionManager {
    private connections: Map<string, Connection> = new Map<string, Connection>();
    private messageQueue: MessageQueueItem[] = [];

    private connectionQueue: Connection[] = []; // 连接请求队列
    private connectionRateLimit: number = 100; // 每秒最大连接数
    private connectionRateLimitTimer: NodeJS.Timer | null = null;

    /**
     * 广播消息给所有连接。
     * @param message - 要广播的消息。
     */
    public broadcast(message: Message): void {
        this.connections.forEach(connection => {
            const frameInfo: FrameInfo = WebSocketUtils.sendToConnection(connection, message);
            this.updateConnectionStats(connection, frameInfo, false);
        });
    }

    /**
     * 注册新的连接。
     * @param connection - 要注册的连接。
     */
    public registerConnection(connection: Connection): void {
        this.connections.set(connection.id, connection);

        this.connectionQueue.push(connection);

        if (!this.connectionRateLimitTimer) {
            this.connectionRateLimitTimer = setInterval(this.processConnectionQueue.bind(this), 1000 / this.connectionRateLimit);
        }
    }

    private processConnectionQueue(): void {
        const connection = this.connectionQueue.shift();
        if (connection) {
            this.connections.set(connection.id, connection);
        } else if (this.connectionRateLimitTimer) {
            clearInterval(this.connectionRateLimitTimer);
            this.connectionRateLimitTimer = null;
        }
    }

    /**
     * 注销连接。
     * @param connection - 要注销的连接。
     */
    public unregisterConnection(connection: Connection): void {
        this.connections.delete(connection.id);
    }

    /**
     * 处理重新连接操作。
     * @param connection - 要重新连接的连接。
     */
    public handleReconnect(connection: Connection): void {
        // 根据需要执行与连接重新建立相关的操作
        // 恢复状态、重新发送数据等

        // 根据需要触发相关事件或通知其他模块
    }

    /**
     * 处理心跳响应。
     * @param connection - 发送心跳响应的连接。
     */
    public handleHeartbeatResponse(connection: Connection): void {
        // 收到客户端的心跳响应，连接仍然活跃
        // 可根据需要进行相关处理
    }

    /**
     * 缓存断开连接后待发送的消息。
     * @param connection - 断开连接的连接对象。
     */
    public cacheMessagesForReconnect(connection: Connection): void {
        const clientId = connection.id;
        const messagesToSend: Message[] = [] // 获取需要缓存的消息，可能是从其他模块中获取

        // 将消息添加到消息队列中
        messagesToSend.forEach((message) => {
            this.messageQueue.push({ clientId, message });
        });
    }

    /**
     * 更新指定连接的统计信息。
     * @param connection - 要更新的连接。
     * @param frame - 最近收到或发送的 WebSocket 帧的信息。
     * @param received - 如果是接收到的消息，则为 true；否则为 false。
     */
    private updateConnectionStats(connection: Connection, frame: FrameInfo, received: boolean): void {
        connection.lastFrame = frame;
        if (received) {
            connection.receivedMessagesCount += 1;
        } else {
            connection.sentMessagesCount += 1;
        }
        connection.lastUpdated = new Date();
    }

    /**
     * 处理连接断开。
     * @param connection - 断开的连接。
     */
    public handleDisconnect(connection: Connection): void {
        console.log(`[g-server]: 连接 ${connection.id} 已关闭。上一帧：${connection.lastFrame}。已发送消息数：${connection.sentMessagesCount}。已接收消息数：${connection.receivedMessagesCount}`);
        this.unregisterConnection(connection);

        // 缓存待发送的消息
        this.cacheMessagesForReconnect(connection);

        // 尝试重新连接
        const reconnectDelay = this.getReconnectDelay(connection.reconnectAttempts);
        setTimeout(() => {
            this.reconnect(connection);
        }, reconnectDelay);
    }

    /**
     * 重新连接连接。
     * @param connection - 要重新连接的连接。
     */
    public reconnect(connection: Connection): void {
        // 在断开连接后的某个时间点尝试重新连接
        // 例如，使用定时器来延迟执行重新连接操作
        GServices.I().setupConnectionEventHandlers(connection);
        this.handleReconnect(connection);

        // 恢复连接后，发送消息队列中的消息
        this.sendCachedMessages(connection);
    }

    /**
     * 发送缓存的消息给连接。
     * @param connection - 要发送消息的连接。
     */
    public sendCachedMessages(connection: Connection): void {
        const clientId = connection.id;

        // 遍历消息队列，找到与当前客户端相关的消息并发送
        const messagesToSend = this.messageQueue.filter((item) => item.clientId === clientId);

        messagesToSend.forEach((item) => {
            const { message } = item;

            // 发送消息给客户端
            const frameInfo: FrameInfo = WebSocketUtils.sendToConnection(connection, message);

            // 更新连接的统计信息
            this.updateConnectionStats(connection, frameInfo, false);

            // 从消息队列中移除已发送的消息
            this.messageQueue = this.messageQueue.filter((queuedItem) => queuedItem !== item);
        });
    }

    /**
     * 根据重连次数获取重连延迟时间。
     * @param reconnectAttempts - 重连次数。
     * @returns 重连延迟时间。
     */
    public getReconnectDelay(reconnectAttempts: number): number {
        // 根据重连次数计算延迟时间
        // 你可以根据具体需求设计自己的重连策略，例如指数递增、固定时间间隔等

        const maxDelay = 10000; // 最大延迟时间为10秒
        const baseDelay = 1000; // 初始延迟时间为1秒

        return Math.min(baseDelay * Math.pow(2, reconnectAttempts), maxDelay);
    }
}