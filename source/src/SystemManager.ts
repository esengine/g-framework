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
        }

        /**
         * 注册系统
         * @param system 系统 
         */
        registerSystem(system: System): void {
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
         * 更新系统
         * @param deltaTime 
         */
        update(deltaTime: number): void {
            const entities = this.entityManager.getEntities();
            for (const system of this.systems) {
                const filteredEntities = entities.filter(entity => system.entityFilter(entity));

                const worker = this.systemWorkers.get(system);
                if (worker) {
                    const message = {
                        deltaTime,
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