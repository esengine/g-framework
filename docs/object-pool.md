# `ObjectPool`类的使用指南

## 简介

`ObjectPool`是一个通用的对象池实现，它可以帮助你管理和重复利用对象，从而避免频繁的对象创建和销毁带来的性能开销。在游戏开发、资源管理等需要高效利用内存的场景中，`ObjectPool`可以发挥很大的作用。

## 使用方法

以下是如何使用`ObjectPool`类的详细步骤：

### 1. 创建对象池

首先，你需要提供两个函数：一个用于创建新对象，一个用于重置对象。然后你就可以创建一个`ObjectPool`实例了。

```ts
const pool = new gs.ObjectPool(
    () => new SomeClass(),  // createFn: 用于创建新的SomeClass对象
    (obj) => obj.reset()   // resetFn: 用于重置SomeClass对象的状态
);
```

在上面的例子中，SomeClass是你想要管理的对象的类。请确保该类有一个可以重置对象状态的方法（在这个例子中是reset方法）。

### 2. 获取对象
   当你需要一个对象时，可以使用acquire方法来获取。如果对象池中有可用的对象，acquire方法会取出一个，重置它的状态，然后返回。如果对象池中没有可用的对象，acquire方法会创建一个新的对象然后返回。

```ts
const obj = pool.acquire();
```

### 3. 归还对象
   当你不再需要一个对象时，你可以使用release方法将其归还到对象池中，以便稍后重复使用。

```ts
pool.release(obj);
```
请注意，一旦你调用了release方法归还了一个对象，你就不应再使用该对象，除非你再次通过acquire方法获取到它。

## 示例
假设你有一个名为Bullet的类，它代表一颗子弹。子弹在游戏中经常被创建和销毁，所以你决定使用ObjectPool来管理它们。

```ts
class Bullet {
    x: number;
    y: number;
    isAlive: boolean;

    constructor() {
        this.reset();
    }

    reset() {
        this.x = 0;
        this.y = 0;
        this.isAlive = false;
    }

    fire(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.isAlive = true;
    }
}

const bulletPool = new gs.ObjectPool(
    () => new Bullet(), // 创建Bullet对象
    (bullet) => bullet.reset() // 重置Bullet对象
);

// 当你需要发射一颗子弹时
const bullet = bulletPool.acquire();
bullet.fire(player.x, player.y);

// 当子弹超出屏幕范围时
if (bullet.x < 0 || bullet.x > screenWidth || bullet.y < 0 || bullet.y > screenHeight) {
bulletPool.release(bullet);
}
```

在这个例子中，Bullet类有一个reset方法，用于重置子弹的状态。你创建了一个用于管理Bullet对象的ObjectPool，并提供了创建和重置Bullet对象的函数。当你需要发射一颗子弹时，你从对象池中获取一个Bullet对象，并调用它的fire方法。当子弹超出屏幕范围时，你将其归还到对象池中。

## 提示
- 为了获取最佳性能，建议在可能的情况下尽量复用对象池中的对象，而不是频繁地创建和销毁对象。 
- 当你的resetFn函数被调用时，你应确保该对象的状态被完全重置，以便它可以被安全地重复使用。 
- 虽然ObjectPool类可以帮你管理对象的生命周期，但你仍需要自己负责管理和跟踪哪些对象正在使用，哪些对象可以归还到对象池中。