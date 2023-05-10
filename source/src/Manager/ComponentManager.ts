module gs {
    export type ComponentConstructor<T extends Component> = {
        new(): T;
    };

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
        }

        public create(entityId: number): T {
            let component: T;
            if (this.componentPool.length > 0) {
                component = this.componentPool.pop();
            } else {
                component = new this.componentType();
            }
            component.setEntityId(entityId);

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
    }
}