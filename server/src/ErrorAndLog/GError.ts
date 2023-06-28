/**
 * 用户不存在错误类，用于表示用户名不存在的错误。
 */
export class UserNotExistError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = "用户名不存在";
    }
}

/**
 * 密码错误错误类，用于表示密码错误的错误。
 */
export class WrongPasswordError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = "密码错误";
    }
}