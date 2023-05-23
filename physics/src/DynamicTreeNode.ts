module gs.physics {
    export interface DynamicTreeNode {
        children: DynamicTreeNode[];
        height: number;
        leaf: boolean;
        collider: Collider;
    }
}