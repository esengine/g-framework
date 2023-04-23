module gs {
    /**
     * 组件
     */
    export abstract class Component {
        protected _entityId: number | null = null;

        setEntityId(entityId: number) {
            this._entityId = entityId;
        }

        get entityId(): number {
            if (this._entityId === null) {
                throw new Error("Entity ID 还未被设置");
            }
            return this._entityId;
        }

        serialize(): any {
            const data: any = {};
            for (const key of Object.keys(this)) {
                const value = (this as any)[key];
                if (typeof value !== 'function') {
                    data[key] = value;
                }
            }

            return data;
        }

        deserialize(data: any): void {
            for (const key in data) {
                if ((this as any)[key] !== undefined) {
                    (this as any)[key] = data[key];
                }
            }
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
            let float32PropertyCount = 0;
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const isFloat32Property = componentClass.prototype[key] && componentClass.prototype[key].isFloat32Property;

                // 如果属性被标记为 Float32Array 存储，并且 ComponentManager 使用 Float32Array 存储模式
                if (isFloat32Property && manager.storageMode === StorageMode.Float32Array) {
                    const dataIndex = manager.allocateDataIndex();
                    Object.defineProperty(componentClass.prototype, key, {
                        get() {
                            return manager.getFloat32Array(entityId)[dataIndex];
                        },
                        set(value: any) {
                            const float32Array = manager.getFloat32Array(entityId);
                            float32Array[dataIndex] = value;
                        },
                        enumerable: true,
                        configurable: true,
                    });
                    float32PropertyCount++;
                } else {
                    // 使用原始的 Object 存储方式
                    const dataIndex = manager.allocateDataIndex();
                    Object.defineProperty(componentClass.prototype, key, {
                        get() {
                            return manager.get(entityId)[dataIndex];
                        },
                        set(value: any) {
                            manager.get(entityId)[dataIndex] = value;
                        },
                        enumerable: true,
                        configurable: true,
                    });
                }
            }

            if (componentClass["useFloat32ArrayStorage"]) {
                componentClass.prototype.float32PropertyCount = float32PropertyCount;
            }
        }
    }
}
