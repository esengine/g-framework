"use strict";
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var gs;
(function (gs) {
    /**
     * 组件
     */
    var Component = /** @class */ (function () {
        function Component() {
        }
        Component.prototype.serialize = function () {
            var e_1, _a;
            var data = {};
            try {
                for (var _b = __values(Object.keys(this)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var key = _c.value;
                    var value = this[key];
                    if (typeof value !== 'function') {
                        data[key] = value;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return data;
        };
        Component.prototype.deserialize = function (data) {
            for (var key in data) {
                if (this[key] !== undefined) {
                    this[key] = data[key];
                }
            }
        };
        /**
         * 注册组件
         * @param componentClass
         * @param manager
         */
        Component.registerComponent = function (componentClass, manager) {
            var componentInstance = new componentClass();
            var keys = Object.keys(componentInstance);
            var _loop_1 = function (i) {
                var key = keys[i];
                var descriptor = Object.getOwnPropertyDescriptor(componentClass.prototype, key);
                if (descriptor && typeof descriptor.get === 'function' && typeof descriptor.set === 'function') {
                    var dataIndex_1 = manager.allocateDataIndex();
                    Object.defineProperty(componentClass.prototype, key, {
                        get: function () {
                            return manager.get(this.entityId)[dataIndex_1];
                        },
                        set: function (value) {
                            manager.get(this.entityId)[dataIndex_1] = value;
                        },
                        enumerable: true,
                        configurable: true,
                    });
                }
            };
            for (var i = 0; i < keys.length; i++) {
                _loop_1(i);
            }
        };
        return Component;
    }());
    gs.Component = Component;
})(gs || (gs = {}));
var gs;
(function (gs) {
    var Entity = /** @class */ (function () {
        function Entity(id, componentManagers) {
            this.id = id;
            this.componentManagers = componentManagers;
            this.tags = new Set();
            this.eventEmitter = new gs.EventEmitter();
        }
        Entity.prototype.getId = function () {
            return this.id;
        };
        /**
         * 添加组件
         * @param componentType
         * @returns
         */
        Entity.prototype.addComponent = function (componentType) {
            var manager = this.componentManagers.get(componentType);
            if (!manager) {
                throw new Error("\u7EC4\u4EF6\u7C7B\u578B\u4E3A " + componentType.name + " \u7684\u7EC4\u4EF6\u7BA1\u7406\u5668\u672A\u627E\u5230.");
            }
            var component = manager.create(this.id);
            return component;
        };
        /**
         * 获取组件
         * @param componentType
         * @returns
         */
        Entity.prototype.getComponent = function (componentType) {
            var manager = this.componentManagers.get(componentType);
            if (!manager) {
                return null;
            }
            return manager.get(this.id);
        };
        /**
         * 移除组件
         * @param componentType
         * @returns
         */
        Entity.prototype.removeComponent = function (componentType) {
            var manager = this.componentManagers.get(componentType);
            if (!manager) {
                return;
            }
            var component = this.getComponent(componentType);
            if (component) {
                manager.remove(this.id);
            }
        };
        /**
         * 是否有组件
         * @param componentType
         * @returns
         */
        Entity.prototype.hasComponent = function (componentType) {
            var manager = this.componentManagers.get(componentType);
            return manager ? manager.has(this.id) : false;
        };
        /**
         * 添加标签
         * @param tag
         */
        Entity.prototype.addTag = function (tag) {
            this.tags.add(tag);
        };
        /**
         * 移除标签
         * @param tag
         */
        Entity.prototype.removeTag = function (tag) {
            this.tags.delete(tag);
        };
        /**
         * 检查是否具有指定标签
         * @param tag
         * @returns
         */
        Entity.prototype.hasTag = function (tag) {
            return this.tags.has(tag);
        };
        /**
         * 序列化
         * @returns
         */
        Entity.prototype.serialize = function () {
            var e_2, _a;
            var serializedEntity = {
                id: this.id,
                components: {},
            };
            try {
                for (var _b = __values(this.componentManagers), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), componentType = _d[0], manager = _d[1];
                    var component = manager.get(this.id);
                    if (component) {
                        serializedEntity.components[componentType.name] = component.serialize();
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return serializedEntity;
        };
        /**
         * 反序列化
         * @param data
         */
        Entity.prototype.deserialize = function (data) {
            var e_3, _a;
            for (var componentName in data.components) {
                try {
                    for (var _b = __values(this.componentManagers), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var _d = __read(_c.value, 2), componentType = _d[0], manager = _d[1];
                        if (componentType.name === componentName) {
                            var component = manager.get(this.id);
                            if (component) {
                                component.deserialize(data.components[componentName]);
                            }
                            break;
                        }
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
            }
        };
        /**
         * 实体创建时的逻辑
         */
        Entity.prototype.onCreate = function () {
        };
        /**
         * 实体销毁时的逻辑
         */
        Entity.prototype.onDestroy = function () {
        };
        Entity.prototype.on = function (eventType, listener) {
            this.eventEmitter.on(eventType, listener);
        };
        Entity.prototype.once = function (eventType, callback) {
            this.eventEmitter.once(eventType, callback);
        };
        Entity.prototype.off = function (eventType, listener) {
            this.eventEmitter.off(eventType, listener);
        };
        Entity.prototype.emit = function (type, data) {
            this.eventEmitter.emit(type, data);
        };
        return Entity;
    }());
    gs.Entity = Entity;
})(gs || (gs = {}));
var gs;
(function (gs) {
    /**
     * 系统基类
     */
    var System = /** @class */ (function () {
        function System(entityManager, priority, workerScript) {
            this.paused = false;
            this.enabled = true;
            this.entityManager = entityManager;
            this.priority = priority;
            this.workerScript = workerScript;
        }
        System.prototype.pause = function () {
            this.paused = true;
        };
        System.prototype.resume = function () {
            this.paused = false;
        };
        System.prototype.isPaused = function () {
            return this.paused;
        };
        System.prototype.enable = function () {
            this.enabled = true;
        };
        System.prototype.disable = function () {
            this.enabled = false;
        };
        System.prototype.isEnabled = function () {
            return this.enabled;
        };
        /**
         * 系统注册时的逻辑
         */
        System.prototype.onRegister = function () {
        };
        /**
         * 系统注销时的逻辑
         */
        System.prototype.onUnregister = function () {
        };
        return System;
    }());
    gs.System = System;
})(gs || (gs = {}));
var gs;
(function (gs) {
    var Event = /** @class */ (function () {
        function Event(type, data) {
            this.type = type;
            this.data = data;
        }
        return Event;
    }());
    gs.Event = Event;
})(gs || (gs = {}));
var gs;
(function (gs) {
    var EventEmitter = /** @class */ (function () {
        function EventEmitter() {
            this.listeners = new Map();
            this.eventPool = new gs.EventPool();
        }
        /**
         * 用于订阅特定事件类型的侦听器。当事件类型不存在时，将创建一个新的侦听器数组
         * @param eventType
         * @param listener
         */
        EventEmitter.prototype.on = function (eventType, listener) {
            if (!this.listeners.has(eventType)) {
                this.listeners.set(eventType, []);
            }
            var eventListeners = this.listeners.get(eventType);
            if (eventListeners)
                eventListeners.push(listener);
        };
        /**
         * 用于订阅特定事件类型的侦听器。当事件类型不存在时，将创建一个新的侦听器数组。该方法只会在回调函数被执行后，移除监听器
         * @param eventType
         * @param callback
         */
        EventEmitter.prototype.once = function (eventType, callback) {
            var _this = this;
            var wrappedCallback = function (event) {
                // 在回调函数被执行后，移除监听器
                _this.off(eventType, wrappedCallback);
                callback(event);
            };
            this.on(eventType, wrappedCallback);
        };
        /**
         * 用于取消订阅特定事件类型的侦听器。如果找到侦听器，则将其从数组中移除
         * @param eventType
         * @param listener
         */
        EventEmitter.prototype.off = function (eventType, listener) {
            var eventListeners = this.listeners.get(eventType);
            if (eventListeners) {
                var index = eventListeners.indexOf(listener);
                if (index > -1) {
                    eventListeners.splice(index, 1);
                }
            }
        };
        /**
         * 用于触发事件。该方法将遍历所有订阅给定事件类型的侦听器，并调用它们
         * @param event
         */
        EventEmitter.prototype.emit = function (type, data) {
            var e_4, _a;
            var event = this.eventPool.acquire();
            event.type = type;
            event.data = data;
            var listeners = this.listeners[type];
            if (listeners) {
                try {
                    for (var listeners_1 = __values(listeners), listeners_1_1 = listeners_1.next(); !listeners_1_1.done; listeners_1_1 = listeners_1.next()) {
                        var listener = listeners_1_1.value;
                        listener(event);
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (listeners_1_1 && !listeners_1_1.done && (_a = listeners_1.return)) _a.call(listeners_1);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
            this.eventPool.release(event);
        };
        return EventEmitter;
    }());
    gs.EventEmitter = EventEmitter;
})(gs || (gs = {}));
var gs;
(function (gs) {
    gs.GlobalEventEmitter = new gs.EventEmitter();
})(gs || (gs = {}));
var gs;
(function (gs) {
    var InputAdapter = /** @class */ (function () {
        function InputAdapter(inputManager) {
            this.inputManager = inputManager;
        }
        return InputAdapter;
    }());
    gs.InputAdapter = InputAdapter;
})(gs || (gs = {}));
var gs;
(function (gs) {
    /**
     * 输入缓冲区
     */
    var InputBuffer = /** @class */ (function () {
        function InputBuffer() {
            this.buffer = [];
        }
        InputBuffer.prototype.addEvent = function (event) {
            this.buffer.push(event);
        };
        InputBuffer.prototype.hasEvents = function () {
            return this.buffer.length > 0;
        };
        InputBuffer.prototype.getEvents = function () {
            return this.buffer;
        };
        InputBuffer.prototype.consumeEvent = function () {
            if (this.buffer.length === 0) {
                return null;
            }
            var event = this.buffer[0];
            this.buffer.shift();
            return event;
        };
        InputBuffer.prototype.clear = function () {
            this.buffer = [];
        };
        return InputBuffer;
    }());
    gs.InputBuffer = InputBuffer;
})(gs || (gs = {}));
var gs;
(function (gs) {
    var InputManager = /** @class */ (function () {
        function InputManager() {
            this.inputBuffer = new gs.InputBuffer();
        }
        InputManager.prototype.setAdapter = function (adapter) {
            this.adapter = adapter;
        };
        InputManager.prototype.getInputBuffer = function () {
            return this.inputBuffer;
        };
        return InputManager;
    }());
    gs.InputManager = InputManager;
})(gs || (gs = {}));
var gs;
(function (gs) {
    var InputType;
    (function (InputType) {
        InputType[InputType["KEY_DOWN"] = 0] = "KEY_DOWN";
        InputType[InputType["KEY_UP"] = 1] = "KEY_UP";
        InputType[InputType["MOUSE_DOWN"] = 2] = "MOUSE_DOWN";
        InputType[InputType["MOUSE_UP"] = 3] = "MOUSE_UP";
        InputType[InputType["MOUSE_MOVE"] = 4] = "MOUSE_MOVE";
    })(InputType = gs.InputType || (gs.InputType = {}));
})(gs || (gs = {}));
var gs;
(function (gs) {
    /**
     * 组件管理器
     */
    var ComponentManager = /** @class */ (function () {
        function ComponentManager(componentType) {
            this.data = [];
            this.entityToDataIndex = new Map();
            this.freeDataIndices = [];
            this.componentType = componentType;
        }
        ComponentManager.prototype.create = function (entityId) {
            var index = this.allocateDataIndex();
            var component = new this.componentType(entityId);
            this.data[index] = component;
            this.entityToDataIndex.set(entityId, index);
            return component;
        };
        /**
         * 获取组件数据
         * @param entityId 实体ID
         * @returns 组件数据
         */
        ComponentManager.prototype.get = function (entityId) {
            var dataIndex = this.entityToDataIndex.get(entityId);
            if (dataIndex === undefined) {
                return null;
            }
            return this.data[dataIndex];
        };
        /**
         *
         * @param entityId
         * @returns
         */
        ComponentManager.prototype.has = function (entityId) {
            return this.entityToDataIndex.has(entityId);
        };
        /**
         *
         * @param entityId
         * @returns
         */
        ComponentManager.prototype.remove = function (entityId) {
            var dataIndex = this.entityToDataIndex.get(entityId);
            if (dataIndex === undefined) {
                return;
            }
            this.entityToDataIndex.delete(entityId);
            this.data[dataIndex] = null;
            this.freeDataIndices.push(dataIndex);
        };
        /**
         * 分配数据索引
         * @returns
         */
        ComponentManager.prototype.allocateDataIndex = function () {
            if (this.freeDataIndices.length > 0) {
                return this.freeDataIndices.pop();
            }
            return this.data.length;
        };
        return ComponentManager;
    }());
    gs.ComponentManager = ComponentManager;
})(gs || (gs = {}));
var gs;
(function (gs) {
    var EntityManager = /** @class */ (function () {
        function EntityManager(componentManagers) {
            var e_5, _a;
            this.entities = new Map();
            this.entityIdAllocator = new gs.EntityIdAllocator();
            this.componentManagers = new Map();
            this.inputManager = new gs.InputManager();
            this.networkManager = new gs.NetworkManager();
            try {
                for (var componentManagers_1 = __values(componentManagers), componentManagers_1_1 = componentManagers_1.next(); !componentManagers_1_1.done; componentManagers_1_1 = componentManagers_1.next()) {
                    var manager = componentManagers_1_1.value;
                    this.componentManagers.set(manager.componentType, manager);
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (componentManagers_1_1 && !componentManagers_1_1.done && (_a = componentManagers_1.return)) _a.call(componentManagers_1);
                }
                finally { if (e_5) throw e_5.error; }
            }
        }
        EntityManager.prototype.getInputManager = function () {
            return this.inputManager;
        };
        EntityManager.prototype.getNetworkManager = function () {
            return this.networkManager;
        };
        /**
         * 创建实体
         * @returns
         */
        EntityManager.prototype.createEntity = function () {
            var entityId = this.entityIdAllocator.allocate();
            var entity = new gs.Entity(entityId, this.componentManagers);
            entity.onCreate();
            return entity;
        };
        /**
         * 删除实体
         * @param entityId
         */
        EntityManager.prototype.deleteEntity = function (entityId) {
            var entity = this.getEntity(entityId);
            entity.onDestroy();
            this.entities.delete(entityId);
        };
        /**
         * 获取实体
         * @param entityId 实体id
         * @returns 实体
         */
        EntityManager.prototype.getEntity = function (entityId) {
            return this.entities.has(entityId) ? this.entities.get(entityId) : null;
        };
        /**
         * 获取具有特定组件的所有实体
         * @param componentClass 要检查的组件类
         * @returns 具有指定组件的实体数组
         */
        EntityManager.prototype.getEntitiesWithComponent = function (componentClass) {
            var e_6, _a;
            var entitiesWithComponent = [];
            try {
                for (var _b = __values(this.getEntities()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var entity = _c.value;
                    if (entity.hasComponent(componentClass)) {
                        entitiesWithComponent.push(entity);
                    }
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_6) throw e_6.error; }
            }
            return entitiesWithComponent;
        };
        /**
         * 获取所有实体
         * @returns
         */
        EntityManager.prototype.getEntities = function () {
            return Array.from(this.entities.values());
        };
        /**
        * 获取具有特定标签的所有实体
        * @param tag 要检查的标签
        * @returns 具有指定标签的实体数组
        */
        EntityManager.prototype.getEntitiesWithTag = function (tag) {
            var e_7, _a;
            var entitiesWithTag = [];
            try {
                for (var _b = __values(this.getEntities()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var entity = _c.value;
                    if (entity.hasTag(tag)) {
                        entitiesWithTag.push(entity);
                    }
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_7) throw e_7.error; }
            }
            return entitiesWithTag;
        };
        /**
         * 创建当前游戏状态的快照
         * @returns
         */
        EntityManager.prototype.createStateSnapshot = function () {
            var e_8, _a;
            var snapshot = {
                entities: [],
            };
            try {
                for (var _b = __values(this.getEntities()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var entity = _c.value;
                    snapshot.entities.push(entity.serialize());
                }
            }
            catch (e_8_1) { e_8 = { error: e_8_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_8) throw e_8.error; }
            }
            return snapshot;
        };
        /**
         * 使用给定的状态快照更新游戏状态
         * @param stateSnapshot
         */
        EntityManager.prototype.updateStateFromSnapshot = function (stateSnapshot) {
            var e_9, _a;
            var newEntityMap = new Map();
            try {
                for (var _b = __values(stateSnapshot.entities), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var entityData = _c.value;
                    var entityId = entityData.id;
                    var entity = this.getEntity(entityId);
                    if (!entity) {
                        entity = new gs.Entity(entityId, this.componentManagers);
                        entity.onCreate();
                    }
                    entity.deserialize(entityData);
                    newEntityMap.set(entityId, entity);
                }
            }
            catch (e_9_1) { e_9 = { error: e_9_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_9) throw e_9.error; }
            }
            this.entities = newEntityMap;
        };
        /**
         * 应用插值
         * @param factor
         */
        EntityManager.prototype.applyInterpolation = function (factor) {
            var e_10, _a, e_11, _b;
            try {
                for (var _c = __values(this.getEntities()), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var entity = _d.value;
                    try {
                        for (var _e = __values(this.componentManagers), _f = _e.next(); !_f.done; _f = _e.next()) {
                            var _g = __read(_f.value, 2), componentType = _g[0], manager = _g[1];
                            var component = entity.getComponent(componentType);
                            if (component instanceof gs.Component && 'savePreviousState' in component && 'applyInterpolation' in component) {
                                component.applyInterpolation(factor);
                            }
                        }
                    }
                    catch (e_11_1) { e_11 = { error: e_11_1 }; }
                    finally {
                        try {
                            if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                        }
                        finally { if (e_11) throw e_11.error; }
                    }
                }
            }
            catch (e_10_1) { e_10 = { error: e_10_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_10) throw e_10.error; }
            }
        };
        return EntityManager;
    }());
    gs.EntityManager = EntityManager;
})(gs || (gs = {}));
var gs;
(function (gs) {
    /**
     * 系统管理器
     */
    var SystemManager = /** @class */ (function () {
        function SystemManager(entityManager) {
            this.systemWorkers = new Map();
            this.systems = [];
            this.entityManager = entityManager;
        }
        /**
         * 注册系统
         * @param system 系统
         */
        SystemManager.prototype.registerSystem = function (system) {
            system.onRegister();
            this.systems.push(system);
            this.systems.sort(function (a, b) { return a.priority - b.priority; });
            if (system.workerScript) {
                if (typeof Worker === 'undefined') {
                    console.warn('Web Workers 在当前环境中不受支持。系统将在主线程中运行');
                }
                else {
                    var worker = new Worker(system.workerScript);
                    this.systemWorkers.set(system, worker);
                }
            }
        };
        /**
         * 注销系统
         * @param system
         */
        SystemManager.prototype.unregisterSystem = function (system) {
            system.onUnregister();
            var index = this.systems.indexOf(system);
            if (index > -1) {
                this.systems.splice(index, 1);
            }
        };
        /**
         * 更新系统
         * @param deltaTime
         */
        SystemManager.prototype.update = function (deltaTime) {
            var _this = this;
            var e_12, _a;
            var entities = this.entityManager.getEntities();
            var _loop_2 = function (system) {
                if (!system.isEnabled() || system.isPaused()) {
                    return "continue";
                }
                var filteredEntities = entities.filter(function (entity) { return system.entityFilter(entity); });
                var worker = this_1.systemWorkers.get(system);
                if (worker) {
                    var message = {
                        deltaTime: deltaTime,
                        entities: filteredEntities.map(function (entity) { return entity.serialize(); }),
                    };
                    worker.postMessage(message);
                    worker.onmessage = function (event) {
                        var e_13, _a;
                        var updatedEntities = event.data.entities;
                        try {
                            for (var updatedEntities_1 = __values(updatedEntities), updatedEntities_1_1 = updatedEntities_1.next(); !updatedEntities_1_1.done; updatedEntities_1_1 = updatedEntities_1.next()) {
                                var updatedEntityData = updatedEntities_1_1.value;
                                var entity = _this.entityManager.getEntity(updatedEntityData.id);
                                if (entity) {
                                    entity.deserialize(updatedEntityData);
                                }
                            }
                        }
                        catch (e_13_1) { e_13 = { error: e_13_1 }; }
                        finally {
                            try {
                                if (updatedEntities_1_1 && !updatedEntities_1_1.done && (_a = updatedEntities_1.return)) _a.call(updatedEntities_1);
                            }
                            finally { if (e_13) throw e_13.error; }
                        }
                    };
                }
                else {
                    system.update(filteredEntities);
                }
            };
            var this_1 = this;
            try {
                for (var _b = __values(this.systems), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var system = _c.value;
                    _loop_2(system);
                }
            }
            catch (e_12_1) { e_12 = { error: e_12_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_12) throw e_12.error; }
            }
        };
        return SystemManager;
    }());
    gs.SystemManager = SystemManager;
})(gs || (gs = {}));
var gs;
(function (gs) {
    /**
     * 时间管理器
     */
    var TimeManager = /** @class */ (function () {
        function TimeManager() {
            this.deltaTime = 0;
            this.timeScale = 1;
            this.totalTime = 0;
        }
        TimeManager.getInstance = function () {
            if (!TimeManager.instance) {
                TimeManager.instance = new TimeManager();
            }
            return TimeManager.instance;
        };
        TimeManager.prototype.update = function (deltaTime) {
            this.deltaTime = deltaTime * this.timeScale;
            this.totalTime += this.deltaTime;
        };
        return TimeManager;
    }());
    gs.TimeManager = TimeManager;
})(gs || (gs = {}));
var gs;
(function (gs) {
    var NetworkManager = /** @class */ (function () {
        function NetworkManager() {
            this.networkAdapter = null;
        }
        /**
         * 设置网络适配器
         * @param adapter 用户实现的NetworkAdapter接口
         */
        NetworkManager.prototype.setNetworkAdapter = function (adapter) {
            this.networkAdapter = adapter;
        };
        /**
         * 获取网络适配器
         * @returns
         */
        NetworkManager.prototype.getNetworkAdpater = function () {
            return this.networkAdapter;
        };
        return NetworkManager;
    }());
    gs.NetworkManager = NetworkManager;
})(gs || (gs = {}));
var gs;
(function (gs) {
    var ObjectPool = /** @class */ (function () {
        function ObjectPool(createFn, resetFn) {
            this.createFn = createFn;
            this.resetFn = resetFn;
            this.pool = [];
        }
        ObjectPool.prototype.acquire = function () {
            if (this.pool.length > 0) {
                var obj = this.pool.pop();
                this.resetFn(obj);
                return obj;
            }
            else {
                return this.createFn();
            }
        };
        ObjectPool.prototype.release = function (obj) {
            this.pool.push(obj);
        };
        return ObjectPool;
    }());
    gs.ObjectPool = ObjectPool;
})(gs || (gs = {}));
///<reference path="ObjectPool.ts" />
var gs;
///<reference path="ObjectPool.ts" />
(function (gs) {
    var EventPool = /** @class */ (function (_super) {
        __extends(EventPool, _super);
        function EventPool() {
            return _super.call(this, function () { return new gs.Event("", null); }, function (event) {
                event.type = "";
                event.data = null;
            }) || this;
        }
        return EventPool;
    }(gs.ObjectPool));
    gs.EventPool = EventPool;
})(gs || (gs = {}));
var gs;
(function (gs) {
    var StateMachine = /** @class */ (function () {
        function StateMachine() {
            this.currentState = null;
            this.states = new Map();
        }
        StateMachine.prototype.addState = function (name, state) {
            this.states.set(name, state);
        };
        StateMachine.prototype.changeState = function (name) {
            if (!this.states.has(name)) {
                console.warn("\u72B6\u6001 \"" + name + "\" \u4E0D\u5B58\u5728.");
                return;
            }
            var newState = this.states.get(name);
            if (this.currentState && this.currentState.exit) {
                this.currentState.exit();
            }
            this.currentState = newState;
            if (this.currentState.enter) {
                this.currentState.enter();
            }
        };
        StateMachine.prototype.update = function () {
            if (this.currentState && this.currentState.update) {
                this.currentState.update();
            }
        };
        return StateMachine;
    }());
    gs.StateMachine = StateMachine;
})(gs || (gs = {}));
///<reference path="../Core/Component.ts" />
var gs;
///<reference path="../Core/Component.ts" />
(function (gs) {
    var StateMachineComponent = /** @class */ (function (_super) {
        __extends(StateMachineComponent, _super);
        function StateMachineComponent() {
            var _this = _super.call(this) || this;
            _this.stateMachine = new gs.StateMachine();
            return _this;
        }
        return StateMachineComponent;
    }(gs.Component));
    gs.StateMachineComponent = StateMachineComponent;
})(gs || (gs = {}));
///<reference path="../Core/System.ts" />
var gs;
///<reference path="../Core/System.ts" />
(function (gs) {
    var StateMachineSystem = /** @class */ (function (_super) {
        __extends(StateMachineSystem, _super);
        function StateMachineSystem(entityManager) {
            return _super.call(this, entityManager, 1) || this;
        }
        StateMachineSystem.prototype.entityFilter = function (entity) {
            return entity.hasComponent(gs.StateMachineComponent);
        };
        StateMachineSystem.prototype.update = function (entities) {
            var e_14, _a;
            try {
                for (var entities_1 = __values(entities), entities_1_1 = entities_1.next(); !entities_1_1.done; entities_1_1 = entities_1.next()) {
                    var entity = entities_1_1.value;
                    var stateMachineComponent = entity.getComponent(gs.StateMachineComponent);
                    stateMachineComponent.stateMachine.update();
                }
            }
            catch (e_14_1) { e_14 = { error: e_14_1 }; }
            finally {
                try {
                    if (entities_1_1 && !entities_1_1.done && (_a = entities_1.return)) _a.call(entities_1);
                }
                finally { if (e_14) throw e_14.error; }
            }
        };
        return StateMachineSystem;
    }(gs.System));
    gs.StateMachineSystem = StateMachineSystem;
})(gs || (gs = {}));
var gs;
(function (gs) {
    var EntityIdAllocator = /** @class */ (function () {
        function EntityIdAllocator() {
            this.nextId = 0;
        }
        EntityIdAllocator.prototype.allocate = function () {
            var newId = this.nextId;
            this.nextId += 1;
            return newId;
        };
        return EntityIdAllocator;
    }());
    gs.EntityIdAllocator = EntityIdAllocator;
})(gs || (gs = {}));
var gs;
(function (gs) {
    var Random = /** @class */ (function () {
        function Random(seed) {
            this.seed = seed;
        }
        /**
         * 生成 [0, 1) 范围内的随机浮点数
         * @returns
         */
        Random.prototype.next = function () {
            this.seed = (this.seed * 9301 + 49297) % 233280;
            return this.seed / 233280;
        };
        /**
         * 生成 [min, max) 范围内的随机整数
         * @param min
         * @param max
         * @returns
         */
        Random.prototype.nextInt = function (min, max) {
            return min + Math.floor(this.next() * (max - min));
        };
        /**
         * 生成 [min, max) 范围内的随机浮点数
         * @param min
         * @param max
         * @returns
         */
        Random.prototype.nextFloat = function (min, max) {
            return min + this.next() * (max - min);
        };
        /**
         * 从数组中随机选择一个元素
         * @param array
         * @returns
         */
        Random.prototype.choose = function (array) {
            var index = this.nextInt(0, array.length);
            return array[index];
        };
        return Random;
    }());
    gs.Random = Random;
})(gs || (gs = {}));
