module gs {
    export class EntityManager {
        private entities: Map<number, Entity>;
        private idAllocator: EntityIdAllocator;

        constructor() {
            this.entities = new Map();
            this.idAllocator = new EntityIdAllocator();
        }

        /**
         * 创建实体
         * @returns
         */
        createEntity(): Entity {
            const newEntity = new Entity(this.idAllocator.generateId());
            this.entities.set(newEntity.id, newEntity);
            return newEntity;
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
         * 获取所有实体
         * @returns 
         */
        getEntities(): Entity[] {
            return Array.from(this.entities.values());
        }
    }
}