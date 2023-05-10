module gs {
    /**
     * 定义一个实体匹配器类。
     */
    export class Matcher {
        protected allSet: (new (...args: any[]) => Component)[] = [];
        protected exclusionSet: (new (...args: any[]) => Component)[] = [];
        protected oneSet: (new (...args: any[]) => Component)[] = [];

        public static empty() {
            return new Matcher();
        }

        public getAllSet() {
            return this.allSet;
        }

        public getExclusionSet() {
            return this.exclusionSet;
        }

        public getOneSet() {
            return this.oneSet;
        }

        public isInterestedEntity(e: Entity) {
            return this.isInterested(e.componentBits);
        }

        public isInterested(components: Bits) {
            return this.checkAllSet(components) && this.checkExclusionSet(components) && this.checkOneSet(components);
        }

        private checkAllSet(components: Bits): boolean {
            for (const type of this.allSet) {
                if (!components.get(ComponentTypeManager.getIndexFor(type))) {
                    return false;
                }
            }
            return true;
        }
    
        private checkExclusionSet(components: Bits): boolean {
            for (const type of this.exclusionSet) {
                if (components.get(ComponentTypeManager.getIndexFor(type))) {
                    return false;
                }
            }
            return true;
        }
    
        private checkOneSet(components: Bits): boolean {
            if (this.oneSet.length === 0) {
                return true;
            }
    
            for (const type of this.oneSet) {
                if (components.get(ComponentTypeManager.getIndexFor(type))) {
                    return true;
                }
            }
            return false;
        }

        /**
        * 添加所有包含的组件类型。
        * @param types 所有包含的组件类型列表
        */
        public all(...types: (new (...args: any[]) => Component)[]): Matcher {
            this.allSet.push(...types);
            return this;
        }

        /**
         * 添加排除包含的组件类型。
         * @param types 排除包含的组件类型列表
         */
        public exclude(...types: (new (...args: any[]) => Component)[]): Matcher {
            this.exclusionSet.push(...types);
            return this;
        }

        /**
         * 添加至少包含其中之一的组件类型。
         * @param types 至少包含其中之一的组件类型列表
         */
        public one(...types: (new (...args: any[]) => Component)[]): Matcher {
            this.oneSet.push(...types);
            return this;
        }
    }
}