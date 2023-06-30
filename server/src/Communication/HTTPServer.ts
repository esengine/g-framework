import * as http from "http";
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import express = require("express");
import logger from "../ErrorAndLog/Logger";
import {GServices} from "../Service/GServices";

/**
 * HTTP 服务器类，用于创建和管理 HTTP 服务器。
 */
export class HTTPServer {
    private server: http.Server;
    private app: express.Application;

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
        this.app = express();
        this.server = http.createServer((request, response) => {
            // 处理 HTTP 请求
            response.statusCode = 404;
            response.end('Not Found');
        });

        this.app.use(bodyParser.json());
        this.app.use(cors());
        this.app.use(helmet());
        this.handleRoute();
    }

    /**
     * 启动 HTTP 服务器并监听指定端口。
     * @param port - 要监听的端口号。
     */
    public start(port: number) {
        this.server.listen(port, () => {
            logger.info(`[g-server]: HTTP 服务器正在监听端口 ${port}`);
        });
    }

    /**
     * 关闭 HTTP 服务器。
     */
    public shutdown() {
        this.server.close(() => {
            logger.info('[g-server]: 服务器已关闭');

            process.exit(1);
        });
    }

    private handleRoute() {
        this.app.get('/rooms', (req, res) => {
            // 获取所有的房间
            const rooms = GServices.I().RoomManager.getRooms();
            res.json(rooms);
        });
    }
}
