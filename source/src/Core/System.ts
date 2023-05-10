module gs {
    /**
     * 系统基类
     */
    export abstract class System {
        protected entityManager: EntityManager;
        protected paused: boolean = false;
        protected matcher: Matcher;

        public pause(): void {
            this.paused = true;
        }

        public resume(): void {
            this.paused = false;
        }

        public isPaused(): boolean {
            return this.paused;
        }

        protected enabled: boolean = true;

        public enable(): void {
            this.enabled = true;
        }

        public disable(): void {
            this.enabled = false;
        }

        public isEnabled(): boolean {
            return this.enabled;
        }

        /** 
         * 系统优先级，优先级越高，越先执行
         */
        public readonly priority: number;
        /**
         * 系统所在的worker脚本
         */
        public readonly workerScript?: string;

        constructor(entityManager: EntityManager, priority: number, matcher?: Matcher, workerScript?: string) {
            this.entityManager = entityManager;
            this.priority = priority;
            this.workerScript = workerScript;
            this.matcher = matcher || Matcher.empty();
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
            return entities.filter(entity => this.matcher.isInterestedEntity(entity) && this.entityFilter(entity));
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
        onRegister() {
        }

        /**
         * 系统注销时的逻辑
         */
        onUnregister() {
        }
    }
}