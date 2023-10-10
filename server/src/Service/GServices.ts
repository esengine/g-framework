import WebSocket from 'ws';
import {WebSocketServerConfig} from "../Communication/WebSocketServerConfig";
import {Connection} from "../Communication/Connection";
import {Message} from "../Communication/Message";
import {ServerExtension} from "./ServerExtension";
import {WebSocketUtils} from "../Communication/WebSocketUtils";
import {HeartbeatManager} from "../Heartbeat/HeartbeatManager";
import {ConnectionManager} from "../Communication/ConnectionManager";
import {HTTPServer} from "../Communication/HTTPServer";
import {WebSocketServer} from "../Communication/WebSocketServer";
import {Authentication} from "../Communication/Authentication";
import {FrameSyncManager} from "../GameLogic/FrameSyncManager";
import logger from "../ErrorAndLog/Logger";
import {ErrorHandler} from "../ErrorAndLog/ErrorHandler";
import {RoomManager} from "../GameLogic/RoomManager";
import {UserNotExistError, WrongPasswordError} from "../ErrorAndLog/GError";
import {Player} from "../GameLogic/Player"
import {SessionManager} from "../Communication/SessionManager";
import {ErrorCodes} from "../ErrorAndLog/ErrorCode";
import {Room} from "../GameLogic/Room";

/**
 * GServices 类，用于管理服务器的各种服务和功能。
 */
export class GServices {
    private config!: WebSocketServerConfig;
    private serverExtensions: ServerExtension[] = [];
    private heartbeatManager!: HeartbeatManager;
    private connectionManager!: ConnectionManager;
    private frameSyncManager!: FrameSyncManager;
    private roomManager!: RoomManager;
    private httpServer!: HTTPServer;
    private webSocketServer!: WebSocketServer;
    private authentication!: Authentication;
    private sessionManager!: SessionManager;

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

    public get RoomManager() {
        return this.roomManager;
    }

    private constructor() { }

    /**
     * 创建一个新的 GServices 实例。
     * @param config - WebSocket 服务器配置。
     */
    public async init(config: WebSocketServerConfig) {
        this.config = config;

        process.on('uncaughtException', ErrorHandler.handleUncaughtException);
        process.on('unhandledRejection', ErrorHandler.handleUnhandledRejection);

        process.on('SIGINT', this.shutdown.bind(this));
        process.on('SIGTERM', this.shutdown.bind(this));

        this.sessionManager = new SessionManager();
        this.authentication = new Authentication(config);
        await this.authentication.DataBase.createConnection();

        this.heartbeatManager = new HeartbeatManager(config.heartbeatInterval, config.heartbeatTimeout);
        this.connectionManager = new ConnectionManager();
        this.frameSyncManager = new FrameSyncManager(config.frameInterval);
        this.roomManager = new RoomManager();

        this.httpServer = new HTTPServer();
        this.webSocketServer = new WebSocketServer(this.httpServer.Server);
    }

    /**
     * 关闭服务器。
     */
    public async shutdown() {
        logger.info('[g-server]: 正在关闭服务端...');
        // 这里应该执行一些清理操作，如关闭所有连接，停止接受新的连接，并最终关闭服务器
        await this.authentication.DataBase.closeConnection();
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
        const sessionId = this.sessionManager.createSession(connection);
        // 发送sessionId给客户端
        WebSocketUtils.sendToConnection(connection, { type: 'sessionId', payload: sessionId });
        // 调用用户自定义的连接建立处理方法
        this.invokeExtensionMethod('onClientConnect', connection);
    }

