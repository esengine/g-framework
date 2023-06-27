import {Message} from "./Message";
import {GServices} from "./GServices";

/**
 * 帧同步管理器类，用于管理游戏帧同步。
 */
export class FrameSyncManager {
    private roomFrames: Record<string, number> = {}; // 每个房间的当前帧数
    private frameInterval: number = 1000 / 60; // 每帧时间间隔（默认为60帧每秒）
    private roomTimers: Record<string, NodeJS.Timeout | null> = {}; // 每个房间的帧同步定时器
    private roomActions: Record<string, Record<number, any[]>> = {}; // 每个房间每帧的客户端操作

    /**
     * 获取指定房间的当前帧数。
     * @param roomId - 房间 ID。
     * @returns 当前帧数，如果房间不存在则返回 undefined。
     */
    public getRoomCurrentFrame(roomId: string): number | undefined {
        return this.roomFrames[roomId];
    }

    /**
     * 启动指定房间的帧同步。
     * @param roomId - 房间 ID。
     */
    public startRoomFrameSync(roomId: string): void {
        // 清除房间之前的帧同步定时器
        this.stopRoomFrameSync(roomId);

        // 设置房间的新的帧同步定时器
        this.roomFrames[roomId] = 0;
        this.roomActions[roomId] = {};
        this.roomTimers[roomId] = setInterval(() => {
            this.sendRoomFrameSync(roomId);
            this.roomFrames[roomId]++;
        }, this.frameInterval);
    }


    /**
     * 发送指定房间的帧同步消息。
     * @param roomId - 房间 ID。
     */
    public sendRoomFrameSync(roomId: string): void {
        const actions = this.roomActions[roomId][this.roomFrames[roomId]];
        const frameSyncMessage: Message = {
            type: 'frameSync',
            payload: {
                frame: this.roomFrames[roomId],
                actions: actions,
            },
        };

        GServices.I().RoomManager.broadcastToRoom(roomId, frameSyncMessage);
        this.roomFrames[roomId]++;
        delete this.roomActions[roomId][this.roomFrames[roomId] - 1]; // 删除已经发送过的操作
    }

    /**
     * 停止指定房间的帧同步。
     * @param roomId - 房间 ID。
     */
    public stopRoomFrameSync(roomId: string): void {
        if (this.roomTimers[roomId]) {
            clearInterval(this.roomTimers[roomId] as NodeJS.Timeout);
            delete this.roomFrames[roomId];
            delete this.roomTimers[roomId];
            delete this.roomActions[roomId];
        }
    }

    /**
     * 收集客户端的操作。
     * @param roomId - 房间 ID。
     * @param frame - 操作所属的帧数。
     * @param action - 客户端操作。
     */
    public collectClientAction(roomId: string, frame: number, action: any): void {
        if (!this.roomActions[roomId]) {
            this.roomActions[roomId] = {};
        }
        if (!this.roomActions[roomId][frame]) {
            this.roomActions[roomId][frame] = [];
        }
        this.roomActions[roomId][frame].push(action);
    }
}