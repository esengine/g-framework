module gs {
    /**
     * 组件
     */
    export abstract class Component {
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
         * 组件添加到实体时的逻辑
         * @param entity 
         */
        onAttach(entity: Entity) {
            
        }
    
        /**
         * 组件从实体移除时的逻辑
         * @param entity 
         */
        onDetach(entity: Entity) {
        
        }

        /**
         * 注册组件
         * @param componentClass 
         * @param manager 
         */
        public static registerComponent<T extends Component>(componentClass: new (...args: any[]) => T, manager: ComponentManager<T>) {
            const componentInstance = new componentClass();
            const keys = Object.keys(componentInstance);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const descriptor = Object.getOwnPropertyDescriptor(componentClass.prototype, key);
                if (descriptor && typeof descriptor.get === 'function' && typeof descriptor.set === 'function') {
                    const dataIndex = manager.allocateDataIndex();
                    Object.defineProperty(componentClass.prototype, key, {
                        get() {
                            return manager.get(this.entityId)[dataIndex];
                        },
                        set(value: any) {
                            manager.get(this.entityId)[dataIndex] = value;
                        },
                        enumerable: true,
                        configurable: true,
                    });
                }
            }
        }
    }
}