    /**
     * 处理客户端断开连接事件。
     * @param connection - 连接对象。
     */
    public handleClientDisconnect(connection: Connection): void {
        // 当客户端断开连接时，我们不立即删除其session
        // 可以设置一个定时器，在一段时间后删除session
        setTimeout(() => this.sessionManager.deleteSession(connection.sessionId), this.config.sessionExpireTime);
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
            logger.error('[g-server]: WebSocket error: %s', error);
        });

        socket.on('close', () => {
            // 处理连接关闭
            this.connectionManager.handleDisconnect(connection);
            // 用户处理
            this.handleClientDisconnect(connection);
        });
    }

    /**
     * 消息处理器映射
     * @private
     */
    private messageHandlers: Record<string, (connection: Connection, payload: any) => void> = {
        'stateUpdate': this.handleStateUpdate,
        'action': this.handleActionMessage,
        'createRoom': this.handleCreateRoomMessage,
        'joinRoom': this.handleJoinRoomMessage,
        'leaveRoom': this.handleLeaveRoomMessage,
        'startGame': this.handleStartGameMessage,
    };

    /**
     * 处理接收到的消息。
     * @param connection - 连接对象。
     * @param message - 接收到的消息。
     */
    public async handleMessage(connection: Connection, message: Message) {
        try {
            this.recordMessageBytes(connection, message);
            // 对重连请求进行特殊处理
            if (message.type === 'reconnect') {
                this.handleReconnect(connection, message.payload);
                return;
            }

            if (!connection.isAuthenticated) {
                // 如果连接还没有经过身份验证，那么它只能发送身份验证消息
                if (message.type !== 'authentication') {
                    WebSocketUtils.sendToConnection(connection, { type: 'authentication', payload: { code: ErrorCodes.AUTH_FAIL }});
                    connection.socket.close();
                    return;
                }

                // 验证身份信息
                const result = await this.authentication.authenticate(connection, message.payload);
                if (result instanceof UserNotExistError) {
                    // 用户名不存在，尝试注册新用户
                    const registerResult = await this.authentication.register(connection, message.payload);
                    if (!registerResult.success) {
                        WebSocketUtils.sendToConnection(connection, { type: 'authentication', payload: { code: ErrorCodes.REGISTRATION_FAILED }});
                        return;
                    }
                } else if (result instanceof WrongPasswordError) {
                    // 密码错误，直接关闭连接
                    WebSocketUtils.sendToConnection(connection, { type: 'authentication', payload: { code: ErrorCodes.WRONG_PASSWORD }});
                    return;
                } else {
                    // 身份验证通过
                    connection.isAuthenticated = true;
                    // 获取sessionId
                    const sessionId = connection.sessionId;
                    // 发送身份验证消息，带有sessionId
                    WebSocketUtils.sendToConnection(connection, { type: 'authentication', payload: { code: ErrorCodes.SUCCESS, sessionId: sessionId, id: connection.id }});
                    return;
                }

                return;
            }

            const handler = this.messageHandlers[message.type];
            if (handler) {
                handler.call(this, connection, message.payload);
            } else {
                logger.warn('[g-server]: 未知的消息类型: %s', message.type);
            }
        } catch (error) {
            logger.error('[g-server]: 处理消息时出错: %s', error);
        }

        // 调用用户自定义的消息处理方法
        this.invokeExtensionMethod('onMessageReceived', connection, message);
    }

    private recordMessageBytes(connection: Connection, message: Message) {
        let length: number = Buffer.byteLength(JSON.stringify(message), 'utf-8');
        connection.totalReceivedBytes += length;
    }

    private handleReconnect(connection: Connection, payload: any): void {
        const { sessionId } = payload;
        const oldConnection = this.sessionManager.getSession(sessionId);
        if (oldConnection) {
            // 重新绑定sessionId到新连接
            connection.sessionId = this.sessionManager.createSession(connection);
            // 恢复状态
            connection.state = oldConnection.state;
            connection.roomId = oldConnection.roomId;
            // 发送重连成功消息
            WebSocketUtils.sendToConnection(connection, { type: 'reconnect', payload: { code: ErrorCodes.SUCCESS } });
        } else {
            // sessionId无效，发送重连失败消息
            WebSocketUtils.sendToConnection(connection, { type: 'reconnect', payload: { code: ErrorCodes.RECONNECT_FAIL} });
        }
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
     * 处理创建房间消息。
     * @param connection - 连接对象。
     * @param payload - 加入房间消息的有效载荷数据。
     */
    private handleCreateRoomMessage(connection: Connection, payload: any): void {
        if (payload == null) {
            logger.error('[g-server]: 接收到一个 payload:[null] 的创建房间消息');
            return;
        }

        const { maxPlayers } = payload;

        // 在这里执行创建房间的逻辑
        const newRoom = this.RoomManager.createRoom(connection, maxPlayers);
        const player = Player.create(connection);
        this.RoomManager.addPlayerToRoom(player, newRoom.id);

        // 房间创建成功
        logger.info(`[g-server]: 房间 %s 创建成功`, newRoom.id);
        // 可以向创建者发送成功消息
        const successMessage: Message = {
            type: 'roomCreated',
            payload: { roomId: newRoom.id },
        };
        WebSocketUtils.sendToConnection(connection, successMessage);
    }

    /**
     * 处理加入房间消息。
     * @param connection - 连接对象。
     * @param payload - 加入房间消息的有效载荷数据。
     */
    private handleJoinRoomMessage(connection: Connection, payload: any): void {
        if (payload == null) {
            logger.error('[g-server]: 接收到一个 payload:[null] 的加入房间消息');
            return;
        }

        const { roomId, playerId } = payload;
        const player = Player.create(connection);
        this.RoomManager.addPlayerToRoom(player, roomId);

        connection.roomId = roomId;
        // 需要向房间内的所有其他玩家广播一条消息，告诉他们有新玩家加入
        const joinMessage: Message = {
            type: 'playerJoined',
            payload: { playerId },
        };
        this.RoomManager.broadcastToRoom(roomId, joinMessage);
    }

    /**
     * 处理离开房间消息。
     * @param connection - 连接对象。
     * @param payload - 加入房间消息的有效载荷数据。
     */
    private handleLeaveRoomMessage(connection: Connection, payload: any): void {
        if (payload == null) {
            logger.error('[g-server]: 接收到一个 payload:[null] 的离开房间消息');
            return;
        }

        if (!connection.roomId) {
            logger.warn('[g-server]: 该连接没有加入房间 %s', connection.id);
            return;
        }

        const { playerId } = payload;
        const roomId = connection.roomId;
        const player = Player.create(connection);

        // 从房间中移除玩家
        this.RoomManager.removePlayerFromRoom(player, roomId);

        // 清除玩家的房间信息
        connection.roomId = undefined;

        // 需要向房间内的所有其他玩家广播一条消息，告诉他们有玩家离开
        const leaveMessage: Message = {
            type: 'playerLeft',
            payload: { playerId },
        };
        this.RoomManager.broadcastToRoom(roomId, leaveMessage);
    }

    /**
     * 处理开始游戏消息。
     * @param connection - 连接对象。
     * @param payload - 开始游戏消息的有效载荷数据。
     */
    private handleStartGameMessage(connection: Connection, payload: any): void {
        const {roomId} = payload;

        this.frameSyncManager.startRoomFrameSync(roomId);
    }

    private handleActionMessage(connection: Connection, payload: any) {
        const roomId = connection.roomId;
        if (roomId) {
            const frame = this.frameSyncManager.getRoomCurrentFrame(roomId);
            if (frame !== undefined) {
                this.frameSyncManager.collectClientAction(roomId, frame, payload);
            }
        } else {
            logger.error('[g-server]: 用户 %s 还未加入房间: %s', connection.id, 'action');
        }
    }

    /**
     * 启动服务器。
     */
    public start() {
        this.httpServer.start(this.config.port);
    }
}
