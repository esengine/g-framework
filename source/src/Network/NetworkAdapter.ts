module gs {
    export interface NetworkAdapter {
        send(message: Message): void;

        /**
         * 将输入数据发送到服务器
         * @param frameNumber 客户端帧编号
         * @param inputData 输入数据
         */
        sendInput(frameNumber: number, inputData: any): void;

        /**
         * 从服务器接收状态更新
         * @param callback 处理服务器状态更新的回调函数
         */
        onServerUpdate(callback: (serverState: any) => void): void;
    }
}
