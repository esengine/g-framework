declare class MoveSystem extends gs.System {
    entityFilter(entity: gs.Entity): boolean;
    update(entities: gs.Entity[]): void;
}
declare class Player extends gs.Entity {
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
declare const entity: gs.Entity;
declare const playerEntity: gs.Entity;
declare const moveSystem: MoveSystem;
declare let networkAdapter: gs.GNetworkAdapter;
declare let lastTimestamp: number;
declare let timestamp: number;
declare function update(): void;
