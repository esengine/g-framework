module gs {
    /**
     * 组件
     */
    export abstract class Component {
        private _entityId: number | null = null;

        setEntityId(entityId: number) {
            this._entityId = entityId;
        }

        getEntityId() {
            return this._entityId;
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
         * 判断是否需要序列化的方法
         * @returns 默认返回 true，表示需要序列化
         */
        shouldSerialize(): boolean {
            return true;
        }


        /**
         * 清除数据方法，用于组件池在重用时
         */
        public reset(): void {
            this._entityId = null;
        }
    }
}
