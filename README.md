# G-Framework
G-Framework 是一个基于 TypeScript 编写的实体组件系统（ECS）框架，旨在为游戏开发者提供一个高性能、易用、可扩展的游戏逻辑框架。G-Framework 可以与多种游戏引擎无缝集成，支持逻辑并发执行，让你的游戏开发变得更加高效。

# 特点
- 纯逻辑实现，无需依赖其他框架
- 高性能，适用于帧同步项目
- 支持与多种游戏引擎集成
- 支持逻辑并发执行
- 易用性，降低上手难度
- 可扩展性，方便添加自定义模块

# G-Framework ECS 框架入门

## 实体
实体是游戏中的基本对象，每个实体由一个唯一的 ID 标识，并包含一组组件。你可以通过 G-Framework 的 Entity 类来创建和管理实体。

```typescript
// 创建实体管理器
const entityManager = new gs.EntityManager();

// 创建实体
const entity = entityManager.createEntity();
```

## 组件
组件是实体的数据属性，用于描述实体的状态和行为。每个组件都是一个类，继承自 G-Framework 的 Component 类。

```typescript
// 创建组件
class PositionComponent extends gs.Component {
    public x: number = 0;
    public y: number = 0;
}

class VelocityComponent extends gs.Component {
    public x: number = 0;
    public y: number = 0;
}
```
创建组件后，你需要注册它们到相应的组件管理器中，以便将其附加到实体上。

```typescript
// 创建组件管理器
const positionManager = new gs.ComponentManager(PositionComponent);
const velocityManager = new gs.ComponentManager(VelocityComponent);

// 注册组件到管理器中
gs.Component.registerComponent(PositionComponent, positionManager);
gs.Component.registerComponent(VelocityComponent, velocityManager);
```
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

    update(deltaTime: number, entities: gs.Entity[]): void {
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
    systemManager.update(deltaTime);
}
```

## 模块使用
- [G-Framework 事件系统 - GlobalEventEmitter](docs/emitter.md)

# 许可证
G-Framework 使用 MIT 许可证 进行许可。