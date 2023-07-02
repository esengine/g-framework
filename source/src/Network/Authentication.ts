module gs {
    export class Authentication {
        private connection: Connection;

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
                passwordHash: WebSocketUtils.hashPassword(password),
            };
            WebSocketUtils.sendToConnection(this.connection, {
                type: 'authentication',
                payload,
            });
        }

        /**
         * 处理服务器端发来的身份验证消息。
         * @param message - 身份验证消息对象。
         */
        public handleAuthenticationMessage(message: Message): void {
            if (message.payload.code == ErrorCodes.SUCCESS) {
                this.afterAuthenticated();
            }
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