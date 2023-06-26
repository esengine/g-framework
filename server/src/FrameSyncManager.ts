import {Message} from "./Message";
import {GServices} from "./GServices";

/**
 * 帧同步管理器类，用于管理游戏帧同步。
 */
export class FrameSyncManager {
    private currentFrame: number = 0; // 当前帧数
    private frameInterval: number = 1000 / 60; // 每帧时间间隔（默认为60帧每秒）
    private frameSyncTimer: NodeJS.Timeout | null = null; // 帧同步定时器
    private frameActions: Record<number, any[]> = {}; // 每帧的客户端操作

    public get CurrentFrame() {
        return this.currentFrame;
    }

    /**
     * 启动帧同步
     */
    public startFrameSync(): void {
        // 清除之前的帧同步定时器
        this.stopFrameSync();

        // 设置新的帧同步定时器
        this.frameSyncTimer = setInterval(() => {
            this.sendFrameSync();
            this.currentFrame++;
        }, this.frameInterval);
    }

    /**
     * 发送帧同步消息
     */
    private sendFrameSync(): void {
        const actions = this.frameActions[this.currentFrame];
        const frameSyncMessage: Message = {
            type: 'frameSync',
            payload: {
                frame: this.currentFrame,
                actions: actions,
            },
        };

        GServices.I().ConnectionManager.broadcast(frameSyncMessage);
        this.currentFrame++;
        delete this.frameActions[this.currentFrame - 1]; // 删除已经发送过的操作
    }

    /**
     * 停止帧同步
     */
    public stopFrameSync(): void {
        if (this.frameSyncTimer) {
            clearInterval(this.frameSyncTimer);
            this.frameSyncTimer = null;
        }
    }

    /**
     * 收集客户端的操作。
     * @param frame - 操作所属的帧数。
     * @param action - 客户端操作。
     */
    public collectClientAction(frame: number, action: any): void {
        if (!this.frameActions[frame]) {
            this.frameActions[frame] = [];
        }
        this.frameActions[frame].push(action);
    }
}