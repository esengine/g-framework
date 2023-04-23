module gs {
    /**
     * 组件
     */
    export abstract class Component {
        protected _entityId: number | null = null;
        public static registeredProperties: Set<string> = new Set();
        public static defaultDataSize: number = 10;

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

        public static getPropertyStorageTypes(): Record<string, StorageType> {
            const properties = {};
            const prototype = this.prototype;
            const keys = Object.keys(prototype);

            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (!Component.registeredProperties.has(key) && prototype[key] !== undefined) {
                    const storageType = prototype[key].storageType;
                    if (storageType) {
                        properties[key] = storageType;
                    }
                }
            }

            return properties;
        }
    }
}
