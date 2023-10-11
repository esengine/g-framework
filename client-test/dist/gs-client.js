"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var ColorComponent = /** @class */ (function (_super) {
    __extends(ColorComponent, _super);
    function ColorComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ColorComponent.prototype.onInitialize = function () {
        this.color = this.getRandomColor();
        this.markUpdated(lastSnapshotVersion + 1);
    };
    ColorComponent.prototype.getRandomColor = function () {
        var letters = "0123456789ABCDEF";
        var color = "#";
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };
    return ColorComponent;
}(gs.Component));
var DrawSystem = /** @class */ (function (_super) {
    __extends(DrawSystem, _super);
    function DrawSystem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DrawSystem.prototype.entityFilter = function (entity) {
        return entity.hasTag("player");
    };
    DrawSystem.prototype.update = function (entities) {
        var e_1, _a;
        var canvas = document.getElementById("game-canvas");
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        try {
            for (var entities_1 = __values(entities), entities_1_1 = entities_1.next(); !entities_1_1.done; entities_1_1 = entities_1.next()) {
                var entity = entities_1_1.value;
                var color = entity.getComponent(ColorComponent);
                var position = entity.getComponent(PositionComponent);
                ctx.fillStyle = color.color;
                ctx.fillRect(position.x, position.y, 50, 50);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (entities_1_1 && !entities_1_1.done && (_a = entities_1.return)) _a.call(entities_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    return DrawSystem;
}(gs.System));
var InputSystem = /** @class */ (function (_super) {
    __extends(InputSystem, _super);
    function InputSystem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    InputSystem.prototype.entityFilter = function (entity) {
        return entity.hasTag("player");
    };
    InputSystem.prototype.update = function (entities) {
        var e_2, _a;
        var inputBuffer = this.entityManager.getInputManager().getInputBuffer();
        // 处理输入缓冲区中的事件
        while (inputBuffer.hasEvents()) {
            var inputEvent = inputBuffer.consumeEvent();
            try {
                // 遍历实体并根据输入事件更新它们
                for (var entities_2 = (e_2 = void 0, __values(entities)), entities_2_1 = entities_2.next(); !entities_2_1.done; entities_2_1 = entities_2.next()) {
                    var entity = entities_2_1.value;
                    if (entity instanceof Player && entity.playerId == inputEvent.data.playerId) {
                        this.applyInputToEntity(entity, inputEvent);
                        break;
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (entities_2_1 && !entities_2_1.done && (_a = entities_2.return)) _a.call(entities_2);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
    };
    InputSystem.prototype.applyInputToEntity = function (entity, inputEvent) {
        if (inputEvent.type == 'keyboard') {
            var velocity = entity.getComponent(VelocityComponent);
            velocity.x = 0;
            velocity.y = 0;
            if (inputEvent.data.isKeyDown) {
                switch (inputEvent.data.key.toLowerCase()) {
                    case 'w':
                        velocity.y = -10;
                        break;
                    case 's':
                        velocity.y = 10;
                        break;
                    case 'a':
                        velocity.x = -10;
                        break;
                    case 'd':
                        velocity.x = 10;
                        break;
                }
            }
        }
    };
    return InputSystem;
}(gs.System));
// 创建系统
var MoveSystem = /** @class */ (function (_super) {
    __extends(MoveSystem, _super);
    function MoveSystem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MoveSystem.prototype.entityFilter = function (entity) {
        return entity.hasComponent(PositionComponent) && entity.hasComponent(VelocityComponent);
    };
    MoveSystem.prototype.update = function (entities) {
        var e_3, _a;
        var deltaTime = gs.TimeManager.getInstance().deltaTime;
        try {
            for (var entities_3 = __values(entities), entities_3_1 = entities_3.next(); !entities_3_1.done; entities_3_1 = entities_3.next()) {
                var entity = entities_3_1.value;
                var position = entity.getComponent(PositionComponent);
                var velocity = entity.getComponent(VelocityComponent);
                var xIn = velocity.x * deltaTime;
                var yIn = velocity.y * deltaTime;
                position.x += xIn;
                position.y += yIn;
                if (xIn != 0 || yIn != 0)
                    position.markUpdated(lastSnapshotVersion + 1);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (entities_3_1 && !entities_3_1.done && (_a = entities_3.return)) _a.call(entities_3);
            }
            finally { if (e_3) throw e_3.error; }
        }
    };
    return MoveSystem;
}(gs.System));
var MyInputAdapter = /** @class */ (function (_super) {
    __extends(MyInputAdapter, _super);
    function MyInputAdapter(inputManager, networkAdapter) {
        var _this = _super.call(this, inputManager) || this;
        _this.networkAdapter = networkAdapter;
        return _this;
    }
    // 这个方法将处理游戏引擎或平台特定的输入事件，并将它们转换为通用的 InputEvent 对象
    MyInputAdapter.prototype.handleInputEvent = function (inputEvent) {
        var e_4, _a;
        try {
            // 将转换后的 InputEvent 发送到 InputManager
            for (var inputEvent_1 = __values(inputEvent), inputEvent_1_1 = inputEvent_1.next(); !inputEvent_1_1.done; inputEvent_1_1 = inputEvent_1.next()) {
                var event_1 = inputEvent_1_1.value;
                this.sendInputToManager(event_1);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (inputEvent_1_1 && !inputEvent_1_1.done && (_a = inputEvent_1.return)) _a.call(inputEvent_1);
            }
            finally { if (e_4) throw e_4.error; }
        }
    };
    MyInputAdapter.prototype.sendInputEvent = function (event, playerId) {
        // 处理特定的输入事件，例如将它们转换为通用的 InputEvent 对象
        var inputEvent = this.convertEngineEventToInputEvent(event, playerId);
        this.sendInputToManager(inputEvent);
    };
    // 将游戏引擎的输入事件转换为 InputEvent
    MyInputAdapter.prototype.convertEngineEventToInputEvent = function (event, playerId) {
        var inputEvent = {
            type: 'unknown',
            data: null // 初始化为null，根据需要设置
        };
        if (event.type === 'keydown' || event.type === 'keyup') {
            // 如果事件类型是按键按下或按键松开
            inputEvent.type = 'keyboard'; // 设置为键盘事件类型
            inputEvent.data = {
                key: event.key,
                isKeyDown: event.type === 'keydown',
                playerId: playerId
            };
        }
        return inputEvent;
    };
    return MyInputAdapter;
}(gs.InputAdapter));
var Player = /** @class */ (function (_super) {
    __extends(Player, _super);
    function Player() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Player.prototype.onCreate = function () {
        console.log('player 实体创建');
    };
    Player.prototype.onDestroy = function () {
        console.log('player 实体销毁');
    };
    return Player;
}(gs.Entity));
var PositionComponent = /** @class */ (function (_super) {
    __extends(PositionComponent, _super);
    function PositionComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.x = 0;
        _this.y = 0;
        return _this;
    }
    PositionComponent.prototype.reset = function () {
        this.x = 0;
        this.y = 0;
    };
    return PositionComponent;
}(gs.Component));
var VelocityComponent = /** @class */ (function (_super) {
    __extends(VelocityComponent, _super);
    function VelocityComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.x = 0;
        _this.y = 0;
        return _this;
    }
    VelocityComponent.prototype.reset = function () {
        this.x = 0;
        this.y = 0;
    };
    return VelocityComponent;
}(gs.Component));
///<reference path="InputSystem.ts"/>
///<reference path="MyInputAdapter.ts"/>
///<reference path="DrawSystem.ts"/>
var core = gs.Core.instance;
// 注册系统到系统管理器中
var moveSystem = new MoveSystem(core.entityManager, 0);
core.systemManager.registerSystem(moveSystem);
var inputSystem = new InputSystem(core.entityManager, 0);
core.systemManager.registerSystem(inputSystem);
var drawSystem = new DrawSystem(core.entityManager, 0);
var userName = 'test';
var password = 'test';
// 使用你的服务器URL实例化网络适配器
var networkAdapter = new gs.GNetworkAdapter('ws://127.0.0.1:8080', userName, password);
// 添加网络适配器到EntityManager
core.entityManager.getNetworkManager().setNetworkAdapter(networkAdapter);
var playerId;
var roomId;
var playerNet = {};
var lastSnapshotVersion = 0;
// 监听服务器更新
core.entityManager.getNetworkManager().getNetworkAdapter().onServerUpdate(function (serverState) {
    if (serverState.type == "authentication") {
        playerId = serverState.payload.id;
        document.getElementById('player-session').textContent = "SESSION:" + serverState.payload.sessionId;
        document.getElementById('player-id').textContent = 'ID:' + playerId;
        document.getElementById('player-name').textContent = "Name:" + userName;
    }
    else if (serverState.type == 'sessionId') {
        document.getElementById('player-session').textContent = "SESSION:" + serverState.payload;
    }
    if (serverState.type != 'heartbeat' && serverState.type != 'frameSync') {
        document.getElementById('loggerArea').textContent += ("[".concat(serverState.type, "]: ").concat(JSON.stringify(serverState.payload), "\n"));
        console.warn('更新游戏状态', serverState);
    }
});
function createPlayer(id) {
    var playerEntity = core.entityManager.createEntity(Player);
    playerEntity.addComponent(PositionComponent);
    playerEntity.addComponent(VelocityComponent);
    playerEntity.addComponent(ColorComponent);
    playerEntity.playerId = id;
    playerEntity.addTag("player");
    playerNet[id] = playerEntity.getId();
}
function deletePlayer(id) {
    core.entityManager.deleteEntity(playerNet[id]);
    delete playerNet[id];
    core.systemManager.invalidateEntityCacheForSystem(drawSystem);
}
function deleteAllPlayer() {
    var players = core.entityManager.getEntitiesWithTag('player');
    for (var i = players.length - 1; i >= 0; i--) {
        var playerId_1 = players[i].playerId;
        core.entityManager.deleteEntity(playerNet[playerId_1]);
    }
    playerNet = {};
    core.systemManager.invalidateEntityCacheForSystem(drawSystem);
}
var syncStrategy = new gs.SnapshotInterpolationStrategy();
syncStrategy.onInterpolation = function (prevSnapshot, nextSnapshot, progress) {
    var e_5, _a;
    var _b, _c;
    // 用户实现自定义实体插值逻辑
    // 例如：根据实体的类型更新位置、旋转、缩放等属性
    console.log("onInterpolation ".concat(progress));
    var _loop_1 = function (serializedEntity) {
        // 根据实体的唯一标识符查找对应的游戏实体
        var entityId = serializedEntity.id;
        var entity = core.entityManager.getEntity(entityId);
        if (entity) {
            // 使用插值进度来解析实体的位置
            var positionComponent = entity.getComponent(PositionComponent);
            if (positionComponent) {
                // 使用插值进度来解析实体的位置
                var prevPosition = (_b = prevSnapshot.snapshot.entities.find(function (e) { return e.id === entityId; })) === null || _b === void 0 ? void 0 : _b.components["PositionComponent"];
                var nextPosition = (_c = nextSnapshot.snapshot.entities.find(function (e) { return e.id === entityId; })) === null || _c === void 0 ? void 0 : _c.components["PositionComponent"];
                if (prevPosition && nextPosition) {
                    // 使用线性插值来更新位置
                    var interpolatedX = prevPosition.x + (nextPosition.x - prevPosition.x) * progress;
                    var interpolatedY = prevPosition.y + (nextPosition.y - prevPosition.y) * progress;
                    // 更新实体的位置属性
                    positionComponent.x = interpolatedX;
                    positionComponent.y = interpolatedY;
                }
            }
        }
    };
    try {
        for (var _d = __values(nextSnapshot.snapshot.entities), _e = _d.next(); !_e.done; _e = _d.next()) {
            var serializedEntity = _e.value;
            _loop_1(serializedEntity);
        }
    }
    catch (e_5_1) { e_5 = { error: e_5_1 }; }
    finally {
        try {
            if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
        }
        finally { if (e_5) throw e_5.error; }
    }
};
var strategyManager = new gs.SyncStrategyManager(syncStrategy); // 发送状态
document.addEventListener("DOMContentLoaded", function () {
    // 获取加入房间按钮
    var joinRoomButton = document.getElementById("join-room-btn");
    var createRoomButton = document.getElementById("create-room-btn");
    var leaveRoomButton = document.getElementById('leave-room-btn');
    var startFrameBtn = document.getElementById('start-frame');
    var endFrameBtn = document.getElementById('end-frame');
    joinRoomButton.onclick = function (ev) {
        console.log("发送加入房间指令");
        // 获取输入框元素
        var roomInputElement = document.getElementById("room-input");
        // 获取输入框中的房间号
        var roomInput = roomInputElement.value;
        networkAdapter.RoomAPI.joinRoom(roomInput);
    };
    createRoomButton.onclick = function (ev) {
        console.log("发送创建房间指令");
        networkAdapter.RoomAPI.createRoom(10, function (room) {
            roomId = room.id;
            document.getElementById('room-id').textContent = "ID: " + roomId;
            createPlayer(playerId);
        });
    };
    leaveRoomButton.onclick = function (ev) {
        console.log("发送退出房间指令");
        networkAdapter.RoomAPI.leaveRoom(roomId);
    };
    startFrameBtn.onclick = function (ev) {
        console.log('开始帧同步');
        networkAdapter.RoomAPI.startGame(roomId);
    };
    endFrameBtn.onclick = function (ev) {
        console.log('结束帧同步');
        networkAdapter.RoomAPI.endGame(roomId);
    };
    networkAdapter.RoomAPI.setPlayerLeftCallback(function (leftPlayerId) {
        if (leftPlayerId == playerId) {
            // 自己离开房间
            document.getElementById('room-id').textContent = "";
            deleteAllPlayer();
        }
        else {
            console.log("\u6709\u73A9\u5BB6\u79BB\u5F00: ".concat(leftPlayerId));
            deletePlayer(leftPlayerId);
        }
    });
    networkAdapter.RoomAPI.setPlayerJoinedCallback(function (joinPlayerId, room) {
        var e_6, _a;
        if (joinPlayerId == playerId) {
            roomId = room.id;
            // 自己加入房间
            document.getElementById('room-id').textContent = "ID: ".concat(room.id);
            try {
                for (var _b = __values(room.players), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var player = _c.value;
                    createPlayer(player.id);
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_6) throw e_6.error; }
            }
        }
        else {
            console.log("\u6709\u73A9\u5BB6\u52A0\u5165: ".concat(joinPlayerId));
            createPlayer(joinPlayerId);
        }
    });
    networkAdapter.RoomAPI.setFrameSync(function (payload) {
        if (payload.actions) {
            console.log(payload.frame, payload.actions);
        }
        var snapshot = core.entityManager.createIncrementalStateSnapshot(lastSnapshotVersion);
        // 如果有增量数据
        if (snapshot.entities.length > 0) {
            // 向服务器发送增量数据
            networkAdapter.RoomAPI.snapShot(roomId, snapshot, lastSnapshotVersion);
            // 输出增量帧
            console.log("version: ".concat(lastSnapshotVersion, " snapshot: ").concat(snapshot));
        }
    });
    networkAdapter.RoomAPI.setSnapshotCallback(function (snapshot) {
        console.log("receive snapshot: ".concat(snapshot));
        // strategyManager.receiveState(snapshot);
        lastSnapshotVersion = snapshot.lastSnapVersion;
        core.entityManager.applyIncrementalSnapshot(snapshot.snapshot);
    });
    var inputAdapter = new MyInputAdapter(core.entityManager.getInputManager(), networkAdapter);
    document.addEventListener("keydown", function (event) {
        inputAdapter.sendInputEvent(event, playerId);
    });
    document.addEventListener("keyup", function (event) {
        inputAdapter.sendInputEvent(event, playerId);
    });
    core.systemManager.registerSystem(drawSystem);
});
var lastTime = 0;
function update(timestamp) {
    var deltaTime = (timestamp - lastTime) / 1000; // 将时间戳转换为秒
    // 这里写你的更新逻辑
    core.update(deltaTime);
    lastTime = timestamp;
    // 请求下一帧
    requestAnimationFrame(update);
    // 处理状态更新
    strategyManager.handleStateUpdate(0.33);
}
// 开始更新循环
requestAnimationFrame(update);
