import {GServices} from "./GServices";
import {Connection} from "../Communication/Connection";
import {Message} from "../Communication/Message";

/**
 * 服务器扩展接口，用于扩展服务器功能。
 */
export interface ServerExtension {
    /**
     * 当服务器启动时触发的回调函数。
     * @param server - GServices 实例。
     */
    onServerStart(server: GServices): void;

    /**
     * 当客户端连接时触发的回调函数。
     * @param connection - 连接对象。
     */
    onClientConnect(connection: Connection): void;

    /**
     * 当客户端断开连接时触发的回调函数。
     * @param connection - 连接对象。
     */
    onClientDisconnect(connection: Connection): void;

    /**
     * 当心跳超时时触发的回调函数。
     * @param connection - 连接对象。
     */
    onHeartbeatTimeout(connection: Connection): void;

    /**
     * 当接收到消息时触发的回调函数。
     * @param connection - 连接对象。
     * @param message - 接收到的消息。
     */
    onMessageReceived(connection: Connection, message: Message): void;
}

/**
 * 自定义逻辑回调类型。
 * @param connection - 连接对象。
 * @param message - 接收到的消息。
 */
export type CustomLogicCallback = (connection: Connection, message: Message) => void;