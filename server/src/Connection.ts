import WebSocket from "ws";

export interface Connection {
    id: string;
    socket: WebSocket;
    reconnectAttempts: number;
}
