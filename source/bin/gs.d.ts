declare module gs {
    /**
     * 组件
     */
    abstract class Component {
        serialize(): any;
        deserialize(data: any): void;
        /**
         * 注册组件
         * @param componentClass
         * @param manager
         */
        static registerComponent<T extends Component>(componentClass: new (...args: any[]) => T, manager: ComponentManager<T>): void;
    }
}
declare module gs {
    class Entity {
        private id;
        private componentManagers;
        private tags;
        private eventEmitter;
        constructor(id: number, componentManagers: Map<new (entityId: number) => Component, ComponentManager<any>>);
        getId(): number;
        /**
         * 添加组件
         * @param componentType
         * @returns
         */
        addComponent<T extends Component>(componentType: new (entityId: number) => T): T;
        /**
         * 获取组件
         * @param componentType
         * @returns
         */
        getComponent<T extends Component>(componentType: new (entityId: number) => T): T | null;
        /**
         * 移除组件
         * @param componentType
         * @returns
         */
        removeComponent<T extends Component>(componentType: new (entityId: number) => T): void;
        /**
         * 是否有组件
         * @param componentType
         * @returns
         */
        hasComponent<T extends Component>(componentType: new (entityId: number) => T): boolean;
        /**
         * 添加标签
         * @param tag
         */
        addTag(tag: string): void;
        /**
         * 移除标签
         * @param tag
         */
        removeTag(tag: string): void;
        /**
         * 检查是否具有指定标签
         * @param tag
         * @returns
         */
        hasTag(tag: string): boolean;
        /**
         * 序列化
         * @returns
         */
        serialize(): any;
        /**
         * 反序列化
         * @param data
         */
        deserialize(data: any): void;
        /**
         * 实体创建时的逻辑
         */
        onCreate(): void;
        /**
         * 实体销毁时的逻辑
         */
        onDestroy(): void;
        on(eventType: string, listener: EventListener): void;
        once(eventType: string, callback: (event: Event) => void): void;
        off(eventType: string, listener: EventListener): void;
        emit(type: string, data: any): void;
    }
}
declare module gs {
    /**
     * 系统基类
     */
    abstract class System {
        protected entityManager: EntityManager;
        protected paused: boolean;
        pause(): void;
        resume(): void;
        isPaused(): boolean;
        protected enabled: boolean;
        enable(): void;
        disable(): void;
        isEnabled(): boolean;
        /**
         * 系统优先级，优先级越高，越先执行
         */
        readonly priority: number;
        /**
         * 系统所在的worker脚本
         */
        readonly workerScript?: string;
        constructor(entityManager: EntityManager, priority: number, workerScript?: string);
        /**
         * 筛选实体
         * @param entity
         */
        abstract entityFilter(entity: Entity): boolean;
        /**
         * 更新系统
         * @param entities
         */
        abstract update(entities: Entity[]): void;
        /**
         * 系统注册时的逻辑
         */
        onRegister(): void;
        /**
         * 系统注销时的逻辑
         */
        onUnregister(): void;
    }
}
declare module gs {
    class Event {
        type: string;
        data: any;
        constructor(type: string, data?: any);
    }
}
declare module gs {
    class EventEmitter {
        private listeners;
        private eventPool;
        constructor();
        /**
         * 用于订阅特定事件类型的侦听器。当事件类型不存在时，将创建一个新的侦听器数组
         * @param eventType
         * @param listener
         */
        on(eventType: string, listener: EventListener): void;
        /**
         * 用于订阅特定事件类型的侦听器。当事件类型不存在时，将创建一个新的侦听器数组。该方法只会在回调函数被执行后，移除监听器
         * @param eventType
         * @param callback
         */
        once(eventType: string, callback: (event: Event) => void): void;
        /**
         * 用于取消订阅特定事件类型的侦听器。如果找到侦听器，则将其从数组中移除
         * @param eventType
         * @param listener
         */
        off(eventType: string, listener: EventListener): void;
        /**
         * 用于触发事件。该方法将遍历所有订阅给定事件类型的侦听器，并调用它们
         * @param event
         */
        emit(type: string, data: any): void;
    }
}
declare module gs {
    interface EventListener {
        (event: Event): void;
    }
}
declare module gs {
    const GlobalEventEmitter: EventEmitter;
}
declare module gs {
    abstract class InputAdapter {
        protected inputManager: InputManager;
        constructor(inputManager: InputManager);
        /**
         * 需要实现此方法以适应使用的游戏引擎
         * @param event
         */
        abstract handleInputEvent(event: any): void;
    }
}
declare module gs {
    /**
     * 输入缓冲区
     */
    class InputBuffer {
        private buffer;
        constructor();
        addEvent(event: InputEvent): void;
        getEvents(): InputEvent[];
        clear(): void;
    }
}
declare module gs {
    interface InputEvent {
        type: InputType;
        data: any;
    }
}
declare module gs {
    class InputManager {
        private inputBuffer;
        private adapter?;
        constructor();
        setAdapter(adapter: InputAdapter): void;
        getInputBuffer(): InputBuffer;
    }
}
declare module gs {
    enum InputType {
        KEY_DOWN = 0,
        KEY_UP = 1,
        MOUSE_DOWN = 2,
        MOUSE_UP = 3,
        MOUSE_MOVE = 4
    }
}
declare module gs {
    /**
     * 组件管理器
     */
    class ComponentManager<T extends Component> {
        private data;
        private entityToDataIndex;
        private freeDataIndices;
        componentType: new (entityId: number) => T;
        constructor(componentType: new (entityId: number) => T);
        create(entityId: number): T;
        /**
         * 获取组件数据
         * @param entityId 实体ID
         * @returns 组件数据
         */
        get(entityId: number): T | null;
        /**
         *
         * @param entityId
         * @returns
         */
        has(entityId: number): boolean;
        /**
         *
         * @param entityId
         * @returns
         */
        remove(entityId: number): void;
        /**
         * 分配数据索引
         * @returns
         */
        allocateDataIndex(): number;
    }
}
declare module gs {
    class EntityManager {
        private entities;
        private entityIdAllocator;
        private componentManagers;
        private inputManager;
        private networkManager;
        constructor(componentManagers: Array<ComponentManager<Component>>);
        getInputManager(): InputManager;
        getNetworkManager(): NetworkManager;
        /**
         * 创建实体
         * @returns
         */
        createEntity(): Entity;
        /**
         * 删除实体
         * @param entityId
         */
        deleteEntity(entityId: number): void;
        /**
         * 获取实体
         * @param entityId 实体id
         * @returns 实体
         */
        getEntity(entityId: number): Entity | null;
        /**
         * 获取具有特定组件的所有实体
         * @param componentClass 要检查的组件类
         * @returns 具有指定组件的实体数组
         */
        getEntitiesWithComponent<T extends Component>(componentClass: new (...args: any[]) => T): Entity[];
        /**
         * 获取所有实体
         * @returns
         */
        getEntities(): Entity[];
        /**
        * 获取具有特定标签的所有实体
        * @param tag 要检查的标签
        * @returns 具有指定标签的实体数组
        */
        getEntitiesWithTag(tag: string): Entity[];
    }
}
declare module gs {
    /**
     * 系统管理器
     */
    class SystemManager {
        private systems;
        private entityManager;
        private systemWorkers;
        constructor(entityManager: EntityManager);
        /**
         * 注册系统
         * @param system 系统
         */
        registerSystem(system: System): void;
        /**
         * 注销系统
         * @param system
         */
        unregisterSystem(system: System): void;
        /**
         * 更新系统
         * @param deltaTime
         */
        update(deltaTime: number): void;
    }
}
declare module gs {
    /**
     * 时间管理器
     */
    class TimeManager {
        private static instance;
        /**
         * 上一帧到这一帧的时间间隔
         */
        deltaTime: number;
        /**
         * 时间缩放
         */
        timeScale: number;
        /**
         * 游戏运行的总时间
         */
        totalTime: number;
        private constructor();
        static getInstance(): TimeManager;
        update(deltaTime: number): void;
    }
}
declare module gs {
    interface NetworkAdapter {
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
declare module gs {
    class NetworkManager {
        private networkAdapter;
        /**
         * 设置网络适配器
         * @param adapter 用户实现的NetworkAdapter接口
         */
        setNetworkAdapter(adapter: NetworkAdapter): void;
        /**
         * 获取网络适配器
         * @returns
         */
        getNetworkAdpater(): NetworkAdapter | null;
    }
}
declare module gs {
    class ObjectPool<T> {
        private createFn;
        private resetFn;
        private pool;
        constructor(createFn: () => T, resetFn: (obj: T) => void);
        acquire(): T;
        release(obj: T): void;
    }
}
declare module gs {
    class EventPool extends ObjectPool<Event> {
        constructor();
    }
}
declare module gs {
    interface State {
        enter?(): void;
        exit?(): void;
        update?(): void;
    }
    class StateMachine {
        private currentState;
        private states;
        constructor();
        addState(name: string, state: State): void;
        changeState(name: string): void;
        update(): void;
    }
}
declare module gs {
    class StateMachineComponent extends Component {
        stateMachine: StateMachine;
        constructor();
    }
}
declare module gs {
    class StateMachineSystem extends System {
        constructor(entityManager: EntityManager);
        entityFilter(entity: Entity): boolean;
        update(entities: Entity[]): void;
    }
}
declare module gs {
    class EntityIdAllocator {
        private nextId;
        constructor();
        allocate(): number;
    }
}
declare module gs {
    class Random {
        private seed;
        constructor(seed: number);
        /**
         * 生成 [0, 1) 范围内的随机浮点数
         * @returns
         */
        next(): number;
        /**
         * 生成 [min, max) 范围内的随机整数
         * @param min
         * @param max
         * @returns
         */
        nextInt(min: number, max: number): number;
        /**
         * 生成 [min, max) 范围内的随机浮点数
         * @param min
         * @param max
         * @returns
         */
        nextFloat(min: number, max: number): number;
        /**
         * 从数组中随机选择一个元素
         * @param array
         * @returns
         */
        choose<T>(array: T[]): T;
    }
}
