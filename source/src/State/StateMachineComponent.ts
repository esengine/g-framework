///<reference path="../Core/Component.ts" />
module gs {
    export class StateMachineComponent extends Component {
        stateMachine: StateMachine;

        constructor() {
            super();
            this.stateMachine = new StateMachine();
        }
    }
}
