import {Connection} from "./Connection";

/**
 * 玩家类，表示一个玩家对象。
 */
export class Player {
    /**
     * 创建一个新的玩家实例。
     * @param id - 玩家的唯一标识符。
     * @param connection - 玩家的连接对象。
     */
    constructor(public id: string, public connection: Connection) {}
}