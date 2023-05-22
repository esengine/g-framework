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

    export function calcBBox(node: DynamicTreeNode, toBBox: (item: any) => AABB): void {
        distBBox(node, 0, node.children.length, toBBox, node);
    }

    export function distBBox(node: DynamicTreeNode, k: number, p: number, toBBox: (item: any) => AABB, destNode?: DynamicTreeNode): DynamicTreeNode {
        if (!destNode) {
            destNode = createNode(null);
        }
        destNode.minX = Infinity;
        destNode.minY = Infinity;
        destNode.maxX = -Infinity;
        destNode.maxY = -Infinity;

        for (let i = k; i < p; i++) {
            const child = node.children[i];
            extend(destNode, node.leaf ? toBBox(child) : child);
        }

        return destNode;
    }

    export function extend(a: AABB, b: AABB): AABB {
        a.minX = Math.min(a.minX, b.minX);
        a.minY = Math.min(a.minY, b.minY);
        a.maxX = Math.max(a.maxX, b.maxX);
        a.maxY = Math.max(a.maxY, b.maxY);
        return a;
    }

    export function compareNodeMinX(a: DynamicTreeNode, b: DynamicTreeNode): number {
        return a.minX - b.minX;
    }

    export function compareNodeMinY(a: DynamicTreeNode, b: DynamicTreeNode): number {
        return a.minY - b.minY;
    }

    export function bboxArea(a: AABB): number {
        return (a.maxX - a.minX) * (a.maxY - a.minY);
    }

    export function bboxMargin(a: AABB): number {
        return (a.maxX - a.minX) + (a.maxY - a.minY);
    }

    export function enlargedArea(a: AABB, b: AABB): number {
        return (Math.max(b.maxX, a.maxX) - Math.min(b.minX, a.minX)) *
            (Math.max(b.maxY, a.maxY) - Math.min(b.minY, a.minY));
    }

    export function intersectionArea(a: AABB, b: AABB): number {
        const minX = Math.max(a.minX, b.minX);
        const minY = Math.max(a.minY, b.minY);
        const maxX = Math.min(a.maxX, b.maxX);
        const maxY = Math.min(a.maxY, b.maxY);

        return Math.max(0, maxX - minX) *
            Math.max(0, maxY - minY);
    }

    export function contains(a: AABB, b: AABB): boolean {
        return a.minX <= b.minX &&
            a.minY <= b.minY &&
            b.maxX <= a.maxX &&
            b.maxY <= a.maxY;
    }

    export function intersects(a: AABB, b: AABB): boolean {
        return b.minX <= a.maxX &&
            b.minY <= a.maxY &&
            b.maxX >= a.minX &&
            b.maxY >= a.minY;
    }

    export function createNode(children: DynamicTreeNode[]): DynamicTreeNode {
        return {
            children,
            height: 1,
            leaf: true,
            minX: Infinity,
            minY: Infinity,
            maxX: -Infinity,
            maxY: -Infinity
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