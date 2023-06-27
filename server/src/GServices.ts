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
import {ErrorHandler} from "./ErrorHandler";

/**
 * GServices 类，用于管理服务器的各种服务和功能。
 */
export class GServices {
    private config!: WebSocketServerConfig;
    private serverExtensions: ServerExtension[] = [];
    private heartbeatManager!: HeartbeatManager;
    private connectionManager!: ConnectionManager;
    private frameSyncManager!: FrameSyncManager;
    private httpServer!: HTTPServer;
    private webSocketServer!: WebSocketServer;
    private authentication!: Authentication;

    private static _services: GServices;
    public static I() {
        if (this._services == null)
            this._services = new GServices();

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

    private constructor() { }

    /**
     * 创建一个新的 GServices 实例。
     * @param config - WebSocket 服务器配置。
     */
    public init(config: WebSocketServerConfig) {
        this.config = config;

        process.on('uncaughtException', ErrorHandler.handleUncaughtException);
        process.on('unhandledRejection', ErrorHandler.handleUnhandledRejection);

        this.heartbeatManager = new HeartbeatManager(config.heartbeatInterval, config.heartbeatTimeout);
        this.connectionManager = new ConnectionManager();
        this.frameSyncManager = new FrameSyncManager();

        this.authentication = new Authentication();
        this.httpServer = new HTTPServer();
        this.webSocketServer = new WebSocketServer(this.httpServer.Server);
    }

    /**
     * 关闭服务器。
     */
    public shutdown(): void {
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
