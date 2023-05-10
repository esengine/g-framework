module gs {
    export class ComponentTypeManager {
        private static componentTypes: Map<Function, number> = new Map();
        private static nextIndex: number = 0;

        public static getIndexFor(componentType: new (...args: any[]) => Component): number {
            let index = this.componentTypes.get(componentType);
            if (index === undefined) {
                index = this.nextIndex++;
                this.componentTypes.set(componentType, index);
            }
            return index;
        }
    }
}