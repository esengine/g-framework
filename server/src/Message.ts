export interface Message {
    /**
     * 消息类型
     */
    type: string;

    /**
     * 消息的内容
     */
    payload: any;

    /**
     * 消息的子类型，可选
     */
    subtype?: string;
}