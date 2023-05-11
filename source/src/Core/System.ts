module gs {
    /**
     * ECS 框架中的系统接口，定义了系统需要实现的方法。
     */
    export interface ISystem {
        update(entities: Entity[]): void;
        filterEntities(entities: Entity[]): Entity[];
        onRegister(): void;
        onUnregister(): void;
    }

    /**
     * 系统基类
     */
    export abstract class System implements ISystem {
        protected entityManager: EntityManager;
        protected matcher: Matcher;

        protected lastUpdateTime: number;
        protected updateInterval: number;

        /** 
         * 系统优先级，优先级越高，越先执行
         */
        public readonly priority: number;
        /**
         * 系统所在的worker脚本
         */
        public readonly workerScript?: string;

        constructor(entityManager: EntityManager, priority: number, matcher?: Matcher, workerScript?: string, updateInterval?: number) {
            this.entityManager = entityManager;
            this.priority = priority;
            this.workerScript = workerScript;
            this.matcher = matcher || Matcher.empty();

            this.updateInterval = updateInterval || 0;  // 默认为0，即每次都更新
            this.lastUpdateTime = 0;
        }

        protected _paused: boolean = false;
        protected _enabled: boolean = true;

        get paused(): boolean {
            return this._paused;
        }

        set paused(value: boolean) {
            this._paused = value;
        }

        get enabled(): boolean {
            return this._enabled;
        }

        set enabled(value: boolean) {
            this._enabled = value;
        }

        public isPaused(): boolean {
            return this.paused;
        }

        public isEnabled(): boolean {
            return this.enabled;
        }

        /**
        * 更新系统
        * @param entities 
        */
        performUpdate(entities: Entity[]): void {
            const now = Date.now();
            if (now - this.lastUpdateTime >= this.updateInterval) {
                this.update(entities);
                this.lastUpdateTime = now;
            }
        }

        /**
         * 更新系统
         * @param entities 
         */
        abstract update(entities: Entity[]): void;

        /**
         * 筛选实体
         * @param entity 
         */
        entityFilter(entity: Entity): boolean {
            return true;
        }

        public filterEntities(entities: Entity[]): Entity[] {
            return entities.reduce((filteredEntities, entity) => {
                if (this.matcher.isInterestedEntity(entity) && this.entityFilter(entity)) {
                    filteredEntities.push(entity);
                }
                return filteredEntities;
            }, [] as Entity[]);
        }

        public handleComponentChange(entity: Entity, added: boolean): void {
            if (this.matcher.isInterestedEntity(entity)) {
                if (added) {
                    this.onComponentAdded(entity);
                } else {
                    this.onComponentRemoved(entity);
                }
            }
        }

        protected onComponentAdded(entity: Entity): void { }

        protected onComponentRemoved(entity: Entity): void { }

        /**
         * 系统注册时的逻辑
         */
        onRegister() { }

        /**
         * 系统注销时的逻辑
         */
        onUnregister() { }
    }
}