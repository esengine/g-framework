import * as bcrypt from 'bcrypt';
import { MongoClient } from 'mongodb';
import logger from "./Logger";

/**
 * 数据库类，用于连接和操作 MongoDB 数据库。
 */
export class Database {
    private db: MongoClient;

    /**
     * 创建一个新的数据库连接实例。
     */
    constructor() {
        this.db = new MongoClient('mongodb://localhost:27017');
    }

    /**
     * 创建数据库连接。
     * @returns 一个 Promise，表示连接操作的异步结果。
     */
    public async createConnection(): Promise<void> {
        try {
            await this.db.connect();
            logger.info('[g-server]: 已连接到数据库');
        } catch (error: any) {
            logger.error('[g-server]: 连接数据库失败: %0', error);
        }
    }

    /**
     * 对用户进行身份验证。
     * @param username - 用户名。
     * @param password - 密码。
     * @returns 一个 Promise，表示身份验证操作的异步结果。
     */
    public async authenticate(username: string, password: string): Promise<any> {
        try {
            const collection = this.db.db('g-database').collection('users');
            const user = await collection.findOne({username: username});

            if (!user) {
                // 用户名不存在
                return null;
            }

            const passwordMatch = await bcrypt.compare(password, user.passwordHash);
            if (passwordMatch) {
                return user;
            } else {
                return null;
            }
        } catch (error) {
            logger.error('[g-server]: 身份验证错误: %0', error);
            return false;
        }
    }

    /**
     * 根据令牌查找用户。
     * @param token - 令牌。
     * @returns 一个 Promise，表示根据令牌查找用户的异步结果。
     */
    public async findUserByToken(token: string): Promise<any> {
        try {
            const collection = this.db.db('g-database').collection('users');
            const user = await collection.findOne({token: token});

            return user;
        } catch (error) {
            logger.error('[g-server]: 找不到使用该令牌的用户: %0', error);
            return null;
        }
    }
}