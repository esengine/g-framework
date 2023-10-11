declare class ColorComponent extends gs.Component {
    color: string;
    onInitialize(): void;
    private getRandomColor;
}
declare class DrawSystem extends gs.System {
    entityFilter(entity: gs.Entity): boolean;
    update(entities: gs.Entity[]): void;
}
declare class InputSystem extends gs.System {
    entityFilter(entity: gs.Entity): boolean;
    update(entities: gs.Entity[]): void;
    private applyInputToEntity;
}
declare class MoveSystem extends gs.System {
    entityFilter(entity: gs.Entity): boolean;
    update(entities: gs.Entity[]): void;
}
declare class MyInputAdapter extends gs.InputAdapter {
    private networkAdapter;
    constructor(inputManager: gs.InputManager, networkAdapter: gs.GNetworkAdapter);
    handleInputEvent(inputEvent: gs.InputEvent[]): void;
    sendInputEvent(event: any, playerId: string): void;
    private convertEngineEventToInputEvent;
}
declare class Player extends gs.Entity {
    playerId: string;
    onCreate(): void;
    onDestroy(): void;
}
declare class PositionComponent extends gs.Component {
    x: number;
    y: number;
    reset(): void;
}
declare class VelocityComponent extends gs.Component {
    x: number;
    y: number;
    reset(): void;
}
declare const core: gs.Core;
declare const moveSystem: MoveSystem;
declare const inputSystem: InputSystem;
declare const drawSystem: DrawSystem;
declare const userName = "test";
declare const password = "test";
declare let networkAdapter: gs.GNetworkAdapter;
declare let playerId: any;
declare let roomId: any;
declare let playerNet: {};
declare let lastSnapshotVersion: number;
declare function createPlayer(id: string): void;
declare function deletePlayer(id: string): void;
declare function deleteAllPlayer(): void;
declare const syncStrategy: gs.SnapshotInterpolationStrategy;
declare const strategyManager: gs.SyncStrategyManager;
declare let lastTime: number;
declare function update(timestamp: any): void;
