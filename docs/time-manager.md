# TimeManager

`TimeManager` 是 G-Framework 中用于管理时间的模块。它提供了一些常用的时间属性和方法，如 `deltaTime`，`timeScale` 和 `totalTime`，以便于在游戏中进行帧事件的处理。

## 使用方法

首先，获取 `TimeManager` 的实例：

```typescript
const timeManager = gs.TimeManager.getInstance();
```

在游戏循环中更新 TimeManager：

```typescript
timeManager.update(deltaTime);
```

在 SystemManager 的 update 方法中，框架内部会自动使用 TimeManager 提供的 deltaTime。

## 属性

以下是 TimeManager 的主要属性：

- `deltaTime`: 当前帧与上一帧之间的时间间隔，考虑了 timeScale。
- `timeScale`: 时间缩放系数，用于控制游戏速度。设置为 1 表示正常速度，设置为 0 表示暂停游戏。
- `totalTime`: 自游戏开始以来经过的总时间。

## 示例

以下是一个示例，展示如何使用 TimeManager 控制游戏速度：

```ts
// 设置 timeScale 为 0.5，游戏速度变为原来的一半
timeManager.timeScale = 0.5;

// 设置 timeScale 为 2，游戏速度加倍
timeManager.timeScale = 2;

// 设置 timeScale 为 0，暂停游戏
timeManager.timeScale = 0;
```

通过使用 TimeManager，您可以轻松地在 G-Framework 中实现对时间的管理。
