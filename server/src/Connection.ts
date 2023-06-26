import WebSocket from "ws";

export interface Connection {
    id: string;
    socket: WebSocket;
    reconnectAttempts: number;
    isAuthenticated: boolean;
    state: string;
    lastUpdated: Date; // 用于解决状态冲突
    verificationCode?: string;
    token?: string;
}
