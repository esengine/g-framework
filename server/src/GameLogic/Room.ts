import {Player} from "./Player";
import logger from "../ErrorAndLog/Logger";

/**
 * 房间类，代表一个房间。
 */
export class Room {
    private players: Player[] = []; // 用户列表

    /**
     * 获取房间中的所有玩家。
     * @returns 玩家数组。
     */
    public get Players(): Player[] {
        return this.players;
    }

    /**
     * 创建一个新的房间实例。
     * @param id - 房间 ID。
     * @param maxPlayers - 房间最大玩家数。
     */
    constructor(public id: string, public maxPlayers: number) {}

    /**
     * 添加玩家到房间。
     * @param player - 要添加的玩家。
     * @throws 当房间已满时抛出错误。
     */
    public addPlayer(player: Player): void {
        if (this.players.length < this.maxPlayers) {
            this.players.push(player);
        } else {
            logger.error('[g-server]: 房间已满');
        }
    }

    /**
     * 从房间中移除玩家。
     * @param player - 要移除的玩家。
     * @throws 当玩家不在房间中时抛出错误。
     */
    public removePlayer(player: Player): void {
        const index = this.players.findIndex((p) => p.id === player.id);
        if (index > -1) {
            this.players.splice(index, 1);
        } else {
            logger.error('[g-server]: 未在房间找到该玩家 %s', player.id);
        }
    }

    /**
     * 获取所有在房间里的用户的 ID。
     * @returns 用户 ID 的数组。
     */
    public getPlayerIds(): string[] {
        return this.players.map(player => player.id);
    }
}