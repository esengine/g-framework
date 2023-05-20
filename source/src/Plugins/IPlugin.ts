module gs {
    export interface IPlugin {
        name: string;
        onInit(core: Core): void;
        onUpdate(deltaTime: number): void;
    }
}