module gs.physics {
    export interface DynamicTreeNode {
        children: DynamicTreeNode[];
        height: number;
        leaf: boolean;
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
    }
}