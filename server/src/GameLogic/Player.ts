import {Connection} from "../Communication/Connection";
import {playerConnection} from "./PlayerConnection";

/**
 * 玩家类，表示一个玩家对象。
 */
export class Player {
    /**
     * 创建一个新的玩家实例。
     * @param id - 玩家的唯一标识符。
     */
    private constructor(public id: string) {}

    static create(connection: Connection): Player {
        playerConnection.set(connection.id, connection);
        return new Player(connection.id);
    }
}