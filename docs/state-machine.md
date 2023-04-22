# StateMachine

`StateMachine` 是 G-Framework 中用于管理状态的通用模块。它允许您为游戏对象定义不同的状态，并在它们之间轻松地切换。

## 使用方法

首先，创建一个新的状态机实例：

```typescript
const stateMachine = new gs.StateMachine();
```

接下来，创建并添加自定义状态：

```ts
class IdleState extends gs.State {
  enter() {
    console.log("Entering idle state");
  }

  exit() {
    console.log("Exiting idle state");
  }
}

stateMachine.addState("idle", new IdleState());
```

在游戏循环中更新状态机：

```ts
stateMachine.update(deltaTime);
```

使用 setState 方法切换到不同的状态：

```ts
stateMachine.setState("idle");
```

## State

所有状态都应继承自 gs.State 基类。自定义状态应实现以下方法：

- `enter`: 当状态被激活时调用。
- `exit`: 当状态被离开时调用。

您可以在这些方法中实现状态特定的逻辑，例如改变游戏对象的动画、行为等。

## 示例

以下是一个示例，展示如何使用 StateMachine 实现游戏角色的不同行为:

```ts
class WalkingState extends gs.State {
  enter() {
    console.log("Entering walking state");
  }

  exit() {
    console.log("Exiting walking state");
  }
}

class JumpingState extends gs.State {
  enter() {
    console.log("Entering jumping state");
  }

  exit() {
    console.log("Exiting jumping state");
  }
}

stateMachine.addState("walking", new WalkingState());
stateMachine.addState("jumping", new JumpingState());

// 切换到行走状态
stateMachine.setState("walking");

// 切换到跳跃状态
stateMachine.setState("jumping");
```

通过使用 StateMachine，您可以轻松地在 G-Framework 中实现游戏对象的状态管理