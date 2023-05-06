# 输入管理器

`InputManager` 是游戏同步框架的一个核心组件，它负责处理和管理输入事件。通过使用适配器模式，您可以轻松地将 `InputManager` 与您选择的游戏引擎或平台集成在一起。

## 用途

InputManager 的主要功能包括：

- 管理输入缓冲区
- 处理输入事件
- 存储输入历史记录

## 自定义输入适配器

要将 InputManager 集成到您的游戏引擎中，需要创建一个自定义的 `InputAdapter`，使得游戏引擎的输入事件可以转换为框架所需的 InputEvent 格式。下面是一个示例，演示如何为一个游戏引擎创建自定义适配器：


```ts
class CustomInputAdapter extends gs.InputAdapter {
    constructor(inputManager: gs.InputManager) {
        super(inputManager);
    }

    handleInputEvent(event: any): void {
        // 转换游戏引擎的输入事件为框架需要的 InputEvent
        const inputEvent: gs.InputEvent = {
            type: event.type, // 用户自定义的输入类型，如键盘按键或鼠标移动
            data: event.data // 输入事件的相关数据，例如按键的键码或鼠标的坐标
        };

        // 将转换后的 InputEvent 传递给 InputManager
        this.sendInputToManager(inputEvent);
    }
}
```

## 使用自定义输入适配器和 InputManager

接下来，实例化 InputManager 并将自定义的 InputAdapter 设置为其适配器。下面的示例展示了如何在游戏中实现这一过程：

```ts
// 创建 EntityManager 实例
const entityManager = new gs.EntityManager(/* 传入您的 ComponentManager 实例列表 */);

// 从 EntityManager 获取 InputManager
const inputManager = entityManager.getInputManager();

// 创建自定义输入适配器实例
const customInputAdapter = new CustomInputAdapter(inputManager);

// 将自定义输入适配器设置为 InputManager 的适配器
inputManager.setAdapter(customInputAdapter);
```

现在，在游戏引擎中的输入事件将通过自定义 InputAdapter 处理，并自动传递给 InputManager。InputManager 将存储输入历史记录以供客户端进行预测和回滚。

> 更多关于输入适配器的详细信息，请查看 [输入适配器](custom-input-adapter.md)

## 小贴士

在实际开发中，应该根据所使用的游戏引擎和输入设备事件类型去自定义 `InputEvent` 接口，使其符合实际需求。同时，可以根据实际项目需求对 `InputAdapter` 进行扩展和优化，提高可扩展性与维护性。