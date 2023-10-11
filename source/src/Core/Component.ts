module gs {
    /**
     * 组件
     */
    export abstract class Component {
        private _entity: Entity;
        private _version: number = 0;
        private _entityManager: EntityManager;

        public dependencies: ComponentConstructor<Component>[] = [];

        setEntity(entity: Entity, entityManager: EntityManager) {
            this._entity = entity;
            this._entityManager = entityManager;
        }

        get entityId(): number {
            return this.entity.getId();
        }

        get entity(): Entity {
            return this._entity;
        }

        get version(): number {
            return this._version;
        }

        /**
         * 标记组件已更新的方法
         * 通过增加 _version 的值来表示组件已更新
         */
        markUpdated(version: number): void {
            this._version = version;
        }

        /**
         * 重置组件的状态并进行必要的初始化
         * @param entity 
         * @param entityManager 
         */
        reinitialize(entity: Entity, entityManager: EntityManager): void { }

        /**
         * 当组件初始化的时候调用
         * @param args 
         */
        onInitialize(...args: any[]) { }

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
         * 判断是否需要序列化的方法
         * @returns 默认返回 true，表示需要序列化
         */
        shouldSerialize(): boolean {
            return true;
        }


        /**
         * 清除数据方法，用于组件池在重用时
         */
        public reset(): void { }

        /**
         * 默认的浅复制方法
         * @returns 克隆的组件实例
         */
        public cloneShallow(): Component {
            const clonedComponent = new (this.constructor as ComponentConstructor<Component>);
            for (const key in this) {
                if (this.hasOwnProperty(key)) {
                    (clonedComponent as any)[key] = (this as any)[key];
                }
            }
            return clonedComponent;
        }

        /**
         * 默认的深复制方法
         * 不处理循环引用
         * 如果需要循环引用请重写该方法
         * @returns 克隆的组件实例
         */
        public cloneDeep(): Component {
            const clonedComponent = new (this.constructor as ComponentConstructor<Component>);
            for (const key in this) {
                if (this.hasOwnProperty(key)) {
                    const value = (this as any)[key];
                    if (typeof value === 'object' && value !== null) {
                        (clonedComponent as any)[key] = this.deepCopy(value);
                    } else {
                        (clonedComponent as any)[key] = value;
                    }
                }
            }
            return clonedComponent;
        }

        /**
         * 深复制辅助函数
         * @param obj 
         * @returns 
         */
        private deepCopy(obj: any): any {
            if (Array.isArray(obj)) {
                return obj.map(element => this.deepCopy(element));
            } else if (typeof obj === 'object') {
                const newObj: any = {};
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        newObj[key] = this.deepCopy(obj[key]);
                    }
                }
                return newObj;
            } else {
                return obj;
            }
        }
    }
}
