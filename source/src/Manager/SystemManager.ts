module gs {
    /**
     * ECS 框架中的系统管理器类，负责管理系统的注册、注销以及更新。
     */
    export class SystemManager {
        private systems: System[];
        private entityManager: EntityManager;
        private systemWorkers: Map<System, Worker> = new Map();
        private entityCache: Map<System, Entity[]> = new Map();
        private dependencies: Map<System, System[]> = new Map();

        private workerWarningDisplayed: boolean = false;

        constructor(entityManager: EntityManager) {
            this.systems = [];
            this.entityManager = entityManager;
            entityManager.setSystemManager(this);
        }

        /**
         * 注册系统
         * @param system 系统 
         * @param dependsOn 可选的依赖系统数组
         */
        registerSystem(system: System, dependsOn?: System[]): void {
            system.onRegister();
            if (dependsOn) {
                this.dependencies.set(system, dependsOn);
            }

            this.systems.push(system);
            this.sortSystemsByPriorityAndDependencies();

            if (system.workerScript) {
                if (typeof Worker === 'undefined') {
                    if (!this.workerWarningDisplayed) {
                        console.warn(
                            'Web Workers 在当前环境中不受支持。系统将在主线程中运行'
                        );
                        this.workerWarningDisplayed = true;
                    }
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
         * @param component
         */
        notifyComponentAdded(entity: Entity, component: Component): void {
            for (const system of this.systems) {
                system.handleComponentChange(entity, component, true);
                this.entityCache.delete(system);
            }
        }

        /**
         * 通知所有系统组件已删除
         * @param entity 
         * @param component
         */
        notifyComponentRemoved(entity: Entity, component: Component): void {
            for (const system of this.systems) {
                system.handleComponentChange(entity, component, false);
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
                    system.performUpdate(filteredEntities);
                }
            }
        }

        /**
         * 按优先级和依赖关系对系统进行排序
         */
        private sortSystemsByPriorityAndDependencies(): void {
            this.systems.sort((a, b) => {
                const priorityDiff = a.priority - b.priority;
                if (priorityDiff !== 0) {
                    return priorityDiff;
                }

                if (this.dependsOn(a, b)) {
                    return 1;
                }
                if (this.dependsOn(b, a)) {
                    return -1;
                }
                return 0;
            });
        }

        /**
         * 确定系统 a 是否依赖于系统 b
         * @param a 系统 a
         * @param b 系统 b
         * @returns 如果系统 a 依赖于系统 b，则为 true，否则为 false
         */
        private dependsOn(a: System, b: System): boolean {
            const dependenciesOfA = this.dependencies.get(a);
            if (!dependenciesOfA) {
                return false;
            }
            if (dependenciesOfA.indexOf(b) !== -1) {
                return true;
            }
            return dependenciesOfA.some(dep => this.dependsOn(dep, b));
        }

        public dispose(): void {
            for (const worker of this.systemWorkers.values()) {
                worker.terminate();
            }

            this.systemWorkers.clear();
            this.entityCache.clear();
        }
    }
}