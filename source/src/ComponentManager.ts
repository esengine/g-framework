module gs {
    /**
     * 组件管理器
     */
    export class ComponentManager<T extends Component> {
        private data: T[] = [];
        private entityToDataIndex: Map<number, number> = new Map();
        private freeDataIndices: number[] = [];
        private componentType: new (entityId: number) => T;

        constructor(componentType: new (entityId: number) => T) {
            this.componentType = componentType;
        }

        public create(entityId: number): T {
            const index = this.allocateDataIndex();
            const component = new this.componentType(entityId);
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
            this.data[dataIndex] = null;
            this.freeDataIndices.push(dataIndex);
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