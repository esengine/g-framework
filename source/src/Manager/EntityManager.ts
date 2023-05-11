module gs {
    export interface StateSnapshot {
        entities: any[];
    }

    export class EntityManager {
        private entities: Map<number, Entity>;
        private entityIdAllocator: EntityIdAllocator;
        public componentManagers: Map<ComponentConstructor<Component>, ComponentManager<Component>>;
        /** 当前帧编号属性 */
        private currentFrameNumber: number;
        private inputManager: InputManager;
        private networkManager: NetworkManager;
        // 查询缓存，用于缓存组件查询结果
        private queryCache: Map<string, Entity[]> = new Map();
        private tagCache: Map<string, Entity[]> = new Map();
        public systemManager?: SystemManager;

        constructor(componentClasses: Array<ComponentConstructor<Component>> = null, systemManager?: SystemManager) {
            this.entities = new Map();
            this.entityIdAllocator = new EntityIdAllocator();
            this.inputManager = new InputManager(this);
            this.networkManager = new NetworkManager();
            this.currentFrameNumber = 0;
            this.systemManager = systemManager;

            this.componentManagers = new Map();
            if (componentClasses != null)
                for (const componentClass of componentClasses) {
                    const componentManager = new ComponentManager(componentClass);
                    this.componentManagers.set(componentClass, componentManager);
                }
        }

        public setSystemManager(systemManager: SystemManager): void {
            this.systemManager = systemManager;
        }

        /**
         * 添加组件管理器
         * @param componentClass 要添加的组件类
         */
        public addComponentManager<T extends Component>(componentClass: ComponentConstructor<T>): void {
            const componentManager = new ComponentManager(componentClass);
            this.componentManagers.set(componentClass, componentManager);
        }

        public updateFrameNumber(): void {
            this.currentFrameNumber++;
        }

        public getCurrentFrameNumber(): number {
            return this.currentFrameNumber;
        }

        public getInputManager(): InputManager {
            return this.inputManager;
        }

        public getNetworkManager(): NetworkManager {
            return this.networkManager;
        }

        /**
         * 创建实体
         * @returns customEntityClass 可选的自定义实体类
         */
        public createEntity(customEntityClass: new (entityId: number,
            entityManager: EntityManager,
            componentManagers: Map<ComponentConstructor<any>, ComponentManager<Component>>) => Entity = Entity): Entity {
            const entityId = this.entityIdAllocator.allocate();
            const entity = new customEntityClass(entityId, this, this.componentManagers);
            entity.onCreate();
            this.entities.set(entityId, entity);

            for (const tag of entity.getTags()) {
                if (!this.tagCache.has(tag)) {
                    this.tagCache.set(tag, []);
                }

                this.tagCache.get(tag).push(entity);
            }

            return entity;
        }

        /**
         * 删除实体
         * @param entityId 
         */
        public deleteEntity(entityId: number): void {
            const entity = this.getEntity(entityId);
            if (entity) {
                entity.onDestroy();
                this.entities.delete(entityId);

                for (const tag of entity.getTags()) {
                    const entitiesWithTag = this.tagCache.get(tag);
                    if (entitiesWithTag) {
                        const index = entitiesWithTag.indexOf(entity);
                        if (index > -1) {
                            entitiesWithTag.splice(index, 1);
                        }
                    }
                }
            }
        }

        /**
         * 获取实体
         * @param entityId 实体id
         * @returns 实体
         */
        public getEntity(entityId: number): Entity | null {
            return this.entities.has(entityId) ? this.entities.get(entityId) as Entity : null;
        }

        /**
         * 获取具有特定组件的所有实体
         * @param componentClass 要检查的组件类
         * @returns 具有指定组件的实体数组
         */
        public getEntitiesWithComponent<T extends Component>(componentClass: ComponentConstructor<T>): Entity[] {
            return this.queryComponents([componentClass]);
        }

        /**
         * 查找具有指定组件的实体
         * @param componentClasses 
         * @returns 
         */
        public getEntitiesWithComponents<T extends Component>(componentClasses: ComponentConstructor<T>[]): Entity[] {
            return this.queryComponents(componentClasses);
        }

        /**
         * 获取所有实体
         * @returns 
         */
        public getEntities(): Entity[] {
            return Array.from(this.entities.values());
        }

        /**
        * 获取具有特定标签的所有实体
        * @param tag 要检查的标签
        * @returns 具有指定标签的实体数组
        */
        public getEntitiesWithTag(tag: string): Entity[] {
            if (!this.tagCache.has(tag)) {
                const entitiesWithTag: Entity[] = [];

                for (const entity of this.getEntities()) {
                    if (entity.hasTag(tag)) {
                        entitiesWithTag.push(entity);
                    }
                }

                this.tagCache.set(tag, entitiesWithTag);
            }

            return this.tagCache.get(tag) as Entity[];
        }

        /**
         * 检查实体是否具有指定类型的组件
         * @param entityId 要检查的实体的ID
         * @param componentClass 要检查的组件类型
         * @returns 如果实体具有指定类型的组件，则返回 true，否则返回 false
         */
        public hasComponent<T extends Component>(entityId: number, componentClass: ComponentConstructor<T>): boolean {
            const componentManager = this.componentManagers.get(componentClass);
            if (componentManager) {
                return componentManager.has(entityId);
            }
            return false;
        }

        /**
         * 根据提供的组件数组查询实体
         * @param components 要查询的组件数组
         * @returns 符合查询条件的实体数组
         */
        public queryComponents(components: ComponentConstructor<Component>[]): Entity[] {
            const key = `${components.map(c => c.name).sort().join('|')}`;
            if (!this.queryCache.has(key)) {
                const result = this.performQuery(components);
                this.queryCache.set(key, result);
            }
            return this.queryCache.get(key);
        }

        private performQuery(components: ComponentConstructor<Component>[]): Entity[] {
            const result: Entity[] = [];

            // 遍历所有实体
            for (const entity of this.getEntities()) {
                // 检查每个查询的组件是否存在于实体中
                const hasAllComponents = components.every(componentType => {
                    return entity.hasComponent(componentType);
                });

                // 如果所有组件存在，则将实体添加到结果中
                if (hasAllComponents) {
                    result.push(entity);
                }
            }

            return result;
        }

        /**
         * 创建当前游戏状态的快照
         * @returns 
         */
        public createStateSnapshot(): StateSnapshot {
            const snapshot: StateSnapshot = {
                entities: [],
            };

            for (const entity of this.getEntities()) {
                snapshot.entities.push(entity.serialize());
            }

            return snapshot;
        }

        /**
         * 创建增量状态快照
         * @param lastSnapshotVersion 上一个快照的版本号
         * @returns 返回一个包含实体增量数据的快照对象
         */
        public createIncrementalStateSnapshot(lastSnapshotVersion: number): any {
            const snapshot: StateSnapshot = {
                entities: [],
            };

            for (const entity of this.getEntities()) {
                const serializedEntity = entity.serializeIncremental(lastSnapshotVersion);
                if (serializedEntity) {
                    snapshot.entities.push(serializedEntity);
                }
            }

            return snapshot;
        }


        /**
         * 使用给定的状态快照更新游戏状态
         * @param stateSnapshot 
         */
        public updateStateFromSnapshot(stateSnapshot: any): void {
            const newEntityMap: Map<number, Entity> = new Map();

            for (const entityData of stateSnapshot.entities) {
                const entityId = entityData.id;
                let entity = this.getEntity(entityId);

                if (!entity) {
                    entity = new Entity(entityId, this, this.componentManagers);
                    entity.onCreate();
                }

                entity.deserialize(entityData);
                newEntityMap.set(entityId, entity);
            }

            this.entities = newEntityMap;
        }

        /**
         * 应用插值
         * @param factor 
         */
        public applyInterpolation(factor: number) {
            for (const entity of this.getEntities()) {
                for (const [componentType, manager] of this.componentManagers) {
                    const component = entity.getComponent(componentType);
                    if (component instanceof Component && 'savePreviousState' in component && 'applyInterpolation' in component) {
                        (component as Interpolatable).applyInterpolation(factor);
                    }
                }
            }
        }

        /**
         * 清除指定组件或标签的缓存
         * @param componentClass 
         * @param tag 
         */
        public invalidateCache(componentClass?: ComponentConstructor<Component>, tag?: string): void {
            if (componentClass) {
                const key = componentClass.name;
                this.queryCache.delete(key);
            }

            if (tag) {
                this.tagCache.delete(tag);
            }
        }

        /**
         * 克隆实体并返回新创建的实体
         * @param entity 要克隆的实体
         * @param deepCopy 是否使用深拷贝
         * @returns 新创建的实体
         */
        public cloneEntity(entity: Entity, deepCopy: boolean = false): Entity {
            const newEntity = this.createEntity(entity.constructor as typeof Entity);

            // 遍历组件管理器并为新实体添加已克隆的组件
            for (const [componentType, manager] of this.componentManagers) {
                const component = entity.getComponent(componentType);
                if (component) {
                    const clonedComponent = deepCopy ? component.cloneDeep() : component.cloneShallow();
                    newEntity.addComponent(componentType, clonedComponent);
                }
            }

            // 添加实体标签
            for (const tag of entity.getTags()) {
                newEntity.addTag(tag);
            }

            return newEntity;
        }
    }
}