# 输入管理器

`InputManager` 是游戏同步框架的一个核心组件，它负责处理和管理输入事件。通过使用适配器模式，您可以轻松地将 `InputManager` 与您选择的游戏引擎或平台集成在一起。

## 用途

InputManager 的主要功能包括：

- 管理输入缓冲区
- 处理输入事件
- 存储输入历史记录

## 示例

首先，创建一个自定义的 `InputAdapter`，以便将您的游戏引擎或平台的输入事件转换为框架所需的 InputEvent 格式。在此示例中，我们将演示如何为一个虚构的游戏引擎创建自定义适配器。

```ts
class CustomInputAdapter extends gs.InputAdapter {
    constructor(inputManager: gs.InputManager) {
        super(inputManager);
    }

    handleInputEvent(event: any): void {
        // 转换游戏引擎的输入事件为框架需要的 InputEvent
        const inputEvent: InputEvent = {
            type: event.type,
            data: event.data
        };

        // 将转换后的 InputEvent 传递给 InputManager
        this.sendInputToManager(inputEvent);
    }
}
```

接下来，实例化 InputManager 并将自定义的 InputAdapter 设置为其适配器。

```ts
// 创建 EntityManager 实例
const entityManager = new gs.EntityManager(/* 传入您的 ComponentManager 实例列表 */);

// 从 EntityManager 获取 InputManager
const inputManager = entityManager.getInputManager();

// 创建自定义输入适配器
const customInputAdapter = new CustomInputAdapter(inputManager);
inputManager.setAdapter(customInputAdapter);
```

现在，您的游戏引擎中的输入事件将通过自定义 InputAdapter 处理，并自动传递给 InputManager。InputManager 将存储输入历史记录，以便在客户端进行预测和重演。

> 有关输入适配器的更多请查看 [输入适配器](custom-input-adapter.md)