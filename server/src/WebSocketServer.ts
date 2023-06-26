import * as WebSocketModule from 'ws';
import WebSocket from 'ws';
import {WebSocketServerConfig} from "./WebSocketServerConfig";
import {Connection} from "./Connection";
import {Message} from "./Message";
import {ServerExtension} from "./ServerExtension";
import {WebSocketUtils} from "./WebSocketUtils";
import {HeartbeatManager} from "./HeartbeatManager";
import {ConnectionManager} from "./ConnectionManager";
import {HTTPServer} from "./HTTPServer";
import {Database} from "./Database";

export class WebSocketServer {
    private wsServer: WebSocketModule.Server;
    private config: WebSocketServerConfig;
    private serverExtensions: ServerExtension[] = [];
    private heartbeatManager: HeartbeatManager;
    private connectionManager: ConnectionManager;
    private httpServer: HTTPServer;
    private dataBase: Database;

    private currentFrame: number = 0; // 当前帧数
    private frameInterval: number = 1000 / 60; // 每帧时间间隔（默认为60帧每秒）
    private frameSyncTimer: NodeJS.Timeout | null = null; // 帧同步定时器

    constructor(config: WebSocketServerConfig) {
        this.config = config;

        process.on('uncaughtException', this.handleUncaughtException.bind(this));
        process.on('unhandledRejection', this.handleUnhandledRejection.bind(this));

        this.heartbeatManager = new HeartbeatManager(5000);
        this.connectionManager = new ConnectionManager();

        // 创建数据库连接
        this.dataBase = new Database();
        this.dataBase.createConnection();

        this.httpServer = new HTTPServer();
        const server = this.httpServer.Server;
        // 创建 WebSocket 服务器，并绑定到 HTTP 服务器上
        this.wsServer = new WebSocketModule.Server({ server });

        // 当有新的 WebSocket 连接建立时触发回调函数
        this.wsServer.on('connection', socket => {
            const connection: Connection = {
                id: this.generateUniqueId(),
                socket: socket,
                reconnectAttempts: 3,
                isAuthenticated: false,
                state: '',
                lastUpdated: new Date(),
            };

            this.connectionManager.registerConnection(connection);
            this.setupConnectionEventHandlers(connection);
            this.handleClientConnect(connection);
            this.heartbeatManager.startHeartbeat(connection);
        });
    }

    private handleUncaughtException(error: Error): void {
        // 这里可以记录错误，并通知相关人员
        console.error('[g-server]: Uncaught exception:', error);

        // 针对不同的错误类型进行特殊处理
        // 例如，根据错误类型或错误信息来判断这个错误是否严重到需要关闭服务器
        if (error.message.includes('mongodb')) {
            console.error('[g-server]: Database error. Shutting down...');
            this.shutdown();
        } else if (error.message.includes('network')) {
            console.error('[g-server]: Network error. Trying to recover...');
            // 试图恢复服务或者其他的处理方式
        } else {
            console.error('[g-server]: Unknown error. Continue running...');
        }
    }

    private handleUnhandledRejection(reason: {} | null | undefined, promise: Promise<any>): void {
        // 这里可以记录错误，并通知相关人员
        console.error('[g-server]: Unhandled promise rejection:', reason);

        // 如果你能预期到某些特定类型的 Promise 错误，你也可以在这里添加针对性的处理代码
        if (typeof reason === 'object' && reason !== null && 'message' in reason) {
            const message = (reason as {message?: string}).message;
            if (message && message.includes('database')) {
                console.error('[g-server]: Database error in promise. Shutting down...');
                this.shutdown();
            } else if (message && message.includes('network')) {
                console.error('[g-server]: Network error in promise. Trying to recover...');
                // 试图恢复服务或者其他的处理方式
            } else {
                console.error('[g-server]: Unknown promise rejection. Continue running...');
            }
        }
    }

    private shutdown(): void {
        // 这里应该执行一些清理操作，如关闭所有连接，停止接受新的连接，并最终关闭服务器
        this.httpServer.shutdown();
    }

    /**
     * 启动帧同步
     * @private
     */
    private startFrameSync(): void {
        // 清除之前的帧同步定时器
        this.stopFrameSync();

        // 设置新的帧同步定时器
        this.frameSyncTimer = setInterval(() => {
            this.sendFrameSync();
            this.currentFrame++;
        }, this.frameInterval);
    }

    /**
     * 发送帧同步消息
     * @private
     */
    private sendFrameSync(): void {
        const frameSyncMessage: Message = {
            type: 'frameSync',
            payload: this.currentFrame,
        };

        this.connectionManager.broadcast(frameSyncMessage);
    }

    /**
     * 停止帧同步
     * @private
     */
    private stopFrameSync(): void {
        if (this.frameSyncTimer) {
            clearInterval(this.frameSyncTimer);
            this.frameSyncTimer = null;
        }
    }

    public registerExtension(extension: ServerExtension): void {
        this.serverExtensions.push(extension);
    }

