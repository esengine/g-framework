module gs {
    export class Node<T> {
        value: T;
        next: Node<T> | null = null;
        prev: Node<T> | null = null;

        constructor(value: T) {
            this.value = value;
        }
    }

    /**
     * 双向链表
     */
    export class LinkedList<T> {
        head: Node<T> | null = null;
        tail: Node<T> | null = null;

        append(value: T): Node<T> {
            const newNode = new Node(value);
            if (!this.head || !this.tail) {
                this.head = newNode;
                this.tail = newNode;
            } else {
                newNode.prev = this.tail;
                this.tail.next = newNode;
                this.tail = newNode;
            }
            return newNode;
        }

        remove(node: Node<T>): void {
            if (node.prev) {
                node.prev.next = node.next;
            } else {
                this.head = node.next;
            }

            if (node.next) {
                node.next.prev = node.prev;
            } else {
                this.tail = node.prev;
            }

            node.prev = null;
            node.next = null;
        }

        toArray(): T[] {
            const result = [];
            let current = this.head;
            while (current) {
                result.push(current.value);
                current = current.next;
            }
            return result;
        }
    }
}