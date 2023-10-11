import { v4 as uuidv4 } from 'uuid';
import {Player} from "./Player";
import {Room} from "./Room";
import {Message} from "../Communication/Message";
import {GServices} from "../Service/GServices";
import {WebSocketUtils} from "../Communication/WebSocketUtils";
import logger from "../ErrorAndLog/Logger";
import {Connection} from "../Communication/Connection";

export class RoomManager {
    private rooms: { [id: string]: Room } = {};

    /**
     * 创建一个新的房间。
     * @param connection - 链接
     * @param maxPlayers - 房间的最大玩家数量。
     * @returns 新创建的房间。
     */
    public createRoom(connection: Connection, maxPlayers: number): Room {
        const roomId = uuidv4();
        const room = new Room(roomId, connection.id, maxPlayers);
        this.rooms[roomId] = room;
        return room;
    }

    /**
     * 删除指定 ID 的房间。
     * @param roomId - 要删除的房间的 ID。
     */
    public deleteRoom(roomId: string): void {
        delete this.rooms[roomId];

        // 房间删除的时候停止帧同步
        GServices.I().FrameSyncManager.stopRoomFrameSync(roomId);
    }

    /**
     * 将玩家添加到指定 ID 的房间。
     * @param player - 要添加的玩家。
     * @param roomId - 目标房间的 ID。
     */
    public addPlayerToRoom(player: Player, roomId: string): void {
        const room = this.rooms[roomId];
        if (room) {
            room.addPlayer(player);
        } else {
            logger.error('[g-server]: 房间未找到');
        }
    }

    /**
     * 从指定 ID 的房间中移除玩家。
     * @param player - 要移除的玩家。
     * @param roomId - 目标房间的 ID。
     */
    public removePlayerFromRoom(player: Player, roomId: string): void {
        const room = this.rooms[roomId];
        if (room) {
            room.removePlayer(player);
        } else {
            logger.error('[g-server]: 房间未找到');
        }

        // 如果房间内没有玩家则把房间删除
        if (!room.hasPlayers()) {
            this.deleteRoom(roomId);
        }
    }

    /**
     * 向指定 ID 的房间广播消息。
     * @param roomId - 目标房间的 ID。
     * @param message - 要广播的消息。
     */
    public broadcastToRoom(roomId: string, message: Message): void {
        const room = this.getRoomById(roomId);
        if (room) {
            for (const userId of room.getPlayerIds()) {
                const connection = GServices.I().ConnectionManager.getConnectionById(userId);
                if (connection) {
                    WebSocketUtils.sendToConnection(connection, message);
                }
            }
        }
    }

    /**
     * 根据 ID 获取房间。
     * @param id - 房间的 ID。
     * @returns 返回与 ID 相对应的房间，如果没有找到则返回 null。
     */
    public getRoomById(id: string): Room | null {
        return this.rooms[id] || null;
    }

    /**
     * 获取所有房间
     */
    public getRooms() {
        return this.rooms;
    }
}
