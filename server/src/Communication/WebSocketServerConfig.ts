/**
 * WebSocket 服务器配置接口，用于定义 WebSocket 服务器的配置选项。
 */
export interface WebSocketServerConfig {
    /**
     * WebSocket 服务器监听的端口号。
     */
    port: number;
    /**
     * 心跳检测的时间间隔，以毫秒为单位。
     */
    heartbeatInterval: number;
    /**
     * 心跳超时时间，以毫秒为单位。
     */
    heartbeatTimeout: number;
    /**
     * 数据库连接字符串。
     */
    connectDBStr: string;

    sessionExpireTime: number;
}
