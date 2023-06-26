import {WebSocketServerConfig} from "./WebSocketServerConfig";
import {WebSocketServer} from "./WebSocketServer";

export class ServerStarter {
    private server: WebSocketServer;

    constructor(config: WebSocketServerConfig) {
        this.server = new WebSocketServer(config);
    }

    public startServer() {
        this.server.start();
    }
}
