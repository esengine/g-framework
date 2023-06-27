export class Connection {
    private socket: WebSocket;
    public isAuthenticated: boolean = false;
    public token: string | null = null;
    public verificationCode: string | null = null;

    public get Socket() {
        return this.socket;
    }

    constructor(url: string) {
        this.socket = new WebSocket(url);
    }

    public send(message: any): void {
        this.socket.send(JSON.stringify(message));
    }
}
