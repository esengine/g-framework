# 客户端插值

为了在客户端提供平滑的视觉效果，您可以实现插值技术。插值可以用于平滑地显示实体在不同状态之间的过渡，从而降低网络延迟带来的影响。

## 实现Interpolatable接口

首先，在您的组件基类中定义一个Interpolatable接口，确保所有需要插值的组件都实现了所需的方法：

```ts
interface Interpolatable {
    savePreviousState(): void;
    applyInterpolation(factor: number): void;
}
```

## 为组件添加插值支持

以TransformComponent为例，实现Interpolatable接口：

```ts
class TransformComponent extends Component implements Interpolatable {
    position: Vector2;
    rotation: number;

    previousPosition: Vector2;
    previousRotation: number;

    // ...

    savePreviousState() {
        this.previousPosition = { ...this.position };
        this.previousRotation = this.rotation;
    }

    applyInterpolation(factor: number) {
        const interpolatedPosition = {
            x: lerp(this.previousPosition.x, this.position.x, factor),
            y: lerp(this.previousPosition.y, this.position.y, factor),
        };
        const interpolatedRotation = lerp(this.previousRotation, this.rotation, factor);

        // 应用插值后的状态
        this.setPosition(interpolatedPosition);
        this.setRotation(interpolatedRotation);
    }
}
```

## 在游戏循环中应用插值

在游戏循环中，根据当前时间和状态更新时间调用applyInterpolation方法。例如：

```ts
function gameLoop(timestamp: number) {
    // ...

    // 计算插值因子
    const factor = (timestamp - lastUpdateTime) / timeBetweenUpdates;
    
    // 应用插值
    entityManager.applyInterpolation(factor);

    // 渲染
    render();

    // ...
}
```

这样，您只需要关注实现具体的插值逻辑，而框架会负责调用和管理插值过程。