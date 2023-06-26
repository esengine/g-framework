import * as http from "http";

export class HTTPServer {
    private server: http.Server;

    public get Server() {
         return this.server;
    }

    constructor() {
        this.server = http.createServer((request, response) => {
            // 处理 HTTP 请求
            response.statusCode = 404;
            response.end('Not Found');
        });
    }

    public start(port: number) {
        this.server.listen(port, () => {
            console.log(`[g-server]: HTTP server listening on port ${port}`);
        });
    }

    public shutdown() {
        this.server.close(() => {
            console.log('[g-server]: Server shut down.');
            process.exit(1);
        });
    }
}
