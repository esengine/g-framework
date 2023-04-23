module gs {
    export class EntityManager {
        private entities: Map<number, Entity>;
        private entityIdAllocator: EntityIdAllocator;
        private componentManagers: Map<ComponentConstructor<any>, ComponentManager<Component>>;
        /** 当前帧编号属性 */
        private currentFrameNumber: number;
        private inputManager: InputManager;
        private networkManager: NetworkManager;

        constructor(componentClasses: Array<ComponentConstructor<any>>) {
            this.entities = new Map();
            this.entityIdAllocator = new EntityIdAllocator();
            this.inputManager = new InputManager(this);
            this.networkManager = new NetworkManager();
            this.currentFrameNumber = 0;

            this.componentManagers = new Map();
            for (const componentClass of componentClasses) {
                const storageMode = componentClass.useTypedArrayStorage
                    ? StorageMode.TypedArray
                    : StorageMode.Object;
                const dataSize = componentClass.defaultDataSize || 10;
                const componentManager = new ComponentManager(componentClass, storageMode, dataSize);
                this.componentManagers.set(componentClass, componentManager);
            }
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
         * @returns
         */
        public createEntity(): Entity {
            const entityId = this.entityIdAllocator.allocate();
            const entity = new Entity(entityId, this.componentManagers);
            entity.onCreate();
            this.entities.set(entityId, entity);
            return entity;
        }

        /**
         * 删除实体
         * @param entityId 
         */
        deleteEntity(entityId: number): void {
            const entity = this.getEntity(entityId);
            if (entity) {
                entity.onDestroy();
                this.entities.delete(entityId);
            }
        }

        /**
         * 获取实体
         * @param entityId 实体id
         * @returns 实体
         */
        getEntity(entityId: number): Entity | null {
            return this.entities.has(entityId) ? this.entities.get(entityId) as Entity : null;
        }

        /**
         * 获取具有特定组件的所有实体
         * @param componentClass 要检查的组件类
         * @returns 具有指定组件的实体数组
         */
        getEntitiesWithComponent<T extends Component>(componentClass: new (...args: any[]) => T): Entity[] {
            const entitiesWithComponent: Entity[] = [];

            for (const entity of this.getEntities()) {
                if (entity.hasComponent(componentClass)) {
                    entitiesWithComponent.push(entity);
                }
            }

            return entitiesWithComponent;
        }

        /**
         * 获取所有实体
         * @returns 
         */
        getEntities(): Entity[] {
            return Array.from(this.entities.values());
        }

        /**
        * 获取具有特定标签的所有实体
        * @param tag 要检查的标签
        * @returns 具有指定标签的实体数组
        */
        getEntitiesWithTag(tag: string): Entity[] {
            const entitiesWithTag: Entity[] = [];

            for (const entity of this.getEntities()) {
                if (entity.hasTag(tag)) {
                    entitiesWithTag.push(entity);
                }
            }

            return entitiesWithTag;
        }

        /**
         * 创建当前游戏状态的快照
         * @returns 
         */
        public createStateSnapshot(): any {
            const snapshot: any = {
                entities: [],
            };

            for (const entity of this.getEntities()) {
                snapshot.entities.push(entity.serialize());
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
                    entity = new Entity(entityId, this.componentManagers);
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
    }
}