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

        private _parent?: Entity; // 父实体
        private _children = new LinkedList<Entity>(); // 子实体列表
        private _childNode?: Node<Entity>; // 当前实体在父实体的子实体列表中的节点

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

        get parent(): Entity | undefined {
            return this._parent;
        }

        get children(): Entity[] {
            return this._children.toArray();
        }

        public setParent(parent: Entity): void {
            if (this._parent) {
                this._parent._children.remove(this._childNode!);
            }

            this._parent = parent;
            this._childNode = this._parent._children.append(this);
        }

        public removeParent(): void {
            if (this._parent) {
                this._parent._children.remove(this._childNode!);
            }
            this._parent = undefined;
            this._childNode = undefined;
        }

        public addChild(child: Entity): void {
            child.setParent(this);
        }

        public removeChild(child: Entity): void {
            child.removeParent();
        }

        /**
         * 添加组件
         * @param componentType
         * @param args
         * @returns
         */
        public addComponent<T extends Component>(componentType: ComponentConstructor<T>, ...args: any[]): T {
            let manager = this.componentManagers.get(componentType);
            if (!manager) {
                manager = this.entityManager.addComponentManager(componentType);
            }

            const component = manager.create(this, this.entityManager) as T;
            component.onInitialize(...args);

            const componentInfo = ComponentTypeManager.getIndexFor(componentType);
            for (const index of componentInfo.allAncestors) {
                this.componentBits.set(index);
            }

            if (this.entityManager.systemManager) {
                this.entityManager.systemManager.notifyComponentAdded(this, component);
            }

            return component;
        }

        /**
         * 获取组件
         * @param componentType 
         * @returns 
         */
        public getComponent<T extends Component>(componentType: ComponentConstructor<T>): T | null {
            // 获取组件类型信息
            const componentInfo = ComponentTypeManager.getIndexFor(componentType);
            
            // 首先尝试直接从缓存中获取
            for (const index of componentInfo.allAncestors) {
                const cachedComponentType = ComponentTypeManager.getComponentTypeFor(index);
                const cachedComponent = this.componentCache.get(cachedComponentType);
                if (cachedComponent) {
                    return cachedComponent as T;
                }
            }
            
            // 如果缓存中没有找到，那么从组件管理器中获取
            for (const manager of this.componentManagers.values()) {
                const component = manager.get(this.id);
                if (component && (component instanceof componentType)) {
                    this.componentCache.set(componentType, component);
                    return component as T;
                }
            }
            
            return null;
        }

        /**
         * 获取所有组件
         * @returns 
         */
        public getAllComponents(): Component[] {
            const components: Component[] = [];
            for (const component of this) {
                components.push(component);
            }
            return components;
        }

        /**
         * 移除组件
         * @param componentType 
         * @returns 
         */
        public removeComponent<T extends Component>(componentType: ComponentConstructor<T>): void {
            const manager = this.componentManagers.get(componentType);
            if (!manager) {
                return;
            }

            const component = this.getComponent(componentType);
            if (component) {
                if (this.entityManager.systemManager) {
                    this.entityManager.systemManager.notifyComponentRemoved(this, component);
                }
                manager.remove(this.id);
            }

            const componentInfo = ComponentTypeManager.getIndexFor(componentType);
            for (const index of componentInfo.allAncestors) {
                this.componentBits.clear(index);
            }

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
            this.entityManager.addToTagCache(tag, this);
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
            this.entityManager.removeFromTagCache(tag, this);
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

        [Symbol.iterator](): Iterator<Component> {
            const managers = Array.from(this.componentManagers.values());
            let index = 0;

            return {
                next: (): IteratorResult<Component> => {
                    if (index < managers.length) {
                        const component = managers[index++].get(this.id);
                        if (component) {
                            return { done: false, value: component };
                        }
                    }

                    return { done: true, value: null };
                }
            };
        }

        public on(eventType: string, listener: EventListener): void {
            this.eventEmitter.on(eventType, listener);
        }

        public once(eventType: string, callback: (event: GEvent) => void): void {
            this.eventEmitter.once(eventType, callback);
        }

        public off(eventType: string, listener: EventListener): void {
            this.eventEmitter.off(eventType, listener);
        }

        public emit(event: GEvent): void {
            this.eventEmitter.emitEvent(event);
        }
    }
}
