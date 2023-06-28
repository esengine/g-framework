export interface WebSocketServerConfig {
    port: number;
    heartbeatInterval: number;
    heartbeatTimeout: number;
    connectDBStr: string;
}
