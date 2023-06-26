import * as http from "http";

/**
 * HTTP 服务器类，用于创建和管理 HTTP 服务器。
 */
export class HTTPServer {
    private server: http.Server;

    /**
     * 获取服务器实例。
     */
    public get Server() {
         return this.server;
    }

    /**
     * 创建一个新的 HTTP 服务器实例。
     */
    constructor() {
        this.server = http.createServer((request, response) => {
            // 处理 HTTP 请求
            response.statusCode = 404;
            response.end('Not Found');
        });
    }

    /**
     * 启动 HTTP 服务器并监听指定端口。
     * @param port - 要监听的端口号。
     */
    public start(port: number) {
        this.server.listen(port, () => {
            console.log(`[g-server]: HTTP 服务器正在监听端口 ${port}`);
        });
    }

    /**
     * 关闭 HTTP 服务器。
     */
    public shutdown() {
        this.server.close(() => {
            console.log('[g-server]: 服务器已关闭。');
            process.exit(1);
        });
    }
}
