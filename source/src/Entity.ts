module gs {
    export class Entity {
        private id: number;
        private componentManagers: Map<Function, ComponentManager<any>>;

        constructor(id: number, componentManagers: Map<new (entityId: number) => Component, ComponentManager<any>>) {
            this.id = id;
            this.componentManagers = componentManagers;
        }

        public getId(): number {
            return this.id;
        }

        /**
         * 添加组件
         * @param componentType 
         * @returns 
         */
        public addComponent<T extends Component>(componentType: new (entityId: number) => T): T {
            const manager = this.componentManagers.get(componentType);
            if (!manager) {
                throw new Error(`组件类型为 ${componentType.name} 的组件管理器未找到.`);
            }
            return manager.create(this.id);
        }

        /**
         * 获取组件
         * @param componentType 
         * @returns 
         */
        public getComponent<T extends Component>(componentType: new (entityId: number) => T): T | null {
            const manager = this.componentManagers.get(componentType);
            if (!manager) {
                return null;
            }
            return manager.get(this.id);
        }

        /**
         * 移除组件
         * @param componentType 
         * @returns 
         */
        public removeComponent<T extends Component>(componentType: new (entityId: number) => T): void {
            const manager = this.componentManagers.get(componentType);
            if (!manager) {
                return;
            }
            manager.remove(this.id);
        }

        /**
         * 是否有组件
         * @param componentType 
         * @returns 
         */
        public hasComponent<T extends Component>(componentType: new (entityId: number) => T): boolean {
            const manager = this.componentManagers.get(componentType);
            return manager ? manager.has(this.id) : false;
        }

        /**
         * 序列化
         * @returns 
         */
        serialize(): any {
            const serializedEntity: any = {
                id: this.id,
                components: {},
            };

            for (const [componentType, manager] of this.componentManagers) {
                const component = manager.get(this.id) as Component;
                if (component) {
                    serializedEntity.components[componentType.name] = component.serialize();
                }
            }

            return serializedEntity;
        }

        /**
         * 反序列化
         * @param data 
         */
        deserialize(data: any): void {
            for (const componentName in data.components) {
                for (const [componentType, manager] of this.componentManagers) {
                    if (componentType.name === componentName) {
                        const component = manager.get(this.id) as Component;
                        if (component) {
                            component.deserialize(data.components[componentName]);
                        }
                        break;
                    }
                }
            }
        }
    }
}
