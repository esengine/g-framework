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
    const GlobalEventEmitter: EventEmitter;
}
declare module gs {
    /**
     * 组件
     */
    abstract class Component {
        private _entityId;
        private _version;
        private _entityManager;
        setEntityId(entityId: number, entityManager: EntityManager): void;
        getEntityId(): number;
        readonly entityId: number;
        readonly entity: Entity;
        readonly version: number;
        /**
         * 标记组件已更新的方法
         * 通过增加 _version 的值来表示组件已更新
         */
        markUpdated(): void;
        /**
         * 重置组件的状态并进行必要的初始化
         * @param entityId
         * @param entityManager
         */
        reinitialize(entityId: number, entityManager: EntityManager): void;
        /**
         * 当组件初始化的时候调用
         * @param args
         */
        onInitialize(...args: any[]): void;
        /**
         * 当组件被添加到实体上时执行
         */
        onAdded(): void;
        /**
         * 当组件从实体上被移除时执行
         */
        onRemoved(): void;
        serialize(): any;
        deserialize(data: any): void;
        /**
         * 判断是否需要序列化的方法
         * @returns 默认返回 true，表示需要序列化
         */
        shouldSerialize(): boolean;
        /**
         * 清除数据方法，用于组件池在重用时
         */
        reset(): void;
    }
}
declare module gs {
    /**
     * 实体类，用于管理实体的组件和标签。
     */
    class Entity {
        private id;
        private componentManagers;
        private tags;
        private eventEmitter;
        private entityManager;
        componentBits: Bits;
        private componentCache;
        constructor(id: number, entityManager: EntityManager, componentManagers: Map<new (entityId: number) => Component, ComponentManager<any>>);
        getId(): number;
        /**
         * 添加组件
         * @param componentType
         * @returns
         */
        addComponent<T extends Component>(componentType: new (entityId: number) => T, ...args: any[]): T;
        /**
         * 获取组件
         * @param componentType
         * @returns
         */
        getComponent<T extends Component>(componentType: new (entityId: number) => T): T | null;
        /**
         * 获取所有组件
         * @returns
         */
        getAllComponents(): Component[];
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
         * 清除组件缓存
         */
        clearComponentCache(): void;
        /**
         * 添加标签
         * @param tag
         */
        addTag(tag: string): void;
        /**
         * 获取标签
         * @returns
         */
        getTags(): Set<string>;
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
         * 增量序列化
         * @param lastSnapshotVersion 上一次快照版本
         * @returns 返回增量序列化后的实体对象，如果没有更新的组件，则返回null
         */
        serializeIncremental(lastSnapshotVersion: number): any | null;
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
    interface Interpolatable {
        savePreviousState(): void;
        applyInterpolation(factor: number): void;
    }
}
declare module gs {
    /**
     * ECS 框架中的系统接口，定义了系统需要实现的方法。
     */
    interface ISystem {
        update(entities: Entity[]): void;
        filterEntities(entities: Entity[]): Entity[];
        onRegister(): void;
        onUnregister(): void;
    }
    /**
     * 系统基类
     */
    abstract class System implements ISystem {
        protected entityManager: EntityManager;
        protected matcher: Matcher;
        /**
         * 系统优先级，优先级越高，越先执行
         */
        readonly priority: number;
        /**
         * 系统所在的worker脚本
         */
        readonly workerScript?: string;
        constructor(entityManager: EntityManager, priority: number, matcher?: Matcher, workerScript?: string);
        protected _paused: boolean;
        protected _enabled: boolean;
        paused: boolean;
        enabled: boolean;
        isPaused(): boolean;
        isEnabled(): boolean;
        /**
         * 更新系统
         * @param entities
         */
        abstract update(entities: Entity[]): void;
        /**
         * 筛选实体
         * @param entity
         */
        entityFilter(entity: Entity): boolean;
        filterEntities(entities: Entity[]): Entity[];
        handleComponentChange(entity: Entity, added: boolean): void;
        protected onComponentAdded(entity: Entity): void;
        protected onComponentRemoved(entity: Entity): void;
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
    interface EventListener {
        (event: Event): void;
    }
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
        protected sendInputToManager(inputEvent: InputEvent): void;
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
        hasEvents(): boolean;
        getEvents(): InputEvent[];
        consumeEvent(): InputEvent | null;
        clear(): void;
    }
}
declare module gs {
    interface InputEvent {
        type: string;
        data: any;
    }
}
declare module gs {
    class InputManager {
        private entityManager;
        private adapter?;
        private inputBuffer;
        /** 输入历史记录队列 */
        private inputHistory;
        private historySizeThreshold;
        private eventListeners;
        constructor(entityManager: EntityManager);
        setHistorySizeThreshold(threshold: number): void;
        addEventListener(callback: (event: InputEvent) => void): void;
        setAdapter(adapter: InputAdapter): void;
        sendInput(event: InputEvent): void;
        private handleInput;
        /**
         * 获取当前帧编号的方法
         * @returns
         */
        private getCurrentFrameNumber;
        getInputBuffer(): InputBuffer;
        getInputHistory(): Array<{
            frameNumber: number;
            input: InputEvent;
        }>;
    }
}
declare module gs {
    type ComponentConstructor<T extends Component> = new (...args: any[]) => T;
    /**
     * 组件管理器
     */
    class ComponentManager<T extends Component> {
        private components;
        private componentType;
        private componentPool;
        /**
         * ComponentManager 构造函数
         * @param componentType - 用于创建和管理的组件类型。
         *
         * 用法示例：
         * const positionManager = new ComponentManager(PositionComponent);
         */
        constructor(componentType: ComponentConstructor<T>);
        create(entityId: number, entityManager: EntityManager): T;
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
        * 预先创建指定数量的组件实例，并将它们放入对象池
        * @param count 要预先创建的组件数量
        */
        private preallocate;
    }
}
declare module gs {
    class ComponentTypeManager {
        private static componentTypes;
        private static nextIndex;
        static getIndexFor(componentType: new (...args: any[]) => Component): number;
    }
}
declare module gs {
    interface StateSnapshot {
        entities: any[];
    }
    class EntityManager {
        private entities;
        private entityIdAllocator;
        private componentManagers;
        /** 当前帧编号属性 */
        private currentFrameNumber;
        private inputManager;
        private networkManager;
        private queryCache;
        private tagCache;
        systemManager?: SystemManager;
        constructor(componentClasses?: Array<ComponentConstructor<Component>>, systemManager?: SystemManager);
        setSystemManager(systemManager: SystemManager): void;
        /**
         * 添加组件管理器
         * @param componentClass 要添加的组件类
         */
        addComponentManager<T extends Component>(componentClass: ComponentConstructor<T>): void;
        updateFrameNumber(): void;
        getCurrentFrameNumber(): number;
        getInputManager(): InputManager;
        getNetworkManager(): NetworkManager;
        /**
         * 创建实体
         * @returns customEntityClass 可选的自定义实体类
         */
        createEntity(customEntityClass?: new (entityId: number, entityManager: EntityManager, componentManagers: Map<ComponentConstructor<any>, ComponentManager<Component>>) => Entity): Entity;
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
        getEntitiesWithComponent<T extends Component>(componentClass: ComponentConstructor<T>): Entity[];
        /**
         * 查找具有指定组件的实体
         * @param componentClasses
         * @returns
         */
        getEntitiesWithComponents<T extends Component>(componentClasses: ComponentConstructor<T>[]): Entity[];
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
        /**
         * 根据提供的组件数组查询实体
         * @param components 要查询的组件数组
         * @returns 符合查询条件的实体数组
         */
        queryComponents(components: ComponentConstructor<Component>[]): Entity[];
        private performQuery;
        /**
         * 创建当前游戏状态的快照
         * @returns
         */
        createStateSnapshot(): StateSnapshot;
        /**
         * 创建增量状态快照
         * @param lastSnapshotVersion 上一个快照的版本号
         * @returns 返回一个包含实体增量数据的快照对象
         */
        createIncrementalStateSnapshot(lastSnapshotVersion: number): any;
        /**
         * 使用给定的状态快照更新游戏状态
         * @param stateSnapshot
         */
        updateStateFromSnapshot(stateSnapshot: any): void;
        /**
         * 应用插值
         * @param factor
         */
        applyInterpolation(factor: number): void;
        /**
         * 清除指定组件或标签的缓存
         * @param componentClass
         * @param tag
         */
        invalidateCache(componentClass?: ComponentConstructor<Component>, tag?: string): void;
    }
}
declare module gs {
    /**
     * ECS 框架中的系统管理器类，负责管理系统的注册、注销以及更新。
     */
    class SystemManager {
        private systems;
        private entityManager;
        private systemWorkers;
        private entityCache;
        private dependencies;
        private workerWarningDisplayed;
        constructor(entityManager: EntityManager);
        /**
         * 注册系统
         * @param system 系统
         * @param dependsOn 可选的依赖系统数组
         */
        registerSystem(system: System, dependsOn?: System[]): void;
        /**
         * 注销系统
         * @param system
         */
        unregisterSystem(system: System): void;
        /**
         * 通知所有系统组件已添加
         * @param entity
         */
        notifyComponentAdded(entity: Entity): void;
        /**
         * 通知所有系统组件已删除
         * @param entity
         */
        notifyComponentRemoved(entity: Entity): void;
        /**
         * 使特定系统的实体缓存无效。
         * @param system 要使其实体缓存无效的系统
         */
        invalidateEntityCacheForSystem(system: System): void;
        /**
         * 更新系统
         */
        update(): void;
        /**
         * 按优先级和依赖关系对系统进行排序
         */
        private sortSystemsByPriorityAndDependencies;
        /**
         * 确定系统 a 是否依赖于系统 b
         * @param a 系统 a
         * @param b 系统 b
         * @returns 如果系统 a 依赖于系统 b，则为 true，否则为 false
         */
        private dependsOn;
        dispose(): void;
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
    interface ISyncStrategy {
        sendState(state: any): void;
        receiveState(state: any): any;
        handleStateUpdate(deltaTime: number): void;
    }
}
declare module gs {
    /**
     * 快照插值策略
     */
    class SnapshotInterpolationStrategy implements ISyncStrategy {
        private snapshotQueue;
        onInterpolation: (prevSnapshot: any, nextSnapshot: any, progress: number) => void;
        /**
         * 发送游戏状态
         * @param state
         */
        sendState(state: any): void;
        /**
         * 在收到新的快照时将其添加到快照队列中
         * @param state
         */
        receiveState(state: any): void;
        handleStateUpdate(state: any): void;
        private interpolateAndUpdateGameState;
    }
}
declare module gs {
    /**
     * 状态压缩策略
     */
    class StateCompressionStrategy implements ISyncStrategy {
        onCompressState: (state: any) => any;
        onDecompressState: (compressedState: any) => any;
        onSendState: (compressedState: any) => void;
        onReceiveState: (decompressedState: any) => void;
        handleStateUpdate: (state: any) => void;
        /**
         * 发送游戏状态时，将游戏状态压缩
         * @param state
         */
        sendState(state: any): void;
        /**
         * 接收服务器或客户端发送的压缩后的游戏状态，并解压缩更新
         */
        receiveState(compressedState: any): void;
    }
}
declare module gs {
    /**
     * 同步策略管理器类
     */
    class SyncStrategyManager {
        private strategy;
        /**
         * 构造函数
         * @param strategy - 同步策略实现
         */
        constructor(strategy: ISyncStrategy);
        /**
         * 发送状态方法
         * @param state - 需要发送的状态对象
         */
        sendState(state: any): void;
        /**
         * 接收状态方法
         * @param state - 接收到的状态对象
         */
        receiveState(state: any): void;
        /**
         * 处理状态更新方法
         * @param deltaTime - 时间增量
         */
        handleStateUpdate(deltaTime: number): void;
        /**
         * 设置策略方法
         * @param strategy - 新的同步策略实现
         */
        setStrategy(strategy: ISyncStrategy): void;
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
        reset(): void;
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
    class Bits {
        private data;
        constructor(size?: number);
        set(index: number): void;
        clear(index: number): void;
        get(index: number): boolean;
        resize(newSize: number): void;
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
    /**
     * 定义一个实体匹配器类。
     */
    class Matcher {
        protected allSet: (new (...args: any[]) => Component)[];
        protected exclusionSet: (new (...args: any[]) => Component)[];
        protected oneSet: (new (...args: any[]) => Component)[];
        static empty(): Matcher;
        getAllSet(): (new (...args: any[]) => Component)[];
        getExclusionSet(): (new (...args: any[]) => Component)[];
        getOneSet(): (new (...args: any[]) => Component)[];
        isInterestedEntity(e: Entity): boolean;
        isInterested(components: Bits): boolean;
        private checkAllSet;
        private checkExclusionSet;
        private checkOneSet;
        /**
        * 添加所有包含的组件类型。
        * @param types 所有包含的组件类型列表
        */
        all(...types: (new (...args: any[]) => Component)[]): Matcher;
        /**
         * 添加排除包含的组件类型。
         * @param types 排除包含的组件类型列表
         */
        exclude(...types: (new (...args: any[]) => Component)[]): Matcher;
        /**
         * 添加至少包含其中之一的组件类型。
         * @param types 至少包含其中之一的组件类型列表
         */
        one(...types: (new (...args: any[]) => Component)[]): Matcher;
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
declare module gs {
    /**
     * SparseSet数据结构
     */
    class SparseSet<T> {
        private sparse;
        private dense;
        private items;
        private count;
        constructor();
        add(index: number, item: T): void;
        remove(index: number): void;
        has(index: number): boolean;
        get(index: number): T;
        getCount(): number;
    }
}
