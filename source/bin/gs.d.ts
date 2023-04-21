declare module gs {
    abstract class Component {
        serialize(): any;
        deserialize(data: any): void;
    }
}
declare module gs {
    class Entity {
        id: number;
        private components;
        constructor(id: number);
        /**
         * 添加组件
         * @param component
         * @returns
         */
        addComponent(component: Component): this;
        /**
         * 移除组件
         * @param componentType
         * @returns
         */
        removeComponent(componentType: Function): this;
        /**
         * 获取组件
         * @param componentType
         * @returns
         */
        getComponent<T extends Component>(componentType: new () => T): T | null;
        /**
         * 是否有组件
         * @param componentType
         * @returns
         */
        hasComponent<T extends Component>(componentType: new () => T): boolean;
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
    }
}
declare module gs {
    class EntityIdAllocator {
        private nextId;
        constructor();
        generateId(): number;
    }
}
declare module gs {
    class EntityManager {
        private entities;
        private idAllocator;
        constructor();
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
    }
}
declare module gs {
    /**
     * 系统基类
     */
    abstract class System {
        protected entityManager: EntityManager;
        /**
         * 系统优先级，优先级越高，越先执行
         */
        readonly priority: number;
        readonly workerScript?: string;
        constructor(entityManager: EntityManager, priority: number, workerScript?: string);
        /**
         * 筛选实体
         * @param entity
         */
        abstract entityFilter(entity: Entity): boolean;
        /**
         * 更新系统
         * @param deltaTime
         * @param entities
         */
        abstract update(deltaTime: number, entities: Entity[]): void;
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
         * 更新系统
         * @param deltaTime
         */
        update(deltaTime: number): void;
    }
}
