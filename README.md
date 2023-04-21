# G-Framework
G-Framework 是一个基于 TypeScript 编写的实体组件系统（ECS）框架，旨在为游戏开发者提供一个高性能、易用、可扩展的游戏逻辑框架。G-Framework 可以与多种游戏引擎无缝集成，支持逻辑并发执行，让你的游戏开发变得更加高效。

# 特点
- 纯逻辑实现，无需依赖其他框架
- 高性能，适用于帧同步项目
- 支持与多种游戏引擎集成
- 支持逻辑并发执行
- 易用性，降低上手难度
- 可扩展性，方便添加自定义模块

# 快速入门
下面是一个简单的使用 G-Framework 的示例：

```ts
import { Entity, Component, System, EntityManager } from 'gs';

// 创建一个 Transform 组件
class TransformComponent extends Component {
  x: number;
  y: number;
  rotation: number;

  constructor(x: number, y: number, rotation: number) {
    super();
    this.x = x;
    this.y = y;
    this.rotation = rotation;
  }
}

// 创建一个移动系统
class MovementSystem extends System {
  update(deltaTime: number): void {
    const entities = this.entityManager.getEntitiesWithComponent(TransformComponent);
    for (const entity of entities) {
      const transform = entity.getComponent(TransformComponent);
      transform.x += 10 * deltaTime;
      transform.y += 5 * deltaTime;
    }
  }
}

// 创建一个实体管理器实例
const entityManager = new EntityManager();

// 创建一个实体并添加 Transform 组件
const entity = entityManager.createEntity();
entity.addComponent(new TransformComponent(0, 0, 0));

// 创建一个移动系统并添加到实体管理器
const movementSystem = new MovementSystem(entityManager);
entityManager.addSystem(movementSystem);

// 每帧更新实体管理器
function gameLoop(deltaTime: number): void {
  entityManager.update(deltaTime);
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

## 模块使用
- [G-Framework 事件系统 - GlobalEventEmitter](docs/emitter.md)

# 许可证
G-Framework 使用 MIT 许可证 进行许可。