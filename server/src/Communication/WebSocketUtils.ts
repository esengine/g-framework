import {Connection, FrameInfo} from "./Connection";
import {Message} from "./Message";
import WebSocket from "ws";
import {v4 as uuidv4} from "uuid";
import logger from "../ErrorAndLog/Logger";
import {GServices} from "../Service/GServices";

/**
 * 提供WebSocket相关的实用方法
 */
export class WebSocketUtils {
    /**
     * 向指定连接发送消息。
     * @param connection - 目标连接。
     * @param message - 要发送的消息。
     * @returns 发送的帧信息。
     */
    public static sendToConnection(connection: Connection, message: Message) {
        const encodedMessage = this.encodeMessage(message);
        try {
            connection.socket.send(encodedMessage);
        } catch (error) {
            // 根据具体情况，可能想要重新发送消息，或者只是记录错误
            logger.error('[g-server]: 发送消息时出错: %0', error);
            throw error; // 如果出错，抛出异常
        }

        // 获取数据的长度
        let length: number;
        if (typeof encodedMessage === 'string') {
            length = Buffer.byteLength(encodedMessage, 'utf-8');
        } else if (encodedMessage instanceof Buffer) {
            length = encodedMessage.byteLength;
        } else if (Array.isArray(encodedMessage)) {
            length = encodedMessage.reduce((prev, curr) => prev + curr.byteLength, 0);
        } else {
            length = encodedMessage.byteLength;
        }

        const frameInfo = {
            type: 'text',
            length: length,
            isFinalFrame: true,
        };
        connection.totalSentBytes += length;
        GServices.I().ConnectionManager.updateConnectionStats(connection, frameInfo, false);
    }

    /**
     * 将消息编码为 WebSocket 数据。
     * @param message - 要编码的消息。
     * @returns 编码后的 WebSocket 数据。
     */
    public static encodeMessage(message: Message): WebSocket.Data {
        return JSON.stringify(message);
    }

    /**
     * 将 WebSocket 数据解码为消息对象。
     * @param data - 要解码的 WebSocket 数据。
     * @returns 解码后的消息对象，如果解码失败则返回 null。
     */
    public static decodeMessage(data: WebSocket.Data): Message | null {
        try {
            return JSON.parse(data.toString()) as Message;
        } catch (error) {
            logger.error('[g-server]: 解码消息失败: %s', error);
            return null;
        }
    }

    /**
     * 生成一个唯一的令牌。
     * @returns 生成的令牌。
     */
    public static generateToken(): string {
        return uuidv4();
    }
}