import * as http from "http";
import * as WebSocketModule from 'ws';
import WebSocket from 'ws';
import {v4 as uuidv4} from 'uuid';
import {WebSocketServerConfig} from "./WebSocketServerConfig";
import {Connection} from "./Connection";
import {Message} from "./Message";
import {MessageQueueItem} from "./MessageQueueItem";
import {ServerExtension} from "./ServerExtension";

export class WebSocketServer {
    private server: http.Server;
    private wsServer: WebSocketModule.Server;
    private config: WebSocketServerConfig;
    private connections: Map<string, Connection>;
    private messageQueue: MessageQueueItem[] = [];
    /**
     * 心跳间隔时间，单位为毫秒
     * @private
     */
    private heartbeatInterval: number = 5000;
    private heartbeatTimer: NodeJS.Timeout | null = null;
    private serverExtensions: ServerExtension[] = [];

    constructor(config: WebSocketServerConfig) {
        this.config = config;
        const server = http.createServer((request, response) => {

        });
        this.server = server;

        this.wsServer = new WebSocketModule.Server({ server });
        this.connections = new Map<string, Connection>();

        this.wsServer.on('connection', socket => {
            const connection: Connection = {
                id: this.generateUniqueId(),
                socket: socket,
                reconnectAttempts: 3
            };

            this.registerConnection(connection);
            this.setupConnectionEventHandlers(connection);
        });
    }

    public registerExtension(extension: ServerExtension): void {
        this.serverExtensions.push(extension);
    }

    private invokeExtensionMethod(method: keyof ServerExtension, ...args: any[]): void {
        this.serverExtensions.forEach((extension) => {
            const handler = extension[method];
            if (typeof handler === 'function') {
                handler.apply(extension, args);
            }
        });
    }

    private handleClientConnect(connection: Connection): void {
        // 调用用户自定义的连接建立处理方法
        this.invokeExtensionMethod('onClientConnect', connection);
    }

    private handleClientDisconnect(connection: Connection): void {
        // 调用用户自定义的连接断开处理方法
        this.invokeExtensionMethod('onClientDisconnect', connection);
    }

    private startHeartbeat(connection: Connection): void {
        // 清除之前的心跳定时器
        this.stopHeartbeat();

        // 设置新的心跳定时器
        this.heartbeatTimer = setInterval(() => {
            this.sendHeartbeat(connection);
        }, this.heartbeatInterval);
    }

    private sendHeartbeat(connection: Connection): void {
        const heartbeatMessage: Message = {
            type: 'heartbeat',
            payload: null,
        };

        this.sendToConnection(connection, heartbeatMessage);
    }

    private handleHeartbeatResponse(connection: Connection): void {
        // 收到客户端的心跳响应，连接仍然活跃
        // 可根据需要进行相关处理
    }

    private handleHeartbeatTimeout(connection: Connection): void {
        // 心跳超时，连接可能已经断开或出现其他问题
        // 可根据需要进行相关处理，如关闭连接、重新连接等
    }

    private stopHeartbeat(): void {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    private registerConnection(connection: Connection): void {
        this.connections.set(connection.id, connection);
    }

    private unregisterConnection(connection: Connection): void {
        this.connections.delete(connection.id);
    }

    private setupConnectionEventHandlers(connection: Connection): void {
        const socket = connection.socket;

        socket.on('message', (data: WebSocket.Data) => {
            const message = this.decodeMessage(data);

            if (message) {
                if (message.type === 'heartbeat') {
                    this.handleHeartbeatResponse(connection);
                } else {
                    this.handleMessage(connection, message);
                }
            }
        });

        socket.on('close', () => {
            // 处理连接关闭
            this.handleDisconnect(connection);
        });
    }

    private handleDisconnect(connection: Connection): void {
        this.unregisterConnection(connection);

        // 缓存待发送的消息
        this.cacheMessagesForReconnect(connection);

        // 尝试重新连接
        const reconnectDelay = this.getReconnectDelay(connection.reconnectAttempts);
        setTimeout(() => {
            this.reconnect(connection);
        }, reconnectDelay);
    }

    private cacheMessagesForReconnect(connection: Connection): void {
        const clientId = connection.id;
        const messagesToSend: Message[] = [] // 获取需要缓存的消息，可能是从其他模块中获取

        // 将消息添加到消息队列中
        messagesToSend.forEach((message) => {
            this.messageQueue.push({ clientId, message });
        });
    }

    private handleReconnect(connection: Connection): void {
        // 根据需要执行与连接重新建立相关的操作
        // 恢复状态、重新发送数据等

        // 根据需要触发相关事件或通知其他模块
    }

    private reconnect(connection: Connection): void {
        // 在断开连接后的某个时间点尝试重新连接
        // 例如，使用定时器来延迟执行重新连接操作
        this.setupConnectionEventHandlers(connection);
        this.handleReconnect(connection);

        // 恢复连接后，发送消息队列中的消息
        this.sendCachedMessages(connection);
    }

    private sendCachedMessages(connection: Connection): void {
        const clientId = connection.id;

        // 遍历消息队列，找到与当前客户端相关的消息并发送
        const messagesToSend = this.messageQueue.filter((item) => item.clientId === clientId);

        messagesToSend.forEach((item) => {
            const { message } = item;

            // 发送消息给客户端
            this.sendToConnection(connection, message);

            // 从消息队列中移除已发送的消息
            this.messageQueue = this.messageQueue.filter((queuedItem) => queuedItem !== item);
        });
    }

    private getReconnectDelay(reconnectAttempts: number): number {
        // 根据重连次数计算延迟时间
        // 你可以根据具体需求设计自己的重连策略，例如指数递增、固定时间间隔等

        const maxDelay = 10000; // 最大延迟时间为10秒
        const baseDelay = 1000; // 初始延迟时间为1秒

        const delay = Math.min(baseDelay * Math.pow(2, reconnectAttempts), maxDelay);

        return delay;
    }

    private decodeMessage(data: WebSocket.Data): Message | null {
        try {
            return JSON.parse(data.toString()) as Message;
        } catch (error) {
            console.error('[g-server]: Failed to decode message:', error);
            return null;
        }
    }

    private handleMessage(connection: Connection, message: Message): void {
        switch (message.type) {
            case 'text':
                // 处理文本消息
                this.handleTextMessage(connection, message.payload);
                break;
            case 'data':
                // 处理数据消息
                this.handleDataMessage(connection, message.payload);
                break;
            // 添加其他消息类型的处理逻辑
            default:
                console.warn('[g-server]: Unknown message type:', message.type);
                break;
        }

        // 调用用户自定义的消息处理方法
        this.invokeExtensionMethod('onMessageReceived', connection, message);
    }

    private handleTextMessage(connection: Connection, payload: string): void {
        // 处理文本消息
    }

    private handleDataMessage(connection: Connection, payload: any): void {
        // 处理数据消息
    }

    private encodeMessage(message: Message): WebSocket.Data {
        return JSON.stringify(message);
    }

    private sendToConnection(connection: Connection, message: Message): void {
        const encodedMessage = this.encodeMessage(message);
        connection.socket.send(encodedMessage);
    }

    private broadcast(message: Message): void {
        this.connections.forEach(connection => {
            this.sendToConnection(connection, message);
        });
    }

    private generateUniqueId(): string {
        // 保证生成的标识符在连接对象中唯一
        return uuidv4();
    }

    public start() {
        this.server.listen(this.config.port, ()=>{
            console.log(`[g-server]: listening on port ${this.config.port}`);
        });
    }
}
