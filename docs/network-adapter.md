# 网络适配器(NetworkAdapter)

网络适配器（`NetworkAdapter`）是一个接口，用于将ECS框架与用户选择的通信协议相连接。通过实现这个接口，用户可以根据自己的需求定制通信协议，从而实现客户端与服务器之间的通信。

## 接口定义

`NetworkAdapter`接口定义了两个方法：

- `sendInput(frameNumber: number, inputData: any): void`：发送输入数据到服务器。
- `onServerUpdate(callback: (serverState: any) => void): void`：处理从服务器接收到的状态更新。

需要实现这个接口，并在其中添加具体的通信逻辑。

## 如何使用

1. 实现`NetworkAdapter`接口

首先，用户需要根据自己的通信协议实现`NetworkAdapter`接口。例如，假设我们有一个基于WebSocket的通信协议，可以这样实现：

```ts
class WebSocketNetworkAdapter implements gs.NetworkAdapter {
  private websocket: WebSocket;

  constructor(url: string) {
    this.websocket = new WebSocket(url);
  }

  sendInput(frameNumber: number, inputData: any): void {
    const message = {
      frameNumber,
      inputData,
    };
    this.websocket.send(JSON.stringify(message));
  }

  onServerUpdate(callback: (serverState: any) => void): void {
    this.websocket.addEventListener("message", (event) => {
      const serverState = JSON.parse(event.data);
      callback(serverState);
    });
  }
}
```

2. 将实现的网络适配器设置到EntityManager

在实例化EntityManager后，使用setNetworkAdapter方法将实现的网络适配器设置到EntityManager中：

```ts
const entityManager = new gs.EntityManager(componentManagers);
const websocketAdapter = new WebSocketNetworkAdapter("wss://example.com/game");
entityManager.getNetworkManager().setNetworkAdapter(websocketAdapter);
```

3. 使用网络适配器发送输入和处理服务器更新

在游戏逻辑中，使用sendInput方法发送客户端的输入数据到服务器。同时，使用onServerUpdate方法处理从服务器接收到的状态更新。

```ts
// 注册输入事件处理逻辑
const inputAdapter = new MyInputAdapter(entityManager.getInputManager());
inputAdapter.handleInputEvent(/* 某些特定于引擎的事件 */);

// 将转换后的 InputEvent 添加到输入缓冲区中
entityManager.getInputManager().sendInput(inputEvent);

// 监听服务器更新
entityManager.getNetworkManager().getNetworkAdapter().onServerUpdate((serverState) => {
  // 更新游戏状态
});

```

通过以上步骤，可以将自定义的通信协议与ECS框架相结合，从而实现客户端与服务器之间的通信。

## 提示

上文提到的MyInputAdapter可以参考以下来实现

- [输入适配器](custom-input-adapter.md)