import {Database} from "./Database";
import {Connection} from "./Connection";
import {WebSocketUtils} from "./WebSocketUtils";
import {Message} from "./Message";

/**
 * 身份验证类，用于处理连接的身份验证过程。
 */
export class Authentication {
    private dataBase: Database;

    /**
     * 创建一个新的身份验证实例。
     */
    constructor() {
        this.dataBase = new Database();
    }

    /**
     * 对连接进行身份验证。
     * @param connection - 要进行身份验证的连接。
     * @param payload - 身份验证的有效载荷数据。
     * @returns 一个 Promise，表示身份验证操作的异步结果。
     */
    public async authenticate(connection: Connection, payload: any): Promise<boolean> {
        try {
            // 从数据库中查找用户
            return this.dataBase.authenticate(payload.username, payload.passwordHash);
        } catch (error) {
            console.error('[g-server]: 身份验证错误:', error);
            return false;
        }
    }

    /**
     * 处理身份验证消息。
     * 根据消息的子类型来执行不同的身份验证步骤。
     * @param connection - 连接对象。
     * @param message - 身份验证消息对象。
     */
    public handleAuthenticationMessage(connection: Connection, message: Message): void {
        // 处理身份验证消息
        // 根据消息的子类型来处理不同的认证步骤
        switch (message.subtype) {
            case 'usernamePassword':
                this.handleUsernamePassword(connection, message.payload);
                break;
            case 'verificationCode':
                this.handleVerificationCode(connection, message.payload);
                break;
            case 'token':
                this.handleToken(connection, message.payload);
                break;
            default:
                console.warn('[g-server]: 未知的身份验证消息子类型:', message.subtype);
                break;
        }
    }

    /**
     * 处理基于用户名和密码的身份验证步骤。
     * 如果验证通过，生成验证码并发送给客户端。
     * @param connection - 连接对象。
     * @param payload - 身份验证消息的有效载荷数据。
     * @returns 一个 Promise，表示身份验证步骤的异步结果。
     */
    private async handleUsernamePassword(connection: Connection, payload: any): Promise<void> {
        // 使用用户名和密码进行验证，如果验证通过，那么生成验证码并发送给客户端
        const isAuthenticated = await this.dataBase.authenticate(payload.username, payload.password);
        if (isAuthenticated) {
            connection.verificationCode = this.generateVerificationCode();
            WebSocketUtils.sendToConnection(connection, {
                type: 'authentication',
                subtype: 'verificationCode',
                payload: connection.verificationCode,
            });
        } else {
            connection.socket.close();
        }
    }

    /**
     * 处理基于验证码的身份验证步骤。
     * 如果验证通过，生成令牌并发送给客户端。
     * @param connection - 连接对象。
     * @param payload - 身份验证消息的有效载荷数据。
     */
    private handleVerificationCode(connection: Connection, payload: any): void {
        // 验证验证码，如果验证通过，那么生成令牌并发送给客户端
        if (connection.verificationCode && connection.verificationCode === payload) {
            connection.token = WebSocketUtils.generateToken();
            WebSocketUtils.sendToConnection(connection, {
                type: 'authentication',
                subtype: 'token',
                payload: connection.token,
            });
        } else {
            connection.socket.close();
        }
    }

    /**
     * 处理基于令牌的身份验证步骤。
     * 如果验证通过，将认证状态设置为已完成。
     * @param connection - 连接对象。
     * @param payload - 身份验证消息的有效载荷数据。
     */
    private handleToken(connection: Connection, payload: any): void {
        // 验证令牌，如果验证通过，那么认为身份验证已经完成
        if (connection.token && connection.token === payload) {
            connection.isAuthenticated = true;
        } else {
            connection.socket.close();
        }
    }

    /**
     * 生成一个四位数的验证码。
     * @returns 生成的验证码。
     */
    private generateVerificationCode(): string {
        // 生成验证码
        return Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    }
}