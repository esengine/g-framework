# 状态快照

状态快照（State Snapshot）是用于存储和同步游戏状态的一种技术。在多人游戏中，为了同步各个客户端的游戏状态，通常会使用状态快照。状态快照可以简化游戏的网络通信，通过传输游戏状态的快照，而不是逐个传输实体和组件的状态。

在我们的ECS框架中，已经实现了基本的状态快照功能。你可以使用`EntityManager`中的`createStateSnapshot`方法生成当前游戏状态的快照，使用`updateStateFromSnapshot`方法根据给定的状态快照来更新游戏状态。

## 使用方法

1. 生成状态快照

```typescript
const entityManager = new EntityManager(/* ... */);
const stateSnapshot = entityManager.createStateSnapshot();
```

`createStateSnapshot`方法会遍历所有实体，调用它们的`serialize`方法，将实体及其组件的状态序列化为一个对象。这个对象可以被用来传输给其他客户端，以便同步游戏状态。

2. 使用状态快照更新游戏状态

```typescript
entityManager.updateStateFromSnapshot(stateSnapshot);
```

`updateStateFromSnapshot`方法会根据给定的状态快照更新游戏状态。首先，该方法会遍历状态快照中的实体数据，如果本地不存在对应实体，则创建一个新的实体。然后，使用实体数据中的组件数据来更新实体的组件状态。最后，用更新后的实体替换原有的实体。

## 注意事项

在使用状态快照时，需要注意同步问题。在客户端预测和服务器确认的过程中，可能需要将状态回滚到之前的某个快照，并重新应用输入数据。在这种情况下，可以使用`createStateSnapshot`和`updateStateFromSnapshot`方法进行回滚和更新。具体的同步策略和回滚机制取决于你的游戏逻辑和需求。