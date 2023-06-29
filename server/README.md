# G-Server 服务端框架

G-Server是一个专为帧同步项目设计的服务端框架，它提供了一系列强大的功能和工具，使得你可以更方便地创建和维护你的服务器。

## 项目目标

G-Server的目标是提供一套全面而又灵活的解决方案，帮助开发者更高效地进行帧同步项目的开发。它能够处理包括帧同步管理、连接管理、心跳检测、WebSocket服务、HTTP服务、身份验证、异常处理等一系列问题，使开发者可以专注于业务逻辑的实现，提高开发效率。

## 特性

- **帧同步管理**：`FrameSyncManager`类可以帮助你管理游戏的帧同步。它会定期发送帧同步消息，包含当前帧数和该帧所对应的所有客户端操作。你可以自定义每帧的时间间隔。它还提供了一个方法用于收集每一帧的客户端操作。

- **连接管理**：`ConnectionManager`类可以帮助你管理 WebSocket 连接。这个类提供了很多有用的方法，例如广播消息、注册和注销连接、处理连接超时和断线重连等。这个类还支持消息队列，你可以在连接断开时缓存待发送的消息，然后在连接恢复后再发送这些消息。

- **心跳检测**：`HeartbeatManager`类可以帮助你定期检查服务器与每个客户端的连接状态。它通过定期发送心跳消息，并设置心跳超时时间，如果在超时时间内未收到客户端的响应，将会调用预设的处理函数（例如关闭连接、重新连接等）。你可以自定义心跳间隔时间和心跳超时时间。

- **WebSocket服务**：G-Server基于WebSocket协议，使得你可以在服务器和客户端之间进行实时双向通信。

- **HTTP服务**：通过`HTTPServer`类，你可以轻松地在服务器上提供HTTP服务。

- **身份验证**：`Authentication`类用于处理连接的身份验证过程。它支持多种身份验证方法，包括基于用户名和密码、验证码以及令牌。你可以根据需要选择合适的身份验证方式。

- **异常处理**：G-Server提供了处理未捕获的异常和未处理的Promise拒绝的方法，使得你可以更好地控制错误和异常。

- **服务器扩展**：`ServerExtension`接口允许你扩展G-Server的功能。你可以实现这个接口并提供自定义的回调函数，以在特定事件发生时执行自定义逻辑。

## 使用方法

1. 安装G-Server：
```
npm install @esengine/gs-server
```

2. 导入命名空间
```ts
import {GServices} from "@esengine/gs-server";
```

3. 创建一个GServices的实例，并提供一个WebSocketServerConfig

```ts
const services = GServices.I();
services.init({
    port: 8080,
    heartbeatInterval: 10000,
    heartbeatTimeout: 30000,
    connectDBStr: 'mongodb://127.0.0.1:27017/',
    sessionExpireTime: 54000
}).then(()=>{
    services.start();
});
```

4. 接下来，你可以使用GServices实例来管理服务器的各种服务和功能


## 身份验证

G-Server 使用了强大的身份验证流程来确保连接的安全性。此流程由`Authentication`类进行管理，主要包括以下几个步骤：

1. **用户名和密码验证**：首先，服务器会使用客户端提供的用户名和密码进行身份验证。这一步使用的是[passport-local](https://www.npmjs.com/package/passport-local)策略。如果验证成功，服务器会生成一个四位数的验证码并发送给客户端。

2. **验证码验证**：客户端接收到验证码后，需要将其发送回服务器进行验证。如果验证成功，服务器会生成一个令牌并发送给客户端。

3. **令牌验证**：客户端接收到令牌后，需要将其发送回服务器进行验证。这一步使用的是[passport-http-bearer](https://www.npmjs.com/package/passport-http-bearer)策略。如果验证成功，那么认为身份验证已经完成，客户端与服务器之间的连接将被视为已认证。

此外，`Authentication`类还提供了一个`authenticate`方法，用于执行整个身份验证流程。此方法接受一个连接对象和一个有效载荷数据作为参数，返回一个`Promise`，表示身份验证操作的异步结果。

在身份验证过程中，如果任何一步验证失败，那么服务器会立即关闭与客户端的连接，以保障系统的安全性。


```ts
heartbeatManager.startHeartbeat(connection);
```
当你调用`startHeartbeat`方法时，HeartbeatManager将开始定时向客户端发送心跳信号。同时，它还会设置一个心跳超时定时器，如果在心跳超时时间内没有收到客户端的回应，那么它将调用handleHeartbeatTimeout方法。

# 开源许可证
本项目采用MIT许可证，你可以在符合许可证条款的前提下自由地使用、修改和分发本项目。查看LICENSE文件获取更多信息。

# 贡献指南
我们非常欢迎并感谢所有的贡献者。查看CONTRIBUTING.md文件获取更多信息。