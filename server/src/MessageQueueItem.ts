import {Message} from "./Message";

export interface MessageQueueItem {
    clientId: string;
    message: Message;
}