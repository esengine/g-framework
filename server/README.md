# G-Server 服务端框架

G-Server是一个为帧同步项目设计的服务端框架。它提供了一系列强大的功能和工具，使得你可以更方便地创建和维护你的服务器。

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
});
```

4. 接下来，你可以使用GServices实例来管理服务器的各种服务和功能

```ts
services.start();
```

## 详细介绍

### 身份验证

G-Server 使用了强大的身份验证流程来确保连接的安全性。此流程由`Authentication`类进行管理，主要包括以下几个步骤：

1. **用户名和密码验证**：首先，服务器会使用客户端提供的用户名和密码进行身份验证。这一步使用的是[passport-local](https://www.npmjs.com/package/passport-local)策略。如果验证成功，服务器会生成一个四位数的验证码并发送给客户端。

2. **验证码验证**：客户端接收到验证码后，需要将其发送回服务器进行验证。如果验证成功，服务器会生成一个令牌并发送给客户端。

3. **令牌验证**：客户端接收到令牌后，需要将其发送回服务器进行验证。这一步使用的是[passport-http-bearer](https://www.npmjs.com/package/passport-http-bearer)策略。如果验证成功，那么认为身份验证已经完成，客户端与服务器之间的连接将被视为已认证。

此外，`Authentication`类还提供了一个`authenticate`方法，用于执行整个身份验证流程。此方法接受一个连接对象和一个有效载荷数据作为参数，返回一个`Promise`，表示身份验证操作的异步结果。

在身份验证过程中，如果任何一步验证失败，那么服务器会立即关闭与客户端的连接，以保障系统的安全性。

### 心跳检测

`HeartbeatManager`类负责管理服务器和客户端之间的心跳。心跳是一种机制，服务器定期向客户端发送一个信号，以检查客户端是否仍然连接。如果客户端在一定时间内没有回应，那么服务器将认为连接已经断开。

#### 开始心跳
你可以调用`startHeartbeat`方法开始心跳。这个方法需要一个Connection对象作为参数，这个Connection对象代表了服务器和客户端之间的连接。

```ts
heartbeatManager.startHeartbeat(connection);
```
当你调用`startHeartbeat`方法时，HeartbeatManager将开始定时向客户端发送心跳信号。同时，它还会设置一个心跳超时定时器，如果在心跳超时时间内没有收到客户端的回应，那么它将调用handleHeartbeatTimeout方法。

#### 处理心跳超时
当心跳超时时，`HeartbeatManager`会调用`handleHeartbeatTimeout`方法。这个方法接收一个`Connection`对象作为参数。在这个方法中，你可以根据需要进行相关处理，如关闭连接、重新连接等。

### 连接管理器

用于管理服务器上的WebSocket连接。它提供了一系列的方法来处理连接的各种事件和操作。

主要功能包括：

- **广播消息**：`broadcast(message: Message)` 方法使你可以将消息广播到所有当前连接的客户端。

- **注册连接**：当新的客户端连接到服务器时，`registerConnection(connection: Connection)` 方法允许你注册这个连接，并将其添加到连接池中。

- **连接超时检查**：`ConnectionManager`会定期检查所有连接的活跃状态，如果某个连接在一定时间内没有任何活动，那么这个连接将被认为是超时的，并将被自动关闭。

- **连接注销**：当客户端断开连接时，你可以使用`unregisterConnection(connection: Connection)`方法来注销这个连接。

- **处理重新连接**：`handleReconnect(connection: Connection)`方法可以处理客户端的重新连接请求，例如恢复客户端的状态、重发未确认的消息等。

- **处理心跳响应**：`handleHeartbeatResponse(connection: Connection)`方法用于处理客户端的心跳响应，以确认客户端的连接仍然活跃。

- **断线消息缓存**：当客户端断开连接时，`cacheMessagesForReconnect(connection: Connection)`方法可以将待发送给客户端的消息进行缓存，等到客户端重新连接后再发送。

- **连接统计信息更新**：`updateConnectionStats(connection: Connection, frame: FrameInfo, received: boolean)`方法可以更新指定连接的统计信息，例如已发送的消息数量、已接收的消息数量等。

- **处理连接断开**：`handleDisconnect(connection: Connection)`方法在连接断开时被调用，它可以处理连接断开后的各种操作，例如注销连接、缓存未发送的消息、尝试重新连接等。

- **重新连接**：`reconnect(connection: Connection)`方法可以尝试重新连接断开的连接，例如重设连接事件处理器、处理重新连接、发送缓存的消息等。

- **发送缓存的消息**：`sendCachedMessages(connection: Connection)`方法可以将缓存的消息发送给指定的连接。

- **获取重连延迟**：`getReconnectDelay(reconnectAttempts: number)`方法可以根据重连次数计算重连延迟，这可以用来实现断线重连的策略，例如指数退避等。