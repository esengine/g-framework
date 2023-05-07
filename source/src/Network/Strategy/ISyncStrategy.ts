module gs {
    export interface ISyncStrategy {
        sendState(state: any): void;
        receiveState(state: any): any;
        handleStateUpdate(deltaTime: number): void;
    }
}