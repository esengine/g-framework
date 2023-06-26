import {WebSocketServer} from "./WebSocketServer";
import {Connection} from "./Connection";
import {Message} from "./Message";

export interface ServerExtension {
    onServerStart(server: WebSocketServer): void;
    onClientConnect(connection: Connection): void;
    onClientDisconnect(connection: Connection): void;
    onMessageReceived(connection: Connection, message: Message): void;
}

export type CustomLogicCallback = (connection: Connection, message: Message) => void;