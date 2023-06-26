import {Connection} from "./Connection";
import {Message} from "./Message";
import {WebSocketUtils} from "./WebSocketUtils";
import {MessageQueueItem} from "./MessageQueueItem";
import WebSocket from "ws";

export class ConnectionManager {
    private connections: Map<string, Connection> = new Map<string, Connection>();
    private messageQueue: MessageQueueItem[] = [];

    public broadcast(message: Message): void {
        this.connections.forEach(connection => {
            WebSocketUtils.sendToConnection(connection, message);
        });
    }

    public registerConnection(connection: Connection): void {
        this.connections.set(connection.id, connection);
    }

    public unregisterConnection(connection: Connection): void {
        this.connections.delete(connection.id);
    }

    public handleReconnect(connection: Connection): void {
        // 根据需要执行与连接重新建立相关的操作
        // 恢复状态、重新发送数据等

        // 根据需要触发相关事件或通知其他模块
    }

    public handleHeartbeatResponse(connection: Connection): void {
        // 收到客户端的心跳响应，连接仍然活跃
        // 可根据需要进行相关处理
    }

    public cacheMessagesForReconnect(connection: Connection): void {
        const clientId = connection.id;
        const messagesToSend: Message[] = [] // 获取需要缓存的消息，可能是从其他模块中获取

        // 将消息添加到消息队列中
        messagesToSend.forEach((message) => {
            this.messageQueue.push({ clientId, message });
        });
    }

    public sendCachedMessages(connection: Connection): void {
        const clientId = connection.id;

        // 遍历消息队列，找到与当前客户端相关的消息并发送
        const messagesToSend = this.messageQueue.filter((item) => item.clientId === clientId);

        messagesToSend.forEach((item) => {
            const { message } = item;

            // 发送消息给客户端
            WebSocketUtils.sendToConnection(connection, message);

            // 从消息队列中移除已发送的消息
            this.messageQueue = this.messageQueue.filter((queuedItem) => queuedItem !== item);
        });
    }

    public getReconnectDelay(reconnectAttempts: number): number {
        // 根据重连次数计算延迟时间
        // 你可以根据具体需求设计自己的重连策略，例如指数递增、固定时间间隔等

        const maxDelay = 10000; // 最大延迟时间为10秒
        const baseDelay = 1000; // 初始延迟时间为1秒

        return Math.min(baseDelay * Math.pow(2, reconnectAttempts), maxDelay);
    }
}