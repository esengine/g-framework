import WebSocket from 'ws';
import {WebSocketServerConfig} from "./WebSocketServerConfig";
import {Connection} from "./Connection";
import {Message} from "./Message";
import {ServerExtension} from "./ServerExtension";
import {WebSocketUtils} from "./WebSocketUtils";
import {HeartbeatManager} from "./HeartbeatManager";
import {ConnectionManager} from "./ConnectionManager";
import {HTTPServer} from "./HTTPServer";
import {WebSocketServer} from "./WebSocketServer";
import {Authentication} from "./Authentication";
import {FrameSyncManager} from "./FrameSyncManager";
import logger from "./Logger";

/**
 * GServices 类，用于管理服务器的各种服务和功能。
 */
export class GServices {
    private config: WebSocketServerConfig;
    private serverExtensions: ServerExtension[] = [];
    private heartbeatManager: HeartbeatManager;
    private connectionManager: ConnectionManager;
    private frameSyncManager: FrameSyncManager;
    private httpServer: HTTPServer;
    private webSocketServer: WebSocketServer;
    private authentication: Authentication;

    private static _services: GServices;
    public static I() {
        return this._services;
    }

    /**
     * 获取心跳管理器。
     */
    public get HeartBeatManager() {
        return this.heartbeatManager;
    }

    /**
     * 获取连接管理器。
     */
    public get ConnectionManager() {
        return this.connectionManager;
    }

    /**
     * 创建一个新的 GServices 实例。
     * @param config - WebSocket 服务器配置。
     */
    constructor(config: WebSocketServerConfig) {
        this.config = config;

        process.on('uncaughtException', this.handleUncaughtException.bind(this));
        process.on('unhandledRejection', this.handleUnhandledRejection.bind(this));

        this.heartbeatManager = new HeartbeatManager(config.heartbeatInterval, config.heartbeatTimeout);
        this.connectionManager = new ConnectionManager();
        this.frameSyncManager = new FrameSyncManager();

        this.authentication = new Authentication();
        this.httpServer = new HTTPServer();
        this.webSocketServer = new WebSocketServer(this.httpServer.Server);
    }

    /**
     * 处理未捕获的异常。
     * @param error - 错误对象。
     */
    private handleUncaughtException(error: Error): void {
        // 这里可以记录错误，并通知相关人员
        logger.error('[g-server]: 未捕获的异常: %O', error);

        // 针对不同的错误类型进行特殊处理
        // 例如，根据错误类型或错误信息来判断这个错误是否严重到需要关闭服务器
        if (error.message.includes('mongodb')) {
            logger.error('[g-server]: 数据库错误。正在关闭服务器...');
            this.shutdown();
        } else if (error.message.includes('network')) {
            logger.error('[g-server]: 网络错误。正在尝试恢复...');
            // 试图恢复服务或者其他的处理方式
        } else {
            logger.error('[g-server]: 未知错误。继续运行...');
        }
    }

    /**
     * 处理未处理的 Promise 拒绝。
     * @param reason - 拒绝原因。
     * @param promise - 拒绝的 Promise。
     */
    private handleUnhandledRejection(reason: {} | null | undefined, promise: Promise<any>): void {
        // 这里可以记录错误，并通知相关人员
        logger.error('[g-server]: 未处理的 Promise 拒绝: %O', reason);

        // 如果你能预期到某些特定类型的 Promise 错误，你也可以在这里添加针对性的处理代码
        if (typeof reason === 'object' && reason !== null && 'message' in reason) {
            const message = (reason as { message?: string }).message;
            if (message && message.includes('database')) {
                logger.error('[g-server]: Promise 中的数据库错误。正在关闭服务器...');
                this.shutdown();
            } else if (message && message.includes('network')) {
                logger.error('[g-server]: Promise 中的网络错误。正在尝试恢复...');
                // 试图恢复服务或者其他的处理方式
            } else {
                logger.error('[g-server]: 未知 Promise 拒绝。继续运行...');
            }
        }
    }

    /**
     * 关闭服务器。
     */
    private shutdown(): void {
        // 这里应该执行一些清理操作，如关闭所有连接，停止接受新的连接，并最终关闭服务器
        this.httpServer.shutdown();
    }

