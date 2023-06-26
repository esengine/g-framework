import * as bcrypt from 'bcrypt';
import { MongoClient } from 'mongodb';

export class Database {
    private db: MongoClient;

    constructor() {
        this.db = new MongoClient('mongodb://localhost:27017');
    }

    public async createConnection(): Promise<void> {
        try {
            await this.db.connect();
            console.log('[g-server]: Connected to database');
        } catch (error: any) {
            console.error('[g-server]: Failed to connect to database:', error);
        }
    }

    public async authenticate(username: string, password: string): Promise<boolean> {
        try {
            const collection = this.db.db('g-database').collection('users');
            const user = await collection.findOne({username: username});

            if (!user) {
                // 用户名不存在
                return false;
            }

            return await bcrypt.compare(password, user.passwordHash);
        } catch (error) {
            console.error('[g-server]: Authentication error:', error);
            return false;
        }
    }
}