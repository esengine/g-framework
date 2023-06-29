import WebSocket from "ws";

/**
 * 表示 WebSocket 帧的信息。
 */
export interface FrameInfo {
    /**
     * 帧的类型（例如，“text”或“binary”）。
     */
    type: string;

    /**
     * 帧的长度。
     */
    length: number;

    /**
     * 如果这是消息的最后一帧，则为 true。
     */
    isFinalFrame: boolean;
}

/**
 * 表示与 WebSocket 连接相关的信息。
 */
export interface Connection {
    /**
     * 连接的唯一标识符。
     */
    id: string;

    /**
     * WebSocket 实例。
     */
    socket: WebSocket;

    /**
     * 重新连接的尝试次数。
     */
    reconnectAttempts: number;

    /**
     * 指示连接是否已通过身份验证。
     */
    isAuthenticated: boolean;

    /**
     * 连接的当前状态。
     */
    state: string;

    /**
     * 上次更新连接信息的时间。
     * 用于解决状态冲突。
     */
    lastUpdated: Date;

    /**
     * 验证码，可选。
     * 在某些情况下用于验证连接的身份。
     */
    verificationCode?: string;

    /**
     * 用于身份验证的令牌，可选。
     */
    token?: string;

    /**
     * 连接的总发送消息数。
     */
    sentMessagesCount: number;

    /**
     * 连接的总接收消息数。
     */
    receivedMessagesCount: number;

    /**
     * 最后接收或发送的 WebSocket 帧的信息。
     */
    lastFrame?: FrameInfo;

    /**
     * 连接所在的房间 ID。
     */
    roomId?: string;

    sessionId: string;
}
