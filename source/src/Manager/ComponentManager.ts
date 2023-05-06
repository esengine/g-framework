module gs {
    export type ComponentConstructor<T extends Component> = {
        new(): T;
    };

    /**
     * 组件管理器
     */
    export class ComponentManager<T extends Component> {
        private data: T[] = [];
        private entityToDataIndex: Map<number, number> = new Map();
        private freeDataIndices: number[] = [];
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
        }

        public create(entityId: number): T {
            const index = this.allocateDataIndex();
            let component: T;
            if (this.componentPool.length > 0) {
                component = this.componentPool.pop();
            } else {
                component = new this.componentType();
            }
            component.setEntityId(entityId);

            this.data[index] = component;
            this.entityToDataIndex.set(entityId, index);
            return component;
        }

        /**
         * 获取组件数据
         * @param entityId 实体ID
         * @returns 组件数据
         */
        public get(entityId: number): T | null {
            const dataIndex = this.entityToDataIndex.get(entityId);
            if (dataIndex === undefined) {
                return null;
            }

            if (!this.data[dataIndex]) {
                this.data[dataIndex] = {} as T;
            }

            return this.data[dataIndex];
        }

        /**
         * 
         * @param entityId 
         * @returns 
         */
        public has(entityId: number): boolean {
            return this.entityToDataIndex.has(entityId);
        }

        /**
         * 
         * @param entityId 
         * @returns 
         */
        public remove(entityId: number): void {
            const dataIndex = this.entityToDataIndex.get(entityId);
            if (dataIndex === undefined) {
                return;
            }
            this.entityToDataIndex.delete(entityId);

            const component = this.data[dataIndex];
            component.reset();

            this.data[dataIndex] = null;
            this.freeDataIndices.push(dataIndex);
            this.componentPool.push(component); // 将组件回收到组件池中
        }

        /**
         * 分配数据索引
         * @returns 
         */
        public allocateDataIndex(): number {
            if (this.freeDataIndices.length > 0) {
                return this.freeDataIndices.pop();
            }
            return this.data.length;
        }
    }
}