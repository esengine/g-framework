import {Connection} from "./Connection";
import {Message} from "./Message";
import WebSocket from "ws";
import {v4 as uuidv4} from "uuid";

/**
 * 提供WebSocket相关的实用方法
 */
export class WebSocketUtils {
    /**
     * 向指定的连接发送消息
     * @param connection 目标连接
     * @param message 要发送的消息
     */
    public static sendToConnection(connection: Connection, message: Message): void {
        const encodedMessage = this.encodeMessage(message);
        try {
            connection.socket.send(encodedMessage);
        } catch (error) {
            // 根据具体情况，可能想要重新发送消息，或者只是记录错误
            console.error('[g-server]: Error sending message:', error);
        }
    }

    public static encodeMessage(message: Message): WebSocket.Data {
        return JSON.stringify(message);
    }

    public static decodeMessage(data: WebSocket.Data): Message | null {
        try {
            return JSON.parse(data.toString()) as Message;
        } catch (error) {
            console.error('[g-server]: Failed to decode message:', error);
            return null;
        }
    }

    public static generateToken(): string {
        return uuidv4();
    }
}