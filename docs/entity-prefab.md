# 实体预制件
在g-framework中，我们知道游戏中的许多对象（例如：敌人，道具，特效等）可能需要反复创建和销毁。如果每次需要这些对象时都手动创建一个全新的实例，这不仅编程繁琐，而且可能对性能产生负面影响，特别是在大量对象频繁创建和销毁的情况下。

实体预制体（Entity Prefabs）提供了一个高效的方式来解决这个问题。预制体是一个事先配置好的实体模板，我们可以从中快速复制（实例化）出新的实体，这样，我们只需要在游戏初始化的时候创建并配置好预制体，之后就可以快速地从预制体创建新的实体，这不仅简化了代码，也提高了性能。

EntityManager类提供了对预制体的管理功能，包括注册、注销以及从预制体创建新实体等功能。

## createEntityFromPrefab
从预制件创建实体。

```typescript
public createEntityFromPrefab(name: string, deepCopy: boolean = false): Entity | null;
```
参数
- name - 预制件的名称。
- deepCopy - 是否进行深复制，默认为 false。

返回值
- 如果找到预制件，返回新创建的实体；
- 如果没有找到对应名称的预制件，返回 null。

### 使用示例
```typescript
let entityManager = gs.Core.instnace.entityManager;
let entity = entityManager.createEntityFromPrefab("monster", true);
```

## registerPrefab
注册预制件。

```typescript
public registerPrefab(name: string, entity: Entity): void;
```

参数
- name - 预制件的名称。
- entity - 实体对象。
使用示例
```typescript
let entityManager = gs.Core.instnace.entityManager;
let monster = entityManager.createEntity();
entityManager.registerPrefab("monster", monster);
```

### unregisterPrefab
注销预制件。

```typescript
public unregisterPrefab(name: string): void;
```

参数
- name - 预制件的名称。

使用示例
```typescript
let entityManager = gs.Core.instnace.entityManager;
entityManager.unregisterPrefab("monster");
```

## 为什么要使用预制体

预制体的一个主要优点是可以将实体的创建和配置从使用它的地方分离出来。如果不使用预制体，每次需要一个新的实体，都需要创建一个新的实体，并对其进行一系列的配置，这不仅使得代码冗余，而且降低了效率。

使用预制体，你只需要创建并配置一次实体，之后就可以多次从预制体创建新的实体，这极大地简化了代码，提高了代码的复用性，同时也提高了运行时的性能。

除此之外，预制体还支持深复制和浅复制两种方式。浅复制是共享同一份资源，这意味着所有的实体都会共享同样的属性和状态，

## 示例

首先，我们假设有一个基础的Entity类，它可以是一个游戏中的角色，敌人，道具等，每个实体都有自己的特性和属性。为了示例的目的，我们简单定义一个带有名字的Entity类。

我们的游戏需要大量的“monster”实体。手动创建大量相同的实体会非常繁琐且效率低下，因此我们会创建一个“monster”实体的预制件，并将其注册到EntityManager中。

```typescript
let entityManager = gs.Core.instnace.entityManager;
let monsterPrefab = entityManager.createEntity();
// 你可以再这里添加一些组件给这个实体,例如：
// monsterPrefab.addComponent(PositionComponent);
entityManager.registerPrefab("monster", monsterPrefab);
```

在这个阶段，我们创建了一个monster的实体，并注册为预制件。接下来，我们想创建更多的monster实体，我们就可以通过预制件来创建：

```typescript
let monster1 = entityManager.createEntityFromPrefab("monster");
let monster2 = entityManager.createEntityFromPrefab("monster");
```

在这个阶段，我们成功创建了两个新的monster实体，它们都是基于monster预制件创建的。如果我们不再需要monster预制件，我们可以将其从EntityManager中注销：

```typescript
entityManager.unregisterPrefab("monster");
```

这样一来，monster预制件就被成功移除了。如果我们再尝试从这个预制件创建实体，将会返回null，因为没有找到monster预制件：

```typescript
let monster3 = entityManager.createEntityFromPrefab("monster");
```
