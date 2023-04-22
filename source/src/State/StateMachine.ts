module gs {
    export interface State {
        enter?(): void;
        exit?(): void;
        update?(): void;
    }

    export class StateMachine {
        private currentState: State | null;
        private states: Map<string, State>;

        constructor() {
            this.currentState = null;
            this.states = new Map();
        }

        addState(name: string, state: State): void {
            this.states.set(name, state);
        }

        changeState(name: string): void {
            if (!this.states.has(name)) {
                console.warn(`状态 "${name}" 不存在.`);
                return;
            }

            const newState = this.states.get(name) as State;
            if (this.currentState && this.currentState.exit) {
                this.currentState.exit();
            }

            this.currentState = newState;
            if (this.currentState.enter) {
                this.currentState.enter();
            }
        }

        update(): void {
            if (this.currentState && this.currentState.update) {
                this.currentState.update();
            }
        }
    }
}
