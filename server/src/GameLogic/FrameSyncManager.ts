import {Message} from "../Communication/Message";
import {GServices} from "../Service/GServices";

/**
 * 帧同步管理器类，用于管理游戏帧同步。
 */
export class FrameSyncManager {
    private roomFrames: Record<string, number> = {}; // 每个房间的当前帧数
    private frameInterval: number;
    private roomTimers: Record<string, NodeJS.Timeout | null> = {}; // 每个房间的帧同步定时器
    private roomActions: Record<string, Record<number, any[]>> = {}; // 每个房间每帧的客户端操作
    private pendingActions: Record<string, Record<number, any[]>> = {};  // 等待同步的客户端操作

    constructor(frameInterval: number = 1000 / 30) {
        this.frameInterval = frameInterval;
    }

    /**
     * 获取指定房间的当前帧数。
     * @param roomId - 房间 ID。
     * @returns 当前帧数，如果房间不存在则返回 undefined。
     */
    public getRoomCurrentFrame(roomId: string): number | undefined {
        this.checkRoomExists(roomId);
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
        }, this.frameInterval);
    }


    /**
     * 发送指定房间的帧同步消息。
     * @param roomId - 房间 ID。
     */
    public sendRoomFrameSync(roomId: string): void {
        this.checkRoomExists(roomId);
        this.roomActions[roomId][this.roomFrames[roomId]] = this.pendingActions[roomId][this.roomFrames[roomId]];
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
        delete this.roomActions[roomId][this.roomFrames[roomId]];
        delete this.pendingActions[roomId][this.roomFrames[roomId]];
        this.roomFrames[roomId]++;
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
            delete this.pendingActions[roomId];
        }
    }

    /**
     * 收集客户端的操作。
     * @param roomId - 房间 ID。
     * @param frame - 操作所属的帧数。
     * @param action - 客户端操作。
     */
    public collectClientAction(roomId: string, frame: number, action: any): void {
        this.checkRoomExists(roomId);
        if (!this.pendingActions[roomId]) {
            this.pendingActions[roomId] = {};
        }
        if (!this.pendingActions[roomId][frame]) {
            this.pendingActions[roomId][frame] = [];
        }
        this.pendingActions[roomId][frame].push(action);
    }

    private checkRoomExists(roomId: string): void {
        if (this.roomFrames[roomId] === undefined) {
            throw new Error(`[g-server]: 房间ID ${roomId} 不存在.`);
        }
    }
}