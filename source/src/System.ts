module gs {
    /**
     * 系统基类
     */
    export abstract class System {
        protected entityManager: EntityManager;
        /** 
         * 系统优先级，优先级越高，越先执行
         */
        public readonly priority: number;
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
         * @param deltaTime 
         * @param entities 
         */
        abstract update(deltaTime: number, entities: Entity[]): void;
    }
}