module gs {
    export enum StorageMode {
        Float32Array,
        Object
    }

    /**
     * 组件管理器
     */
    export class ComponentManager<T extends Component> {
        private data: T[] = [];
        private entityToDataIndex: Map<number, number> = new Map();
        private freeDataIndices: number[] = [];
        public componentType: new () => T;
        public storageMode: StorageMode;
        private float32Data: Float32Array[] = [];

        constructor(componentType: new () => T, storageMode: StorageMode = StorageMode.Object) {
            this.storageMode = storageMode;
            this.componentType = componentType;

            if (this.storageMode === StorageMode.Float32Array) {
                this.float32Data = [];
            } else {
                this.data = [];
            }
        }

        public create(entityId: number): T {
            const index = this.allocateDataIndex();
            const component = new this.componentType();
            component.setEntityId(entityId);
            Component.registerComponent(this.componentType, this, entityId);
            if (this.storageMode === StorageMode.Float32Array) {
                this.float32Data[index] = new Float32Array(component.constructor.prototype.float32PropertyCount);
            } else {
                this.data[index] = component;
            }
            this.entityToDataIndex.set(entityId, index);
            return component;
        }

        /**
         * 获取组件数据
         * @param entityId 实体ID
         * @returns 组件数据
         */
        public get(entityId: number): T | Float32Array | null {
            const dataIndex = this.entityToDataIndex.get(entityId);
            if (dataIndex === undefined) {
                return null;
            }
            if (this.storageMode === StorageMode.Float32Array) {
                return this.float32Data[dataIndex];
            } else {
                return this.data[dataIndex];
            }
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
            if (this.storageMode === StorageMode.Float32Array) {
                this.float32Data[dataIndex] = null;
            } else {
                this.data[dataIndex] = null;
            }
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

        public getFloat32Array(entityId: number): Float32Array | null {
            if (this.storageMode !== StorageMode.Float32Array) {
                console.error("ComponentManager 未使用 Float32ArrayStorage 模式");
                return null;
            }

            const dataIndex = this.entityToDataIndex.get(entityId);
            if (dataIndex === undefined) {
                return null;
            }
            return this.float32Data[dataIndex];
        }
    }

    export function float32Property() {
        return (target: any, propertyKey: string) => {
            target[propertyKey] = target[propertyKey] || {};
            target[propertyKey].isFloat32Property = true;
        };
    }

    export function useFloat32ArrayStorage(target) {
        target.useFloat32ArrayStorage = true;
    }
}