module gs {
    export class ComponentTypeInfo {
        public readonly index: number;
        public readonly type: new (...args: any[]) => Component;
        public readonly parents: ComponentTypeInfo[];
        public readonly allAncestors: number[];
    
        constructor(index: number, type: new (...args: any[]) => Component) {
            this.index = index;
            this.type = type;
            this.parents = [];
            this.allAncestors = [index];
    
            let parent = Object.getPrototypeOf(type.prototype);
            while (parent && parent !== Object.prototype) {
                const parentInfo = ComponentTypeManager.getIndexFor(parent.constructor as new (...args: any[]) => Component);
                this.parents.push(parentInfo);
                this.allAncestors.push(...parentInfo.allAncestors);
                parent = Object.getPrototypeOf(parent);
            }
    
            this.allAncestors = [...new Set(this.allAncestors)];
        }
    }
}