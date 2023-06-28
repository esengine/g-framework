module gs {
    export class Authentication {
        private connection: Connection;
        private token: string | null = null;
        private verificationCode: string | null = null;

        constructor(connection: Connection) {
            this.connection = connection;
        }

        /**
         * 启动身份验证过程。
         * @param username - 用户名。
         * @param password - 密码。
         */
        public startAuthentication(username: string, password: string): void {
            const payload = {
                username,
                passwordHash: WebSocketUtils.hashPassword(password), // 假设我们有一个散列密码的方法
            };
            WebSocketUtils.sendToConnection(this.connection, {
                type: 'authentication',
                subtype: 'usernamePassword',
                payload,
            });
        }

        /**
         * 处理服务器端发来的身份验证消息。
         * @param message - 身份验证消息对象。
         */
        public handleAuthenticationMessage(message: Message): void {
            switch (message.subtype) {
                case 'verificationCode':
                    this.handleVerificationCode(message.payload);
                    break;
                case 'token':
                    this.handleToken(message.payload);
                    break;
                default:
                    console.warn('[g-client]: 未知的身份验证消息子类型: %0', message.subtype);
                    break;
            }
        }

        /**
         * 处理服务器端发来的验证码。
         * @param payload - 身份验证消息的有效载荷数据。
         */
        private handleVerificationCode(payload: any): void {
            this.verificationCode = payload;
            WebSocketUtils.sendToConnection(this.connection, {
                type: 'authentication',
                subtype: 'verificationCode',
                payload: this.verificationCode,
            });
        }

        /**
         * 处理服务器端发来的令牌。
         * @param payload - 身份验证消息的有效载荷数据。
         */
        private handleToken(payload: any): void {
            this.token = payload;
            WebSocketUtils.sendToConnection(this.connection, {
                type: 'authentication',
                subtype: 'token',
                payload: this.token,
            });

            // 认证完成后，可以进行其他操作，比如加入房间或者开始游戏等等
            this.afterAuthenticated();
        }

        /**
         * 在身份验证完成后执行一些操作。
         */
        private afterAuthenticated(): void {
            // 身份验证完成后，可以进行一些操作，例如向服务器发送消息表示已经准备好开始游戏
            // 或者在 UI 中显示一个消息表示身份验证成功
        }
    }
}