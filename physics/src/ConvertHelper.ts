module gs.physics {
    export function findItem<T>(item: T, items: T[], equalsFn?: (a: T, b: T) => boolean): number {
        if (!equalsFn) {
            return items.indexOf(item);
        }

        for (let i = 0; i < items.length; i++) {
            if (equalsFn(item, items[i])) {
                return i;
            }
        }
        return -1;
    }

    export function calcBounds(node: DynamicTreeNode, toBounds: (item: any) => Collider): void {
        distBounds(node, 0, node.children.length, toBounds, node);
    }

    export function distBounds(node: DynamicTreeNode, k: number, p: number, toCollider: (item: any) => Collider, destNode?: DynamicTreeNode): DynamicTreeNode {
        if (!destNode) {
            destNode = createNode(null);
        }
        destNode.collider = new Collider();

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        for (let i = k; i < p; i++) {
            const child = node.children[i];
            const collider = toCollider(child);
            minX = Math.min(minX, collider.bounds.position.x.toFloat());
            minY = Math.min(minY, collider.bounds.position.y.toFloat());
            maxX = Math.max(maxX, collider.bounds.position.x.toFloat() + collider.bounds.width.toFloat());
            maxY = Math.max(maxY, collider.bounds.position.y.toFloat() + collider.bounds.height.toFloat());
        }

        // 创建一个新的Bounds对象
        const newBounds = new BoxBounds(
            new Vector2(minX, minY),
            new FixedPoint(maxX - minX),
            new FixedPoint(maxY - minY),
            destNode.collider.entity
        );

        // 设置destNode的Collider的Bounds
        destNode.collider.setBounds(newBounds);

        return destNode;
    }

    export function extend(a: Bounds, b: Bounds): Bounds {
        const minX = Math.min(a.position.x.toFloat(), b.position.x.toFloat());
        const minY = Math.min(a.position.y.toFloat(), b.position.y.toFloat());
        const maxX = Math.max(a.position.x.toFloat() + a.width.toFloat(), b.position.x.toFloat() + b.width.toFloat());
        const maxY = Math.max(a.position.y.toFloat() + a.height.toFloat(), b.position.y.toFloat() + b.height.toFloat());
    
        a.position.x = new FixedPoint(minX);
        a.position.y = new FixedPoint(minY);
        a.width = new FixedPoint(maxX - minX);
        a.height = new FixedPoint(maxY - minY);
    
        return a;
    }

    export function compareNodeMinX(a: DynamicTreeNode, b: DynamicTreeNode): number {
        return a.collider.getBounds().position.x.toFloat() - b.collider.getBounds().position.x.toFloat();
    }
    
    export function compareNodeMinY(a: DynamicTreeNode, b: DynamicTreeNode): number {
        return a.collider.getBounds().position.y.toFloat() - b.collider.getBounds().position.y.toFloat();
    }
    
    export function boundsArea(a: DynamicTreeNode): number {
        const bounds = a.collider.getBounds();
        return bounds.width.toFloat() * bounds.height.toFloat();
    }
    
    export function boundsMargin(a: DynamicTreeNode): number {
        const bounds = a.collider.getBounds();
        return bounds.width.toFloat() + bounds.height.toFloat();
    }

    export function enlargedArea(a: Bounds, b: Bounds): number {
        return (Math.max(b.position.x.toFloat() + b.width.toFloat(), a.position.x.toFloat() + a.width.toFloat()) - Math.min(b.position.x.toFloat(), a.position.x.toFloat())) *
            (Math.max(b.position.y.toFloat() + b.height.toFloat(), a.position.y.toFloat() + a.height.toFloat()) - Math.min(b.position.y.toFloat(), a.position.y.toFloat()));
    }

    export function intersectionArea(a: Bounds, b: Bounds): number {
        const minX = Math.max(a.position.x.toFloat(), b.position.x.toFloat());
        const minY = Math.max(a.position.y.toFloat(), b.position.y.toFloat());
        const maxX = Math.min(a.position.x.toFloat() + a.width.toFloat(), b.position.x.toFloat() + b.width.toFloat());
        const maxY = Math.min(a.position.y.toFloat() + a.height.toFloat(), b.position.y.toFloat() + b.height.toFloat());
    
        return Math.max(0, maxX - minX) *
            Math.max(0, maxY - minY);
    }

    export function createNode(children: DynamicTreeNode[]): DynamicTreeNode {
        return {
            children,
            height: 1,
            leaf: true,
            collider: new Collider()
        };
    }
    

    export function multiSelect<T>(arr: T[], left: number, right: number, n: number, compare: (a: T, b: T) => number): void {
        const stack = [left, right];

        while (stack.length) {
            right = stack.pop();
            left = stack.pop();

            if (right - left <= n) {
                continue;
            }

            const mid = left + Math.ceil((right - left) / n / 2) * n;
            quickselect(arr, mid, left, right, compare);

            stack.push(left, mid, mid, right);
        }
    }

    export function quickselect<T>(arr: T[], k: number, left: number, right: number, compare: (a: T, b: T) => number): void {
        while (right > left) {
            if (right - left > 600) {
                const n = right - left + 1;
                const m = k - left + 1;
                const z = Math.log(n);
                const s = 0.5 * Math.exp(2 * z / 3);
                const sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * Math.sign(m - n / 2);
                const newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
                const newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
                quickselect(arr, k, newLeft, newRight, compare);
            }

            const t = arr[k];
            let i = left;
            let j = right;

            swap(arr, left, k);
            if (compare(arr[right], t) > 0) {
                swap(arr, left, right);
            }

            while (i < j) {
                swap(arr, i, j);
                i++;
                j--;
                while (compare(arr[i], t) < 0) {
                    i++;
                }
                while (compare(arr[j], t) > 0) {
                    j--;
                }
            }

            if (compare(arr[left], t) === 0) {
                swap(arr, left, j);
            } else {
                j++;
                swap(arr, j, right);
            }

            if (j <= k) {
                left = j + 1;
            }
            if (k <= j) {
                right = j - 1;
            }
        }
    }

    export function swap<T>(arr: T[], i: number, j: number): void {
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}