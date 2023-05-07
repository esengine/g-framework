# 游戏同步策略

游戏同步策略是一个轻量级扩展库，帮助游戏开发者实现多种同步策略，包括状态插值、状态压缩等。通过使用 SyncStrategyManager 类来管理选择的同步策略，可以更方便地切换同步策略实现。以下是一些简要说明和如何使用游戏同步策略框架的示例。

### SyncStrategyManager

SyncStrategyManager 是一个同步策略管理器，它接收一个实现了 ISyncStrategy 接口的策略实例作为参数。它提供了发送状态、接收状态、处理状态更新和设置策略的方法。

1. 创建一个 SyncStrategyManager 实例，并提供一个同步策略实现，比如 SnapshotInterpolationStrategy:

```ts
const syncStrategy = new gs.SnapshotInterpolationStrategy();
const strategyManager = new gs.SyncStrategyManager(syncStrategy);
```

2. 使用同步策略管理器执行发送状态、接收状态、处理状态更新等方法：

```ts
// 发送状态
strategyManager.sendState(state);

// 接收状态
strategyManager.receiveState(state);

// 处理状态更新
strategyManager.handleStateUpdate(deltaTime);
```

3. 如果需要更改同步策略实现，可以使用 setStrategy 方法：

```ts
// 创建一个新的策略实现
const newStrategy = new gs.StateCompressionStrategy();
// 设置新策略实现
strategyManager.setStrategy(newStrategy);
```

在实际应用中，您可以根据游戏的需求选择合适的同步策略，同时也可以在运行时更改同步策略。通过使用 SyncStrategyManager 管理同步策略，可以让您的代码更加灵活和易于扩展。

## 策略介绍

1. `SnapshotInterpolationStrategy`：基于快照的插值同步策略，适用于使用实体位置、旋转、缩放等属性进行插值的游戏。框架内部提供必要的钩子和事件，让用户可以根据实际项目需求实现自定义的实体状态插值逻辑。

2. `StateCompressionStrategy`：状态压缩同步策略，适用于需要减少网络传输数据量的场景。框架允许用户提供自定义的游戏状态压缩和解压缩方法，以降低网络传输负载。

## 使用方法

### SnapshotInterpolationStrategy

1. 创建一个 SnapshotInterpolationStrategy 实例：

```ts
const syncStrategy = new gs.SnapshotInterpolationStrategy();
```

2. 为实例提供自定义插值逻辑：

```ts
syncStrategy.onInterpolation = (prevSnapshot, nextSnapshot, progress) => {
  // 用户实现自定义实体插值逻辑
  // 例如：根据实体的类型更新位置、旋转、缩放等属性
};
```

### StateCompressionStrategy

1. 创建一个 StateCompressionStrategy 实例：

```ts
const syncStrategy = new gs.StateCompressionStrategy();
```

2. 为实例提供自定义压缩逻辑：

```ts
syncStrategy.onCompressState = (state) => {
  // 使用合适的压缩方法将游戏状态进行压缩，返回压缩后的状态
};
```

3. 为实例提供自定义解压缩逻辑：

```ts
syncStrategy.onDecompressState = (compressedState) => {
  // 使用合适的解压缩方法将压缩状态恢复为原始游戏状态，返回解压缩后的状态
  // 例如：使用LZ-string库实现游戏状态压缩
  return LZString.compressToUTF16(JSON.stringify(state));
};
```

4. 为实例提供发送和接收状态更新的逻辑：

```ts
syncStrategy.onSendState = (compressedState) => {
  // 在这里执行发送压缩状态的逻辑，例如使用网络库将压缩后的游戏状态发送给服务器或其他客户端
  // 例如：使用LZ-string 实现游戏状态解压缩
  return JSON.parse(LZString.decompressFromUTF16(compressedState));
};

syncStrategy.onReceiveState = (decompressedState) => {
  // 在这里执行接收状态后的逻辑，例如使用解压缩后的状态更新游戏状态
};
```

5. 如果需要，为实例提供处理状态更新时执行的自定义操作：

```ts
syncStrategy.handleStateUpdate = (state) => {
  // 在这里执行自定义操作，例如日志记录、错误检测等
};
```

## 注意事项

框架的目标是提供通用的接口和事件，以便根据实际游戏需求实现不同的同步策略。在使用框架时，请确保适当地适应您的游戏逻辑和数据结构。