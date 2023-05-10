module gs {
    /**
     * 系统管理器
     */
    export class SystemManager {
        private systems: System[];
        private entityManager: EntityManager;
        private systemWorkers: Map<System, Worker> = new Map();

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
        }

        /**
         * 通知所有系统组件已添加
         * @param entity 
         * @param component 
         */
        notifyComponentAdded(entity: Entity, component: Component): void {
            for (const system of this.systems) {
                system.onComponentAdded(entity, component);
            }
        }

        /**
         * 通知所有系统组件已删除
         * @param entity 
         * @param component 
         */
        notifyComponentRemoved(entity: Entity, component: Component): void {
            for (const system of this.systems) {
                system.onComponentRemoved(entity, component);
            }
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

                const filteredEntities = entities.filter(entity => system.entityFilter(entity));

                const worker = this.systemWorkers.get(system);
                if (worker) {
                    const message = {
                        entities: filteredEntities.map(entity => entity.serialize()),
                    };
                    worker.postMessage(message);

                    worker.onmessage = (event) => {
                        const updatedEntities = event.data.entities;
                        for (const updatedEntityData of updatedEntities) {
                            const entity = this.entityManager.getEntity(updatedEntityData.id);
                            if (entity) {
                                entity.deserialize(updatedEntityData);
                            }
                        }
                    };
                } else {
                    system.update(filteredEntities);
                }
            }
        }
    }
}