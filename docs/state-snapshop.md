# 状态快照

状态快照（State Snapshot）是用于存储和同步游戏状态的一种技术。在多人游戏中，为了同步各个客户端的游戏状态，通常会使用状态快照。状态快照可以简化游戏的网络通信，通过传输游戏状态的快照，而不是逐个传输实体和组件的状态。

在我们的ECS框架中，已经实现了基本的状态快照功能。你可以使用`EntityManager`中的`createStateSnapshot`方法生成当前游戏状态的快照，使用`updateStateFromSnapshot`方法根据给定的状态快照来更新游戏状态。

## 使用方法

### 1. 生成状态快照

要生成状态快照，首先需要创建一个 EntityManager 实例。然后，调用 createStateSnapshot 方法生成当前游戏状态的快照。

```typescript
const entityManager = new EntityManager(/* ... */);
const stateSnapshot = entityManager.createStateSnapshot();
```

`createStateSnapshot`方法会遍历所有实体，调用它们的`serialize`方法，将实体及其组件的状态序列化为一个对象。这个对象可以被用来传输给其他客户端，以便同步游戏状态。

### 2. 使用状态快照更新游戏状态

要使用状态快照更新游戏状态，需要调用 EntityManager 的 updateStateFromSnapshot 方法，并传入状态快照。

```typescript
entityManager.updateStateFromSnapshot(stateSnapshot);
```

`updateStateFromSnapshot`方法会根据给定的状态快照更新游戏状态。首先，该方法会遍历状态快照中的实体数据，如果本地不存在对应实体，则创建一个新的实体。然后，使用实体数据中的组件数据来更新实体的组件状态。最后，用更新后的实体替换原有的实体。


### 3. 为组件重写 shouldSerialize 方法

在 Component 类中有一个 shouldSerialize 方法。默认情况下，它可以返回 true，表示该组件应该被序列化。子类可以根据需要覆盖此方法。

这样做的目的是为了在序列化时仅包含需要同步的组件，从而减少网络传输的数据量。

### 4. 实现增量更新

为了进一步减少网络传输的数据量，可以实现增量更新。增量更新是指在创建状态快照时仅包含自上次快照以来发生变化的实体和组件。

要实现增量更新，需要在 EntityManager 类中使用一个方法 `createIncrementalStateSnapshot`，用于创建增量状态快照。同时，在 Entity 类中有一个 `serializeIncremental` 方法，仅序列化具有较高版本号的组件。

首先，创建一个 EntityManager 实例。我们将在这个实例上调用增量更新方法：

```ts
const entityManager = new EntityManager(/* ... */);
```

为了跟踪上一次快照的版本号，首先需要将其存储在一个变量中。这里我们初始化为0：

```ts
let lastSnapshotVersion = 0;
```

每次您需要创建一个增量状态快照时，调用 createIncrementalStateSnapshot 方法，并将 lastSnapshotVersion 作为参数传入。

```ts
const incrementalStateSnapshot = entityManager.createIncrementalStateSnapshot(lastSnapshotVersion);
```

这将返回一个包含自上次快照版本以来的所有实体和组件更改的对象。在发送此增量快照并将其应用到其他客户端的 EntityManager 实例之后，您需要更新 lastSnapshotVersion 以便下一次使用。

例如，如果客户端收到了应用增量快照后的 currentSnapshotVersion，则可以更新 lastSnapshotVersion：

```ts
lastSnapshotVersion = currentSnapshotVersion;
```

当其他客户端收到增量状态快照时，它们可以使用 updateStateFromSnapshot 方法更新游戏状态：

```ts
entityManager.updateStateFromSnapshot(incrementalStateSnapshot);
```

通过这种方式，您可以在创建状态快照时仅将自上次快照以来发生变化的实体和组件包含在内，从而实现增量更新

## 注意事项

在使用状态快照时，需要注意同步问题。在客户端预测和服务器确认的过程中，可能需要将状态回滚到之前的某个快照，并重新应用输入数据。在这种情况下，可以使用`createStateSnapshot`和`updateStateFromSnapshot`方法进行回滚和更新。具体的同步策略和回滚机制取决于你的游戏逻辑和需求。

此外，为了提高性能，可以考虑使用增量更新。通过实现增量更新，您可以在创建状态快照时仅包含自上次快照以来发生变化的实体和组件，从而减少网络传输的数据量。