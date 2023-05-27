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

    export function calcBounds(node: DynamicTreeNode, toBounds: (item: any) => Bounds): void {
        distBounds(node, 0, node.children.length, toBounds, node);
    }

    export function distBounds(node: DynamicTreeNode, k: number, p: number, toBounds: (item: any) => Bounds, destNode?: DynamicTreeNode): DynamicTreeNode {
        if (!destNode) {
            destNode = createNode(null);
        }
        destNode.bounds = new BoxBounds(Vector2.zero(), new FixedPoint(), new FixedPoint(), null);

        let minX = FixedPoint.from(Infinity);
        let minY = FixedPoint.from(Infinity);
        let maxX = FixedPoint.from(-Infinity);
        let maxY = FixedPoint.from(-Infinity);

        for (let i = k; i < p; i++) {
            const child = node.children[i];
            const bounds = toBounds(child);
            minX = FixedPoint.min(minX, bounds.position.x);
            minY = FixedPoint.min(minY, bounds.position.y);
            maxX = FixedPoint.max(maxX, bounds.position.x.add(bounds.width));
            maxY = FixedPoint.max(maxY, bounds.position.y.add(bounds.height));
        }

        // 创建一个新的Bounds对象
        const newBounds = new BoxBounds(
            new Vector2(minX.toFloat(), minY.toFloat()),
            maxX.sub(minX),
            maxY.sub(minY),
            destNode.bounds.entity
        );

        // 设置destNode的Collider的Bounds
        destNode.bounds = newBounds;

        return destNode;
    }

    export function extend(a: Bounds, b: Bounds): Bounds {
        const minX = FixedPoint.min(a.position.x, b.position.x);
        const minY = FixedPoint.min(a.position.y, b.position.y);
        const maxX = FixedPoint.max(a.position.x.add(a.width), b.position.x.add(b.width));
        const maxY = FixedPoint.max(a.position.y.add(a.height), b.position.y.add(b.height));

        a.position.x = minX;
        a.position.y = minY;
        a.width = maxX.sub(minX);
        a.height = maxY.sub(minY);

        return a;
    }

    export function compareNodeMinX(a: DynamicTreeNode, b: DynamicTreeNode): FixedPoint {
        return a.bounds.position.x.sub(b.bounds.position.x);
    }

    export function compareNodeMinY(a: DynamicTreeNode, b: DynamicTreeNode): FixedPoint {
        return a.bounds.position.y.sub(b.bounds.position.y);
    }

    export function boundsArea(a: DynamicTreeNode): FixedPoint  {
        const bounds = a.bounds;
        return bounds.width.mul(bounds.height);
    }

    export function boundsMargin(a: DynamicTreeNode): FixedPoint  {
        const bounds = a.bounds;
        return bounds.width.add(bounds.height);
    }

    export function enlargedArea(a: Bounds, b: Bounds): FixedPoint  {
        return (FixedPoint.max(b.position.x.add(b.width), a.position.x.add(a.width)).sub(FixedPoint.min(b.position.x, a.position.x)))
        .mul(FixedPoint.max(b.position.y.add(b.height), a.position.y.add(a.height)).sub(FixedPoint.min(b.position.y, a.position.y)));
    }

    export function intersectionArea(a: Bounds, b: Bounds): FixedPoint  {
        const minX = FixedPoint.max(a.position.x, b.position.x);
        const minY = FixedPoint.max(a.position.y, b.position.y);
        const maxX = FixedPoint.min(a.position.x.add(a.width), b.position.x.add(b.width));
        const maxY = FixedPoint.min(a.position.y.add(a.height), b.position.y.add(b.height));
    
        return FixedPoint.max(FixedPoint.from(0), maxX.sub(minX))
            .mul(FixedPoint.max(FixedPoint.from(0), maxY.sub(minY)));
    }

    export function createNode(children: DynamicTreeNode[]): DynamicTreeNode {
        return {
            children,
            height: 1,
            leaf: true,
            bounds: new BoxBounds(Vector2.zero(), new FixedPoint(), new FixedPoint(), null)
        };
    }


    export function multiSelect<T>(arr: T[], left: number, right: number, n: number, compare: (a: T, b: T) => FixedPoint): void {
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

    export function quickselect<T>(arr: T[], k: number, left: number, right: number, compare: (a: T, b: T) => FixedPoint): void {
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
            if (compare(arr[right], t).gt(0)) {
                swap(arr, left, right);
            }

            while (i < j) {
                swap(arr, i, j);
                i++;
                j--;
                while (compare(arr[i], t).lt(0)) {
                    i++;
                }
                while (compare(arr[j], t).gt(0)) {
                    j--;
                }
            }

            if (compare(arr[left], t).equals(0)) {
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