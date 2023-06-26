export interface Message {
    /**
     * 消息类型
     */
    type: string;
    /**
     * 消息的内容
     */
    payload: any;
    subtype?: string;
}