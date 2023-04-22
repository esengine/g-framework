module gs {
    /**
     * 系统基类
     */
    export abstract class System {
        protected entityManager: EntityManager;
        protected paused: boolean = false;
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

        constructor(entityManager: EntityManager, priority: number, workerScript?: string) {
            this.entityManager = entityManager;
            this.priority = priority;
            this.workerScript = workerScript;
        }

        /**
         * 筛选实体
         * @param entity 
         */
        abstract entityFilter(entity: Entity): boolean;
        /**
         * 更新系统
         * @param entities 
         */
        abstract update(entities: Entity[]): void;

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