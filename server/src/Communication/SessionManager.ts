import {Connection} from "./Connection";

export class SessionManager {
    private sessions: Map<string, Connection> = new Map();

    public createSession(connection: Connection): string {
        const sessionId = this.generateSessionId();
        connection.sessionId = sessionId;
        this.sessions.set(sessionId, connection);
        return sessionId;
    }

    public getSession(sessionId: string): Connection | undefined {
        return this.sessions.get(sessionId);
    }

    public deleteSession(sessionId: string): void {
        this.sessions.delete(sessionId);
    }

    private generateSessionId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}
