module gs {
    /**
     * ECS 框架中的系统管理器类，负责管理系统的注册、注销以及更新。
     */
    export class SystemManager {
        private systems: System[];
        private entityManager: EntityManager;
        private systemWorkers: Map<System, Worker> = new Map();
        private entityCache: Map<System, Entity[]> = new Map();

        constructor(entityManager: EntityManager) {
            this.systems = [];
            this.entityManager = entityManager;
            entityManager.setSystemManager(this);
        }

        /**
         * 注册系统
         * @param system 系统 
         */
        registerSystem(system: System): void {
            system.onRegister();
            this.systems.push(system);
            this.systems.sort((a, b) => a.priority - b.priority);

            if (system.workerScript) {
                if (typeof Worker === 'undefined') {
                    console.warn(
                        'Web Workers 在当前环境中不受支持。系统将在主线程中运行'
                    );
                } else {
                    const worker = new Worker(system.workerScript);
                    worker.onmessage = (event) => {
                        const updatedEntities = event.data.entities;
                        for (const updatedEntityData of updatedEntities) {
                            const entity = this.entityManager.getEntity(updatedEntityData.id);
                            if (entity) {
                                entity.deserialize(updatedEntityData);
                            }
                        }
                    };
                    this.systemWorkers.set(system, worker);
                }
            }
        }

        /**
         * 注销系统
         * @param system 
         */
        unregisterSystem(system: System): void {
            system.onUnregister();
            const index = this.systems.indexOf(system);
            if (index > -1) {
                this.systems.splice(index, 1);
            }
            this.systemWorkers.delete(system);
            this.entityCache.delete(system);
        }

        /**
         * 通知所有系统组件已添加
         * @param entity 
         */
        notifyComponentAdded(entity: Entity): void {
            for (const system of this.systems) {
                system.handleComponentChange(entity, true);
                this.entityCache.delete(system);
            }
        }

        /**
         * 通知所有系统组件已删除
         * @param entity 
         */
        notifyComponentRemoved(entity: Entity): void {
            for (const system of this.systems) {
                system.handleComponentChange(entity, false);
                this.entityCache.delete(system);
            }
        }

        /**
         * 使特定系统的实体缓存无效。
         * @param system 要使其实体缓存无效的系统
         */
        invalidateEntityCacheForSystem(system: System): void {
            this.entityCache.delete(system);
        }

        /**
         * 更新系统
         */
        update(): void {
            const entities = this.entityManager.getEntities();
            for (const system of this.systems) {
                if (!system.isEnabled() || system.isPaused()) {
                    continue;
                }

                let filteredEntities = this.entityCache.get(system);
                if (!filteredEntities) {
                    filteredEntities = system.filterEntities(entities);
                    this.entityCache.set(system, filteredEntities);
                }

                const worker = this.systemWorkers.get(system);
                if (worker) {
                    const message = {
                        entities: filteredEntities.map(entity => entity.serialize()),
                    };
                    worker.postMessage(message);
                } else {
                    system.update(filteredEntities);
                }
            }
        }
    }
}