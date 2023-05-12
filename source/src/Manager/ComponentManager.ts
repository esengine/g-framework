module gs {
    export type ComponentConstructor<T extends Component> = new (...args: any[]) => T;

    /**
     * 组件管理器
     */
    export class ComponentManager<T extends Component> {
        private components: SparseSet<T>;
        private componentType: ComponentConstructor<T>;
        private componentPool: T[] = [];

        /**
         * ComponentManager 构造函数
         * @param componentType - 用于创建和管理的组件类型。
         *
         * 用法示例：
         * const positionManager = new ComponentManager(PositionComponent);
         */
        constructor(componentType: ComponentConstructor<T>) {
            this.componentType = componentType;
            this.components = new SparseSet<T>();
            this.preallocate(10); // 预先创建10个组件实例
        }

        public create(entityId: number, entityManager: EntityManager): T {
            let component: T;

            if (this.componentPool.length > 0) {
                component = this.componentPool.pop();
                component.reinitialize(entityId, entityManager); // 重置组件状态并进行初始化
            } else {
                component = new this.componentType();
            }
            component.setEntityId(entityId, entityManager);

            // 检查组件依赖
            for (const dependency of component.dependencies) {
                if (!entityManager.hasComponent(entityId, dependency)) {
                    throw new Error(`组件 ${component.constructor.name} 依赖于 ${dependency.name}，但实体 ${entityId} 缺少该组件。`);
                }
            }

            this.components.add(entityId, component);
            return component;
        }

        /**
         * 获取组件数据
         * @param entityId 实体ID
         * @returns 组件数据
         */
        public get(entityId: number): T | null {
            return this.components.get(entityId);
        }

        /**
         * 
         * @param entityId 
         * @returns 
         */
        public has(entityId: number): boolean {
            return this.components.has(entityId);
        }

        /**
         * 
         * @param entityId 
         * @returns 
         */
        public remove(entityId: number): void {
            const component = this.components.get(entityId);
            if (component) {
                component.reset();
                this.componentPool.push(component); // 将组件回收到组件池中
            }
            this.components.remove(entityId);
        }

        /**
        * 预先创建指定数量的组件实例，并将它们放入对象池
        * @param count 要预先创建的组件数量
        */
        public preallocate(count: number, resetComponents: boolean = true): void {
            for (let i = 0; i < count; i++) {
                const component = new this.componentType();
                if (resetComponents) {
                    component.reset();
                }
                this.componentPool.push(component);
            }
        }
    }
}