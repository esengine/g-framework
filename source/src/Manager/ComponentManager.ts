module gs {
    export enum StorageMode {
        TypedArray,
        Object
    }

    export type ComponentConstructor<T extends Component> = {
        new(): T;
        useTypedArrayStorage?: boolean;
        defaultDataSize?: number;
        getPropertyStorageTypes(): Record<string, StorageType>;
    };

    /**
     * 组件管理器
     */
    export class ComponentManager<T extends Component> {
        private data: T[] = [];
        private entityToDataIndex: Map<number, number> = new Map();
        private freeDataIndices: number[] = [];
        public componentType: ComponentConstructor<T>;
        public storageMode: StorageMode;
        public typedStorage: Map<string, ArrayBufferView> = new Map();
        public dataSize: number;

        /**
         * ComponentManager 构造函数
         * @param componentType - 用于创建和管理的组件类型。
         * @param storageMode - 存储模式，可以是 StorageMode.TypedArray（默认值）或 StorageMode.Object。
         * @param dataSize - 存储数组的初始大小。当使用 TypedArray 存储时，会根据此值创建数据存储。默认值为 10。
         *
         * 用法示例：
         * const positionManager = new ComponentManager(PositionComponent);
         * const positionManagerWithObjectStorage = new ComponentManager(PositionComponent, StorageMode.Object);
         * const positionManagerWithCustomDataSize = new ComponentManager(PositionComponent, StorageMode.TypedArray, 50);
         */
        constructor(componentType: ComponentConstructor<T>, storageMode: StorageMode = StorageMode.Object, dataSize: number = 10) {
            this.storageMode = storageMode;
            this.componentType = componentType;
            this.dataSize = dataSize;
        }

        public create(entityId: number): T {
            const index = this.allocateDataIndex();
            const component = new this.componentType();
            component.setEntityId(entityId);
            ComponentManager.registerComponent(this.componentType, this, entityId);

            if (this.storageMode === StorageMode.TypedArray) {
                const propertyStorageTypes = this.componentType.getPropertyStorageTypes();
                for (const key in propertyStorageTypes) {
                    const storageType = propertyStorageTypes[key];
                    const storageKey = this.getStorageKey(entityId, storageType);
                    this.typedStorage.set(storageKey, new (getArrayConstructor(storageType))(component.constructor.prototype[`${storageType}PropertyCount`]));
                }
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
        public get(entityId: number): T | Record<string, any> | null {
            const dataIndex = this.entityToDataIndex.get(entityId);
            if (dataIndex === undefined) {
                return null;
            }
            if (this.storageMode === StorageMode.TypedArray) {
                const propertyStorageTypes = this.componentType.getPropertyStorageTypes();
                const result = {};
                for (const key in propertyStorageTypes) {
                    const storageType = propertyStorageTypes[key];
                    const storageKey = this.getStorageKey(entityId, storageType);
                    result[key] = (this.typedStorage.get(storageKey) as any)[dataIndex];
                }
                return result;
            } else {
                return this.data[dataIndex] || {}; // 确保始终返回一个对象
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

            if (this.storageMode === StorageMode.TypedArray) {
                const propertyStorageTypes = this.componentType.getPropertyStorageTypes();
                for (const key in propertyStorageTypes) {
                    const storageType = propertyStorageTypes[key];
                    const storageKey = this.getStorageKey(entityId, storageType);
                    this.typedStorage.delete(storageKey);
                }
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

        public getTypedArray(entityId: number, storageType: StorageType): ArrayBufferView {
            const key = this.getStorageKey(entityId, storageType);
            if (!this.typedStorage.has(key)) {
                switch (storageType) {
                    case StorageType.Int8:
                        this.typedStorage.set(key, new Int8Array(this.dataSize));
                        break;
                    case StorageType.Int16:
                        this.typedStorage.set(key, new Int16Array(this.dataSize));
                        break;
                    case StorageType.Int32:
                        this.typedStorage.set(key, new Int32Array(this.dataSize));
                        break;
                    case StorageType.Float32:
                        this.typedStorage.set(key, new Float32Array(this.dataSize));
                        break;
                    case StorageType.Float64:
                        this.typedStorage.set(key, new Float64Array(this.dataSize));
                        break;
                    case StorageType.Uint8:
                        this.typedStorage.set(key, new Uint8Array(this.dataSize));
                        break;
                    case StorageType.Uint16:
                        this.typedStorage.set(key, new Uint16Array(this.dataSize));
                        break;
                    case StorageType.Uint32:
                        this.typedStorage.set(key, new Uint32Array(this.dataSize));
                        break;
                    case StorageType.Uint8Clamped:
                        this.typedStorage.set(key, new Uint8ClampedArray(this.dataSize));
                        break;
                }
            }
            return this.typedStorage.get(key) as ArrayBufferView;
        }

        private getStorageKey(entityId: number, storageType: StorageType): string {
            return `${entityId}_${storageType}`;
        }

        /**
         * 注册组件
         * @param componentClass 
         * @param manager 
         */
        public static registerComponent<T extends Component>(
            componentClass: new (...args: any[]) => T,
            manager: ComponentManager<T>,
            entityId: number
        ) {
            const componentInstance = new componentClass();
            const keys = Object.keys(componentInstance);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                Component.registeredProperties.add(key);
                const storageType = componentClass.prototype[key] && componentClass.prototype[key].storageType;

                // 如果属性被标记为 TypedArray 存储，并且 ComponentManager 使用 TypedArray 存储模式
                if (storageType && manager.storageMode === StorageMode.TypedArray) {
                    const dataIndex = manager.allocateDataIndex();
                    const storageKey = manager.getStorageKey(entityId, storageType);
                    
                    if (!manager.typedStorage.has(storageKey)) { // 如果存储中没有相应的键，则创建一个新的TypedArray
                        manager.typedStorage.set(storageKey, new (getArrayConstructor(storageType))(manager.dataSize));
                      }
                    
                    Object.defineProperty(componentClass.prototype, key, {
                        get() {
                            return manager.typedStorage.get(storageKey)[dataIndex];
                        },
                        set(value: any) {
                            manager.typedStorage.get(storageKey)[dataIndex] = value;
                        },
                        enumerable: true,
                        configurable: true,
                    });
                } else {
                    // 使用原始的 Object 存储方式
                    const dataIndex = manager.allocateDataIndex();
                    Object.defineProperty(componentClass.prototype, key, {
                        get() {
                            return manager.get(dataIndex)[key];
                        },
                        set(value: any) {
                            manager.get(dataIndex)[key] = value;
                        },
                        enumerable: true,
                        configurable: true,
                    });
                }
            }
        }
    }

    export function typedProperty(storageType: StorageType): PropertyDecorator {
        return (target: Object, propertyKey: string | symbol) => {
            target[propertyKey] = target[propertyKey] || {};
            target[propertyKey].storageType = storageType;
        };
    }

    export function useTypedArrayStorage(target) {
        target.useTypedArrayStorage = true;
    }

    export function getArrayConstructor(storageType: StorageType): new (length?: number) => ArrayBufferView {
        switch (storageType) {
            case StorageType.Float32:
                return Float32Array;
            case StorageType.Int32:
                return Int32Array;
            case StorageType.Uint32:
                return Uint32Array;
            case StorageType.Uint16:
                return Uint16Array;
            case StorageType.Uint8:
                return Uint8Array;
            case StorageType.Uint8Clamped:
                return Uint8ClampedArray;
            case StorageType.Int16:
                return Int16Array;
            case StorageType.Int8:
                return Int8Array;
            case StorageType.Float64:
                return Float64Array;
            default:
                throw new Error(`不支持 storageType: ${storageType}`);
        }
    }
}