    /**
     * 注册服务器扩展。
     * @param extension - 要注册的服务器扩展。
     */
    public registerExtension(extension: ServerExtension): void {
        this.serverExtensions.push(extension);
    }

    /**
     * 调用所有已注册服务器扩展的指定方法。
     * @param method - 要调用的方法名称。
     * @param args - 方法的参数。
     */
    public invokeExtensionMethod(method: keyof ServerExtension, ...args: any[]): void {
        this.serverExtensions.forEach((extension) => {
            const handler = extension[method] as (this: ServerExtension, ...args: any[]) => void;
            if (typeof handler === 'function') {
                handler.apply(extension, args);
            }
        });
    }

    /**
     * 处理客户端连接事件。
     * @param connection - 连接对象。
     */
    public handleClientConnect(connection: Connection): void {
        // 调用用户自定义的连接建立处理方法
        this.invokeExtensionMethod('onClientConnect', connection);
    }

    /**
     * 处理客户端断开连接事件。
     * @param connection - 连接对象。
     */
    public handleClientDisconnect(connection: Connection): void {
        // 调用用户自定义的连接断开处理方法
        this.invokeExtensionMethod('onClientDisconnect', connection);
    }

    /**
     * 设置连接的事件处理程序。
     * @param connection - 连接对象。
     */
    public setupConnectionEventHandlers(connection: Connection): void {
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
            logger.error('[g-server]: WebSocket error: %0', error);
        });

        socket.on('close', () => {
            // 处理连接关闭
            this.connectionManager.handleDisconnect(connection);
            // 用户处理
            this.handleClientDisconnect(connection);
        });
    }

    /**
     * 处理接收到的消息。
     * @param connection - 连接对象。
     * @param message - 接收到的消息。
     */
    public handleMessage(connection: Connection, message: Message): void {
        try {
            if (!connection.isAuthenticated) {
                // 如果连接还没有经过身份验证，那么它只能发送身份验证消息
                if (message.type !== 'authentication') {
                    connection.socket.close();
                    return;
                }

                // 验证身份信息
                if (!this.authentication.authenticate(connection, message.payload)) {
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
                    this.authentication.handleAuthenticationMessage(connection, message);
                    break;
                case 'stateUpdate':
                    this.handleStateUpdate(connection, message);
                    break;
                case 'action':
                    this.frameSyncManager.collectClientAction(this.frameSyncManager.CurrentFrame, message.payload);
                    break;
                default:
                    logger.warn('[g-server]: 未知的消息类型: %0', message.type);
                    break;
            }
        } catch (error) {
            logger.error('[g-server]: 处理消息时出错: %0', error);
        }

        // 调用用户自定义的消息处理方法
        this.invokeExtensionMethod('onMessageReceived', connection, message);
    }

    /**
     * 处理状态更新消息。
     * @param connection - 连接对象。
     * @param message - 状态更新消息。
     */
    private handleStateUpdate(connection: Connection, message: Message): void {
        if (message.payload.updatedAt > connection.lastUpdated) {
            // 如果客户端的更新时间比服务器上的更新时间更晚，那么更新服务器上的状态
            connection.state = message.payload.state;
            connection.lastUpdated = new Date(message.payload.updatedAt);
        } else {
            // 否则，向客户端发送一个错误消息，告知他们更新失败
            const errorMessage: Message = {
                type: 'error',
                payload: '状态更新失败：服务器上存在更新的状态',
            };
            WebSocketUtils.sendToConnection(connection, errorMessage);
        }
    }

    /**
     * 处理文本消息。
     * @param connection - 连接对象。
     * @param payload - 文本消息的内容。
     */
    private handleTextMessage(connection: Connection, payload: string): void {
        // 处理文本消息
    }

    /**
     * 处理数据消息。
     * @param connection - 连接对象。
     * @param payload - 数据消息的内容。
     */
    private handleDataMessage(connection: Connection, payload: any): void {
        // 处理数据消息
    }

    /**
     * 启动服务器。
     */
    public start() {
        this.httpServer.start(this.config.port);

        // 开始帧同步
        this.frameSyncManager.startFrameSync();
    }
}
