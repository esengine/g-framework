import {Message} from "./Message";

/**
 * 表示消息队列中的项目。
 */
export interface MessageQueueItem {
    /**
     * 客户端的唯一标识符。
     */
    clientId: string;

    /**
     * 要发送的消息。
     */
    message: Message;
}