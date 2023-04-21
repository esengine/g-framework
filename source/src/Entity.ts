module gs {
    export class Entity {
        public id: number;
        private components: Map<string, Component>;

        constructor(id: number) {
            this.id = id;
            this.components = new Map();
        }

        /**
         * 添加组件
         * @param component 
         * @returns 
         */
        addComponent(component: Component): this {
            this.components.set(component.constructor.name, component);
            return this;
        }

        /**
         * 移除组件
         * @param componentType 
         * @returns 
         */
        removeComponent(componentType: Function): this {
            this.components.delete(componentType.name);
            return this;
        }

        /**
         * 获取组件
         * @param componentType 
         * @returns 
         */
        getComponent<T extends Component>(componentType: new () => T): T | null {
            const componentName = componentType.name;
            return this.components.has(componentName) ? this.components.get(componentName) as T : null;
        }

        /**
         * 是否有组件
         * @param componentType 
         * @returns 
         */
        public hasComponent<T extends Component>(componentType: new () => T): boolean {
            return this.components.has(componentType.name);
        }

        /**
         * 序列化
         * @returns 
         */
        serialize(): any {
            const serializedComponents = {};
            for (const [key, component] of this.components) {
                serializedComponents[key] = component.serialize();
            }

            return {
                id: this.id,
                components: serializedComponents,
            };
        }

        /**
         * 反序列化
         * @param data 
         */
        deserialize(data: any): void {
            this.id = data.id;
            for (const key in data.components) {
                if (this.components.has(key)) {
                    this.components.get(key).deserialize(data.components[key]);
                }
            }
        }
    }
}
