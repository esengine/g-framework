# G-Framework 事件系统 - GlobalEventEmitter
G-Framework 的事件系统提供了一个全局的事件发射器（GlobalEventEmitter），用于在组件和系统之间传递消息，降低耦合度。GlobalEventEmitter 使用了对象池技术，以减少垃圾回收的压力。

# 使用方法
监听事件
要监听一个事件，你需要使用 GlobalEventEmitter.on 方法，传入事件类型（字符串）和回调函数：

```typescript
GlobalEventEmitter.on('someEvent', (event: Event) => {
  console.log('someEvent occurred:', event.data);
});
```
## 发射事件
要发射一个事件，使用 GlobalEventEmitter.emit 方法，传入事件类型（字符串）和事件数据：

```typescript
const eventData = { key: 'value' };
GlobalEventEmitter.emit('someEvent', eventData);
```
## 取消监听事件
要取消监听一个事件，你需要使用 GlobalEventEmitter.off 方法，传入事件类型（字符串）和回调函数：

```typescript
const callback = (event: Event) => {
  console.log('someEvent occurred:', event.data);
};

GlobalEventEmitter.on('someEvent', callback);
// 当你不再需要监听事件时
GlobalEventEmitter.off('someEvent', callback);
```
> 注意：取消监听事件时，请确保传入的回调函数与 on 方法中使用的回调函数相同。

## 一次性监听事件
如果你只想监听一个事件的第一次发生，可以使用 GlobalEventEmitter.once 方法：

```typescript
GlobalEventEmitter.once('someEvent', (event: Event) => {
  console.log('someEvent occurred for the first time:', event.data);
});
```
这样，回调函数将在事件第一次发生时被调用，然后自动从监听列表中移除。

# 示例
以下是一个使用 GlobalEventEmitter 的简单示例：

```typescript
class Player {
  constructor() {
    GlobalEventEmitter.on('playerJump', this.onPlayerJump.bind(this));
  }

  onPlayerJump(event: Event): void {
    console.log('Player jumped:', event.data);
  }

  jump(): void {
    const eventData = { jumpHeight: 5 };
    GlobalEventEmitter.emit('playerJump', eventData);
  }
}

const player = new Player();
player.jump(); // 输出：Player jumped: { jumpHeight: 5 }
```