import * as bcrypt from 'bcrypt';
import {MongoClient, ServerApiVersion} from 'mongodb';
import logger from "../ErrorAndLog/Logger";
import {UserNotExistError, WrongPasswordError} from "../ErrorAndLog/GError";

/**
 * 数据库类，用于连接和操作 MongoDB 数据库。
 */
export class Database {
    private db: MongoClient;
    private dbName: string;
    private collectionName: string;

    /**
     * 创建一个新的数据库连接实例。
     * @param connectionStr - 数据库连接字符串
     * @param dbName - 数据库名
     * @param collectionName - 集合名
     */
    constructor(connectionStr: string, dbName: string, collectionName: string) {
        this.db = new MongoClient(connectionStr, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });
        this.dbName = dbName;
        this.collectionName = collectionName;
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
            logger.error('[g-server]: 连接数据库失败: %s', error);
            throw error;
        }
    }

    /**
     * 关闭数据库连接。
     * @returns 一个 Promise，表示关闭连接操作的异步结果。
     */
    public async closeConnection(): Promise<void> {
        try {
            await this.db.close();
            logger.info('[g-server]: 数据库已断开连接...');
        } catch (error: any) {
            logger.error('[g-server]: 断开数据库连接失败: %s', error);
            throw error;
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
            await this.db.connect();
            const collection = this.db.db(this.dbName).collection(this.collectionName);
            const user = await collection.findOne({username: username});

            if (!user) {
                // 用户名不存在
                throw new UserNotExistError();
            }

            const passwordMatch = await bcrypt.compare(password, user.passwordHash);
            if (passwordMatch) {
                return user;
            } else {
                throw new WrongPasswordError();
            }
        } catch (error) {
            logger.error('[g-server]: 身份验证错误: %s', error);
            return error;
        } finally {
            await this.db.close();
        }
    }

    public async register(username: string, password: string): Promise<any> {
        try {
            await this.db.connect();
            const collection = this.db.db(this.dbName).collection(this.collectionName);
            const user = await collection.findOne({username: username});

            if (user) {
                // 用户名已存在
                throw new Error("用户名已被注册");
            }

            const passwordHash = await bcrypt.hash(password, 10); // 10是bcrypt算法的盐值(salt)

            // 将新用户的信息保存到数据库中
            const result = await collection.insertOne({username: username, passwordHash: passwordHash});
            if (result.acknowledged) {
                return {success: true};
            } else {
                throw new Error("注册失败");
            }
        } catch (error) {
            logger.error('[g-server]: 注册错误: %s', error);
            return false;
        }
        finally {
            await this.db.close();
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
            logger.error('[g-server]: 找不到使用该令牌的用户: %s', error);
            return null;
        }
    }
}