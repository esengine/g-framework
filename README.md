# G-Framework

G-Framework 是一个基于 TypeScript 编写的实体组件系统（ECS）框架，旨在为游戏开发者提供一个高性能、易用、可扩展的游戏逻辑框架。G-Framework 可以与多种游戏引擎无缝集成，支持逻辑并发执行，让你的游戏开发变得更加高效。

# 核心优势

- 高性能：G-Framework 专为游戏开发场景优化，具备高性能数据处理能力，有效降低游戏性能损耗。

- 纯逻辑实现：无需依赖其他框架，G-Framework 让您专注于游戏逻辑，减少额外学习成本。

- 易用性：简洁的 API 和明确的组件和系统隔离设计，降低上手难度，提高开发效率。

- 跨平台支持：无论您使用哪种游戏引擎，G-Framework 都可以轻松集成，提供一致的开发体验。

- 可扩展性：通过模块化设计，方便开发者自由添加自定义模块，快速满足项目需求。

- 实时并发执行支持：G-Framework 支持逻辑并发执行，确保游戏中各个模块的实时响应。

- 详细的文档支持：我们提供了详细的文档和教程，助您更快地了解和上手 G-Framework。

# 交流群

点击链接加入群聊【ecs游戏框架交流】：https://jq.qq.com/?_wv=1027&k=29w1Nud6

# 功能丰富的模块

G-Framework 不仅提供了优秀的实体组件系统（ECS）核心，还结合多种专门针对帧同步优化策略和快速上手的实用模块，让您的游戏开发过程更加高效和轻松。以下是 G-Framework 提供的一些模块，助您在游戏开发中快速实现所需功能：

- [事件总线](docs/emitter.md) 用于在系统之间传递事件的模块，方便在不同系统间解耦地通信
- [时间管理器](docs/time-manager.md) 管理游戏中的计时器和帧率，确保各种定时任务的精确执行
- [状态机](docs/state-machine.md) 实现有限状态机的逻辑，帮助您管理游戏角色和对象的状态切换
- [输入适配器](docs/custom-input-adapter.md) 根据您使用的游戏引擎，为您提供便捷的输入事件抽象，简化输入控制
- [网络适配器](docs/network-adapter.md) 提供网络通信的抽象接口，可以与各种网络库无缝对接
- [状态快照](docs/state-snapshop.md) 用于记录和操作游戏状态的快照，方便在帧同步中处理状态变更
- [客户端插值](docs/interpolation.md) 提供插值算法，优化客户端帧同步下的状态表现，如平滑移动效果
- [输入管理器](docs/input-manager.md) 管理游戏输入，如键盘、鼠标和触摸事件，并在合适的时机同步输入状态
- [游戏同步策略](docs/sync-strategy.md) 针对游戏同步提供了多种策略，如状态插值、状态压缩等，按需选择使用。

G-Framework 通过提供这些实用模块，让您在游戏开发过程中专注于逻辑实现，更快速地满足项目需求。这些模块针对帧同步做了大量优化，确保您的项目在采用帧同步时获得较佳的性能表现。

# G-Framework ECS 框架入门

## 实体

实体是游戏中的基本对象，每个实体由一个唯一的 ID 标识，并包含一组组件。你可以通过 G-Framework 的 Entity 类来创建和管理实体。

```typescript
// 创建实体管理器
const entityManager = new gs.EntityManager([PositionComponent, VelocityComponent]);

// 创建实体
const entity = entityManager.createEntity();
```

### 创建自定义实体

使用createCustomEntity你可以轻松的创建自定义实体

```ts
class Player extends gs.Entity {
  onCreate(): void {
    console.log('player 实体创建');
  }

  onDestroy(): void {
    console.log('player 实体销毁');
  }
}


const playerEntity = entityManager.createCustomEntity(Player);
```

> onCreate方法和onDestroy方法由框架调用，分别再实体的创建和销毁时触发

## 组件

组件是实体的数据属性，用于描述实体的状态和行为。每个组件都是一个类，继承自 G-Framework 的 Component 类。

```typescript
// 创建组件
class PositionComponent extends gs.Component {
    public x: number = 0;
    public y: number = 0;

    public reset() {
        this.x = 0;
        this.y = 0;
    }
}

class VelocityComponent extends gs.Component {
    public x: number = 0;
    public y: number = 0;

    public reset() {
        this.x = 0;
        this.y = 0;
    }
}
```

> 注意，需要实现reset方法，当组件回收时会调用该方法

现在，你可以将组件附加到实体上：

```typescript
// 为实体添加组件
entity.addComponent(PositionComponent);
entity.addComponent(VelocityComponent);
```

## 系统

系统是用于处理实体和组件的逻辑的核心部分，通过继承 G-Framework 的 System 类创建系统。

```typescript
// 创建系统
class MoveSystem extends gs.System {
    entityFilter(entity: gs.Entity): boolean {
        return entity.hasComponent(PositionComponent) && entity.hasComponent(VelocityComponent);
    }

    update(entities: gs.Entity[]): void {
        for (const entity of entities) {
            const position = entity.getComponent(PositionComponent);
            const velocity = entity.getComponent(VelocityComponent);

            position.x += velocity.x * deltaTime;
            position.y += velocity.y * deltaTime;
        }
    }
}

// 注册系统到系统管理器中
const systemManager = new gs.SystemManager(entityManager);
const moveSystem = new MoveSystem(entityManager, 0);
systemManager.registerSystem(moveSystem);
```

在每个游戏循环中，你可以调用 SystemManager 的 update() 方法来更新所有系统：

```typescript
function gameLoop(deltaTime: number) {
    const timeManager = gs.TimeManager.getInstance();
    timeManager.update(deltaTime);

    systemManager.update();
}
```

# 性能测试报告

| 测试项                                     | 耗时      |
| ------------------------------------------ | --------- |
| 创建 1000 个实体并分配组件                 | 0.80 ms   |
| 更新 1000 次系统                           | 0.40 ms   |
| 创建并删除 1000 个实体                     | 0.80 ms   |
| 筛选 5000 个实体中具有位置和速度组件的实体 | 0.00 ms   |
| 添加和删除 1000 个实体的组件              | 1.40 ms   |