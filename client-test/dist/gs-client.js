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
        var e_1, _a;
        var deltaTime = gs.TimeManager.getInstance().deltaTime;
        try {
            for (var entities_1 = __values(entities), entities_1_1 = entities_1.next(); !entities_1_1.done; entities_1_1 = entities_1.next()) {
                var entity_1 = entities_1_1.value;
                var position = entity_1.getComponent(PositionComponent);
                var velocity = entity_1.getComponent(VelocityComponent);
                position.x += velocity.x * deltaTime;
                position.y += velocity.y * deltaTime;
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
    return MoveSystem;
}(gs.System));
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
var core = gs.Core.instance;
// 创建实体
var entity = core.entityManager.createEntity();
entity.addComponent(PositionComponent);
entity.addComponent(VelocityComponent);
var playerEntity = core.entityManager.createEntity(Player);
playerEntity.addComponent(PositionComponent);
playerEntity.addComponent(VelocityComponent);
// 注册系统到系统管理器中
var moveSystem = new MoveSystem(core.entityManager, 0);
core.systemManager.registerSystem(moveSystem);
// 使用你的服务器URL实例化网络适配器
var networkAdapter = new gs.GNetworkAdapter('ws://localhost:8080', "admin", "admin");
// 添加网络适配器到EntityManager
core.entityManager.getNetworkManager().setNetworkAdapter(networkAdapter);
var lastTimestamp = performance.now();
var timestamp = 0;
function update() {
    var deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    // 这里写你的更新逻辑
    core.update(deltaTime);
    // 请求下一帧
    requestAnimationFrame(update);
}
// 开始更新循环
requestAnimationFrame(update);