    private invokeExtensionMethod(method: keyof ServerExtension, ...args: any[]): void {
        this.serverExtensions.forEach((extension) => {
            const handler = extension[method] as (this: ServerExtension, ...args: any[]) => void;
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

    private handleHeartbeatTimeout(connection: Connection): void {
        // 心跳超时，连接可能已经断开或出现其他问题
        // 可根据需要进行相关处理，如关闭连接、重新连接等
    }

    private reconnect(connection: Connection): void {
        // 在断开连接后的某个时间点尝试重新连接
        // 例如，使用定时器来延迟执行重新连接操作
        this.setupConnectionEventHandlers(connection);
        this.connectionManager.handleReconnect(connection);

        // 恢复连接后，发送消息队列中的消息
        this.connectionManager.sendCachedMessages(connection);
    }

    private setupConnectionEventHandlers(connection: Connection): void {
        const socket = connection.socket;

        socket.on('message', (data: WebSocket.Data) => {
            const message = WebSocketUtils.decodeMessage(data);

            if (message) {
                if (message.type === 'heartbeat') {
                    this.connectionManager.handleHeartbeatResponse(connection);
                } else {
                    this.handleMessage(connection, message);
                }
            }
        });

        socket.on('error', (error: any) => {
            console.error('[g-server]: WebSocket error:', error);
        });

        socket.on('close', () => {
            // 处理连接关闭
            this.handleDisconnect(connection);
        });
    }

    public handleDisconnect(connection: Connection): void {
        this.connectionManager.unregisterConnection(connection);

        // 缓存待发送的消息
        this.connectionManager.cacheMessagesForReconnect(connection);

        // 尝试重新连接
        const reconnectDelay = this.connectionManager.getReconnectDelay(connection.reconnectAttempts);
        setTimeout(() => {
            this.reconnect(connection);
        }, reconnectDelay);
    }

    public handleMessage(connection: Connection, message: Message): void {
        try {
            if (!connection.isAuthenticated) {
                // 如果连接还没有经过身份验证，那么它只能发送身份验证消息
                if (message.type !== 'authentication') {
                    connection.socket.close();
                    return;
                }

                // 验证身份信息
                if (!this.authenticate(connection, message.payload)) {
                    connection.socket.close();
                    return;
                }

                // 身份验证通过
                connection.isAuthenticated = true;
                return;
            }

            switch (message.type) {
                case 'text':
                    // 处理文本消息
                    this.handleTextMessage(connection, message.payload);
                    break;
                case 'data':
                    // 处理数据消息
                    this.handleDataMessage(connection, message.payload);
                    break;
                case 'authentication':
                    // 处理身份验证消息
                    this.handleAuthenticationMessage(connection, message);
                    break;
                case 'stateUpdate':
                    this.handleStateUpdate(connection, message);
                    break;
                // 添加其他消息类型的处理逻辑
                default:
                    console.warn('[g-server]: Unknown message type:', message.type);
                    break;
            }
        } catch (error) {
            console.error('[g-server]: Error handling message:', error);
        }

        // 调用用户自定义的消息处理方法
        this.invokeExtensionMethod('onMessageReceived', connection, message);
    }

    /**
     * 身份验证函数
     * @param connection
     * @param payload
     * @private
     */
    private async authenticate(connection: Connection, payload: any): Promise<boolean> {
        try {
            // 从数据库中查找用户
            return this.dataBase.authenticate(payload.username, payload.passwordHash);
        } catch (error) {
            console.error('[g-server]: Authentication error:', error);
            return false;
        }
    }

    private handleStateUpdate(connection: Connection, message: Message): void {
        if (message.payload.updatedAt > connection.lastUpdated) {
            // 如果客户端的更新时间比服务器上的更新时间更晚，那么更新服务器上的状态
            connection.state = message.payload.state;
            connection.lastUpdated = new Date(message.payload.updatedAt);
        } else {
            // 否则，向客户端发送一个错误消息，告知他们更新失败
            const errorMessage: Message = {
                type: 'error',
                payload: 'State update failed: newer state exists on server.',
            };
            WebSocketUtils.sendToConnection(connection, errorMessage);
        }
    }

    private handleAuthenticationMessage(connection: Connection, message: Message): void {
        // 处理身份验证消息
        // 根据消息的子类型来处理不同的认证步骤
        switch (message.subtype) {
            case 'usernamePassword':
                this.handleUsernamePassword(connection, message.payload);
                break;
            case 'verificationCode':
                this.handleVerificationCode(connection, message.payload);
                break;
            case 'token':
                this.handleToken(connection, message.payload);
                break;
            default:
                console.warn('[g-server]: Unknown authentication message subtype:', message.subtype);
                break;
        }
    }

    private async handleUsernamePassword(connection: Connection, payload: any): Promise<void> {
        // 使用用户名和密码进行验证，如果验证通过，那么生成验证码并发送给客户端
        const isAuthenticated = await this.dataBase.authenticate(payload.username, payload.password);
        if (isAuthenticated) {
            connection.verificationCode = this.generateVerificationCode();
            WebSocketUtils.sendToConnection(connection, {
                type: 'authentication',
                subtype: 'verificationCode',
                payload: connection.verificationCode,
            });
        } else {
            connection.socket.close();
        }
    }

    private handleVerificationCode(connection: Connection, payload: any): void {
        // 验证验证码，如果验证通过，那么生成令牌并发送给客户端
        if (connection.verificationCode && connection.verificationCode === payload) {
            connection.token = WebSocketUtils.generateToken();
            WebSocketUtils.sendToConnection(connection, {
                type: 'authentication',
                subtype: 'token',
                payload: connection.token,
            });
        } else {
            connection.socket.close();
        }
    }

    private handleToken(connection: Connection, payload: any): void {
        // 验证令牌，如果验证通过，那么认为身份验证已经完成
        if (connection.token && connection.token === payload) {
            connection.isAuthenticated = true;
        } else {
            connection.socket.close();
        }
    }

    private generateVerificationCode(): string {
        // 生成验证码
        return Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    }

    private handleTextMessage(connection: Connection, payload: string): void {
        // 处理文本消息
    }

    private handleDataMessage(connection: Connection, payload: any): void {
        // 处理数据消息
    }


    private generateUniqueId(): string {
        // 保证生成的标识符在连接对象中唯一
        return WebSocketUtils.generateToken();
    }

    public start() {
        this.httpServer.start(this.config.port);

        // 开始帧同步
        this.startFrameSync();
    }
}
