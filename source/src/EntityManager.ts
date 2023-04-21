module gs {
    export class EntityManager {
        private entities: Map<number, Entity>;
        private entityIdAllocator: EntityIdAllocator;

        constructor() {
            this.entities = new Map();
            this.entityIdAllocator = new EntityIdAllocator();
        }

        /**
         * 创建实体
         * @returns
         */
        public createEntity(): Entity {
            const entityId = this.entityIdAllocator.allocate();
            const componentManagers = new Map<new () => Component, ComponentManager<any>>();
            return new Entity(entityId, componentManagers);
        }

        /**
         * 删除实体
         * @param entityId 
         */
        deleteEntity(entityId: number): void {
            this.entities.delete(entityId);
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
    }
}