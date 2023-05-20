module gs {
    export class ComponentTypeManager {
        private static componentTypes: Map<Function, ComponentTypeInfo> = new Map();
        private static indexToComponentTypes: Map<number, Function> = new Map();
        private static nextIndex: number = 0;
    
        public static getIndexFor(componentType: new (...args: any[]) => Component): ComponentTypeInfo {
            let info = this.componentTypes.get(componentType);
            if (info === undefined) {
                info = new ComponentTypeInfo(this.nextIndex++, componentType);
                this.componentTypes.set(componentType, info);
                this.indexToComponentTypes.set(info.index, componentType);
            }
            return info;
        }
    
        public static getComponentTypeFor(index: number): Function | undefined {
            return this.indexToComponentTypes.get(index);
        }
    }
}