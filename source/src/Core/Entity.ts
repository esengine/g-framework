module gs {
    /**
     * 实体类，用于管理实体的组件和标签。
     */
    export class Entity {
        private id: number;
        private componentManagers: Map<Function, ComponentManager<any>>;
        private tags: Set<string>;
        private eventEmitter: EventEmitter;
        private entityManager: EntityManager;
        public componentBits: Bits;

        // 缓存获取的组件
        private componentCache: Map<Function, Component> = new Map();

        constructor(id: number, entityManager: EntityManager, componentManagers: Map<new (entityId: number) => Component, ComponentManager<any>>) {
            this.id = id;
            this.componentManagers = componentManagers;
            this.tags = new Set();
            this.eventEmitter = new EventEmitter();
            this.entityManager = entityManager;
            this.componentBits = new Bits();
        }

        public getId(): number {
            return this.id;
        }

        /**
         * 添加组件
         * @param componentType 
         * @returns 
         */
        public addComponent<T extends Component>(componentType: new (entityId: number) => T, ...args: any[]): T {
            const manager = this.componentManagers.get(componentType);
            if (!manager) {
                throw new Error(`组件类型为 ${componentType.name} 的组件管理器未找到.`);
            }

            const component = manager.create(this.id, this.entityManager) as T;
            component.onInitialize(...args);

            const componentIndex = ComponentTypeManager.getIndexFor(componentType);
            this.componentBits.set(componentIndex);

            if (this.entityManager.systemManager) {
                this.entityManager.systemManager.notifyComponentAdded(this);
            }

            return component;
        }

        /**
         * 获取组件
         * @param componentType 
         * @returns 
         */
        public getComponent<T extends Component>(componentType: new (entityId: number) => T): T | null {
            // 从缓存中获取组件，如果存在，则直接返回
            const cachedComponent = this.componentCache.get(componentType);
            if (cachedComponent) {
                return cachedComponent as T;
            }

            // 如果缓存中不存在，则从组件管理器中获取
            const manager = this.componentManagers.get(componentType);
            if (!manager) {
                return null;
            }

            const component = manager.get(this.id);
            if (component) {
                this.componentCache.set(componentType, component);
            }

            return component as T;
        }

        /**
         * 获取所有组件
         * @returns 
         */
        public getAllComponents(): Component[] {
            return Array.from(this.componentManagers.values())
                .map(manager => manager.get(this.id))
                .filter(component => component !== null);
        }

        /**
         * 移除组件
         * @param componentType 
         * @returns 
         */
        public removeComponent<T extends Component>(componentType: new (entityId: number) => T): void {
            const manager = this.componentManagers.get(componentType);
            if (!manager) {
                return;
            }

            const component = this.getComponent(componentType);
            if (component) {
                if (this.entityManager.systemManager) {
                    this.entityManager.systemManager.notifyComponentRemoved(this);
                }
                manager.remove(this.id);
            }

            const componentIndex = ComponentTypeManager.getIndexFor(componentType);
            this.componentBits.clear(componentIndex);

            // 移除组件缓存
            this.componentCache.delete(componentType);
        }

        /**
         * 是否有组件
         * @param componentType 
         * @returns 
         */
        public hasComponent<T extends Component>(componentType: new (entityId: number) => T): boolean {
            const manager = this.componentManagers.get(componentType);
            return manager ? manager.has(this.id) : false;
        }

        /**
         * 清除组件缓存
         */
        public clearComponentCache(): void {
            this.componentCache.clear();
        }

        /**
         * 添加标签
         * @param tag 
         */
        addTag(tag: string): void {
            this.tags.add(tag);
        }

        /**
         * 获取标签
         * @returns 
         */
        getTags(): Set<string> {
            return new Set(Array.from(this.tags));
        }

        /**
         * 移除标签
         * @param tag 
         */
        removeTag(tag: string): void {
            this.tags.delete(tag);
        }

        /**
         * 检查是否具有指定标签
         * @param tag 
         * @returns 
         */
        hasTag(tag: string): boolean {
            return this.tags.has(tag);
        }

        /**
         * 序列化
         * @returns 
         */
        serialize(): any {
            const serializedEntity: any = {
                id: this.id,
                components: {},
            };

            for (const [componentType, manager] of this.componentManagers) {
                const component = manager.get(this.id) as Component;
                if (component && component.shouldSerialize()) {
                    serializedEntity.components[componentType.name] = component.serialize();
                }
            }

            return serializedEntity;
        }

        /**
         * 增量序列化
         * @param lastSnapshotVersion 上一次快照版本
         * @returns 返回增量序列化后的实体对象，如果没有更新的组件，则返回null
         */
        serializeIncremental(lastSnapshotVersion: number): any | null {
            let hasUpdatedComponents = false;
            const serializedEntity = {
                id: this.id,
                components: {},
            };

            for (const [componentType, manager] of this.componentManagers) {
                const component = manager.get(this.id) as Component;
                if (component && component.shouldSerialize() && component.version > lastSnapshotVersion) {
                    serializedEntity.components[componentType.name] = component.serialize();
                    hasUpdatedComponents = true;
                }
            }

            return hasUpdatedComponents ? serializedEntity : null;
        }


        /**
         * 反序列化
         * @param data 
         */
        deserialize(data: any): void {
            for (const componentName in data.components) {
                for (const [componentType, manager] of this.componentManagers) {
                    if (componentType.name === componentName) {
                        const component = manager.get(this.id) as Component;
                        if (component) {
                            component.deserialize(data.components[componentName]);
                        }
                        break;
                    }
                }
            }
        }

        /**
         * 实体创建时的逻辑
         */
        onCreate() {
        }

        /**
         * 实体销毁时的逻辑
         */
        onDestroy() {
        }

        public on(eventType: string, listener: EventListener): void {
            this.eventEmitter.on(eventType, listener);
        }

        public once(eventType: string, callback: (event: Event) => void): void {
            this.eventEmitter.once(eventType, callback);
        }

        public off(eventType: string, listener: EventListener): void {
            this.eventEmitter.off(eventType, listener);
        }

        public emit(type: string, data: any): void {
            this.eventEmitter.emit(type, data);
        }
    }
}
