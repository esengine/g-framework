"use strict";
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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var gs;
(function (gs) {
    var physics;
    (function (physics) {
        var CollisionEvent = /** @class */ (function (_super) {
            __extends(CollisionEvent, _super);
            function CollisionEvent(type, entity1, entity2, velocities) {
                var _this = _super.call(this, type) || this;
                _this.entity1 = entity1;
                _this.entity2 = entity2;
                _this.velocities = velocities;
                return _this;
            }
            CollisionEvent.prototype.reset = function () {
                _super.prototype.reset.call(this);
                this.entity1 = null;
                this.entity2 = null;
                this.velocities = { v1: new physics.Vector2(0, 0), v2: new physics.Vector2(0, 0) };
            };
            CollisionEvent.prototype.getEntity1 = function () {
                return this.entity1;
            };
            CollisionEvent.prototype.getEntity2 = function () {
                return this.entity2;
            };
            CollisionEvent.prototype.getVelocities = function () {
                return this.velocities;
            };
            return CollisionEvent;
        }(gs.Event));
        physics.CollisionEvent = CollisionEvent;
    })(physics = gs.physics || (gs.physics = {}));
})(gs || (gs = {}));
var gs;
(function (gs) {
    var physics;
    (function (physics) {
        var CollisionHandlerSystem = /** @class */ (function () {
            function CollisionHandlerSystem() {
                gs.GlobalEventEmitter.on('collision', this.handleCollision.bind(this));
            }
            CollisionHandlerSystem.prototype.handleCollision = function (event) {
                var _a = event.data, entity1 = _a.entity1, entity2 = _a.entity2, velocities = _a.velocities;
                entity1.getComponent(physics.RigidBody).velocity = velocities.v1;
                entity2.getComponent(physics.RigidBody).velocity = velocities.v2;
            };
            return CollisionHandlerSystem;
        }());
        physics.CollisionHandlerSystem = CollisionHandlerSystem;
    })(physics = gs.physics || (gs.physics = {}));
})(gs || (gs = {}));
var gs;
(function (gs) {
    var physics;
    (function (physics) {
        var CollisionResponseSystem = /** @class */ (function (_super) {
            __extends(CollisionResponseSystem, _super);
            function CollisionResponseSystem(entityManager, cellSize) {
                if (cellSize === void 0) { cellSize = 100; }
                var _this = _super.call(this, entityManager, 0, gs.Matcher.empty().all(physics.RigidBody, physics.Collider)) || this;
                _this.processed = new Map();
                _this.spatialHash = new physics.SpatialHash(cellSize);
                return _this;
            }
            CollisionResponseSystem.prototype.update = function (entities) {
                var e_1, _a, e_2, _b;
                var _c = this, spatialHash = _c.spatialHash, processed = _c.processed;
                spatialHash.clear();
                processed.clear();
                try {
                    for (var entities_1 = __values(entities), entities_1_1 = entities_1.next(); !entities_1_1.done; entities_1_1 = entities_1.next()) {
                        var entity = entities_1_1.value;
                        var collider = entity.getComponent(physics.Collider);
                        if (!collider)
                            continue;
                        var bounds = collider.getBounds();
                        spatialHash.insert(bounds);
                        collider.isColliding = false;
                        var entityId = entity.getId();
                        var processedPairs = processed.get(entityId);
                        if (!processedPairs) {
                            processedPairs = new Set();
                            processed.set(entityId, processedPairs);
                        }
                        processedPairs.add(entityId);
                        var spatialHashCandidates = spatialHash.retrieve(bounds);
                        try {
                            for (var spatialHashCandidates_1 = __values(spatialHashCandidates), spatialHashCandidates_1_1 = spatialHashCandidates_1.next(); !spatialHashCandidates_1_1.done; spatialHashCandidates_1_1 = spatialHashCandidates_1.next()) {
                                var candidate = spatialHashCandidates_1_1.value;
                                var candidateId = candidate.entity.getId();
                                if (entityId === candidateId || processedPairs.has(candidateId)) {
                                    continue;
                                }
                                var collider2 = candidate.entity.getComponent(physics.Collider);
                                var bounds2 = collider2.getBounds();
                                if (this.isColliding(bounds, bounds2)) {
                                    collider.isColliding = true;
                                    collider2.isColliding = true;
                                    // let body1 = entity.getComponent(RigidBody);
                                    // let body2 = candidate.entity.getComponent(RigidBody);
                                    // const velocityAfterCollision = this.calculateVelocityAfterCollision(body1, body2);
                                    // body1.velocity = velocityAfterCollision.v1;
                                    // body2.velocity = velocityAfterCollision.v2;
                                }
                                processedPairs.add(candidateId);
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (spatialHashCandidates_1_1 && !spatialHashCandidates_1_1.done && (_b = spatialHashCandidates_1.return)) _b.call(spatialHashCandidates_1);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
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
            CollisionResponseSystem.prototype.calculateVelocityAfterCollision = function (body1, body2) {
                var massSum = physics.FixedPoint.add(body1.mass, body2.mass);
                var massDiff1 = physics.FixedPoint.sub(body1.mass, body2.mass);
                var massDiff2 = physics.FixedPoint.sub(body2.mass, body1.mass);
                var massDouble1 = physics.FixedPoint.mul(body1.mass, 2);
                var massDouble2 = physics.FixedPoint.mul(body2.mass, 2);
                var v1 = body1.velocity.multiplyScalar(massDiff1.toFloat()).divideScalar(massSum.toFloat())
                    .add(body2.velocity.multiplyScalar(massDouble2.toFloat()).divideScalar(massSum.toFloat()));
                var v2 = body1.velocity.multiplyScalar(massDouble1.toFloat()).divideScalar(massSum.toFloat())
                    .subtract(body2.velocity.multiplyScalar(massDiff2.toFloat()).divideScalar(massSum.toFloat()));
                return { v1: v1, v2: v2 };
            };
            CollisionResponseSystem.prototype.isColliding = function (bounds1, bounds2) {
                var position1 = bounds1.position, width1 = bounds1.width, height1 = bounds1.height;
                var position2 = bounds2.position, width2 = bounds2.width, height2 = bounds2.height;
                return !(position2.x.gt(physics.FixedPoint.add(position1.x, width1)) ||
                    physics.FixedPoint.add(position2.x, width2).lt(position1.x) ||
                    position2.y.gt(physics.FixedPoint.add(position1.y, height1)) ||
                    physics.FixedPoint.add(position2.y, height2).lt(position1.y));
            };
            return CollisionResponseSystem;
        }(gs.System));
        physics.CollisionResponseSystem = CollisionResponseSystem;
    })(physics = gs.physics || (gs.physics = {}));
})(gs || (gs = {}));
var gs;
(function (gs) {
    var physics;
    (function (physics) {
        var FixedPoint = /** @class */ (function () {
            function FixedPoint(value, precision) {
                if (value === void 0) { value = 0; }
                if (precision === void 0) { precision = 1000; }
                this.rawValue = Math.round(value * precision);
                this.precision = precision;
            }
            FixedPoint.prototype.add = function (other) {
                if (other instanceof FixedPoint) {
                    this.rawValue += other.rawValue;
                }
                else {
                    this.rawValue += Math.round(other * this.precision);
                }
                return this;
            };
            FixedPoint.prototype.sub = function (other) {
                if (other instanceof FixedPoint) {
                    this.rawValue -= other.rawValue;
                }
                else {
                    this.rawValue -= Math.round(other * this.precision);
                }
                return this;
            };
            FixedPoint.prototype.mul = function (other) {
                if (other instanceof FixedPoint) {
                    this.rawValue = Math.round((this.rawValue * other.rawValue) / other.precision);
                }
                else {
                    this.rawValue = Math.round(this.rawValue * other);
                }
                return this;
            };
            FixedPoint.prototype.div = function (other) {
                if (other instanceof FixedPoint) {
                    this.rawValue = Math.round((this.rawValue / other.rawValue) * this.precision);
                }
                else {
                    this.rawValue = Math.round(this.rawValue / other);
                }
                return this;
            };
            FixedPoint.prototype.lt = function (other) {
                if (other instanceof FixedPoint) {
                    return this.rawValue < other.rawValue;
                }
                else {
                    return this.rawValue < Math.round(other * this.precision);
                }
            };
            FixedPoint.prototype.gt = function (other) {
                if (other instanceof FixedPoint) {
                    return this.rawValue > other.rawValue;
                }
                else {
                    return this.rawValue > Math.round(other * this.precision);
                }
            };
            FixedPoint.prototype.gte = function (other) {
                if (other instanceof FixedPoint) {
                    return this.rawValue >= other.rawValue;
                }
                else {
                    return this.rawValue >= Math.round(other * this.precision);
                }
            };
            FixedPoint.prototype.lte = function (other) {
                if (other instanceof FixedPoint) {
                    return this.rawValue <= other.rawValue;
                }
                else {
                    return this.rawValue <= Math.round(other * this.precision);
                }
            };
            FixedPoint.prototype.neg = function () {
                var result = new FixedPoint();
                result.rawValue = -this.rawValue;
                return result;
            };
            FixedPoint.prototype.toFloat = function () {
                return this.rawValue / this.precision;
            };
            FixedPoint.add = function (a, b) {
                var result = new FixedPoint();
                if (b instanceof FixedPoint) {
                    result.rawValue = a.rawValue + b.rawValue;
                }
                else {
                    result.rawValue = a.rawValue + Math.round(b * a.precision);
                }
                return result;
            };
            FixedPoint.sub = function (a, b) {
                var result = new FixedPoint();
                if (b instanceof FixedPoint) {
                    result.rawValue = a.rawValue - b.rawValue;
                }
                else {
                    result.rawValue = a.rawValue - Math.round(b * a.precision);
                }
                return result;
            };
            FixedPoint.mul = function (a, b) {
                var result = new FixedPoint();
                if (b instanceof FixedPoint) {
                    result.rawValue = Math.round((a.rawValue * b.rawValue) / b.precision);
                }
                else {
                    result.rawValue = Math.round(a.rawValue * b);
                }
                return result;
            };
            FixedPoint.div = function (a, b) {
                var result = new FixedPoint();
                if (b instanceof FixedPoint) {
                    result.rawValue = Math.round((a.rawValue / b.rawValue) * a.precision);
                }
                else {
                    result.rawValue = Math.round(a.rawValue / b);
                }
                return result;
            };
            FixedPoint.max = function (a, b) {
                return a.gt(b) ? a : b;
            };
            FixedPoint.min = function (a, b) {
                return a.lt(b) ? a : b;
            };
            return FixedPoint;
        }());
        physics.FixedPoint = FixedPoint;
    })(physics = gs.physics || (gs.physics = {}));
})(gs || (gs = {}));
var gs;
(function (gs) {
    var physics;
    (function (physics) {
        var GRID_SIZE = 100;
        var Grid = /** @class */ (function () {
            function Grid() {
                this.grid = new Map();
            }
            Grid.prototype.getKey = function (position) {
                var gridX = Math.floor(position.x.toFloat() / GRID_SIZE);
                var gridY = Math.floor(position.y.toFloat() / GRID_SIZE);
                return gridX + "," + gridY;
            };
            // 将物体插入到网格中
            Grid.prototype.insert = function (obj) {
                var minX = Math.floor(obj.position.x.toFloat() / GRID_SIZE);
                var minY = Math.floor(obj.position.y.toFloat() / GRID_SIZE);
                var maxX = Math.floor((obj.position.x.toFloat() + obj.width.toFloat()) / GRID_SIZE);
                var maxY = Math.floor((obj.position.y.toFloat() + obj.height.toFloat()) / GRID_SIZE);
                for (var x = minX; x <= maxX; x++) {
                    for (var y = minY; y <= maxY; y++) {
                        var key = x + "," + y;
                        if (!this.grid.has(key)) {
                            this.grid.set(key, new Set());
                        }
                        this.grid.get(key).add(obj);
                    }
                }
            };
            // 返回所有可能与给定物体发生碰撞的物体
            Grid.prototype.retrieve = function (obj) {
                var e_3, _a;
                var returnObjects = new Set();
                var minX = Math.floor(obj.position.x.toFloat() / GRID_SIZE);
                var minY = Math.floor(obj.position.y.toFloat() / GRID_SIZE);
                var maxX = Math.floor((obj.position.x.toFloat() + obj.width.toFloat()) / GRID_SIZE);
                var maxY = Math.floor((obj.position.y.toFloat() + obj.height.toFloat()) / GRID_SIZE);
                for (var x = minX; x <= maxX; x++) {
                    for (var y = minY; y <= maxY; y++) {
                        var key = x + "," + y;
                        if (this.grid.has(key)) {
                            try {
                                for (var _b = __values(this.grid.get(key)), _c = _b.next(); !_c.done; _c = _b.next()) {
                                    var object = _c.value;
                                    returnObjects.add(object);
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
                    }
                }
                return returnObjects;
            };
            // 清空网格
            Grid.prototype.clear = function () {
                this.grid.clear();
            };
            return Grid;
        }());
        physics.Grid = Grid;
    })(physics = gs.physics || (gs.physics = {}));
})(gs || (gs = {}));
var gs;
(function (gs) {
    var physics;
    (function (physics) {
        var MAX_OBJECTS = 50;
        var MAX_LEVELS = 5;
        var QuadTree = /** @class */ (function () {
            function QuadTree(level, bounds, cellSize) {
                if (cellSize === void 0) { cellSize = 100; }
                this.cellSize = cellSize;
                this.level = level;
                this.bounds = bounds;
                this.spatialHash = new physics.SpatialHash(cellSize);
                this.nodes = [];
            }
            // 将物体分配到四个象限中
            QuadTree.prototype.split = function () {
                var e_4, _a;
                var subWidth = physics.FixedPoint.div(this.bounds.width, 2);
                var subHeight = physics.FixedPoint.div(this.bounds.height, 2);
                var x = this.bounds.position.x;
                var y = this.bounds.position.y;
                var topLeftPosition = new physics.Vector2(x.toFloat(), y.toFloat());
                var topRightPosition = new physics.Vector2(physics.FixedPoint.add(x, subWidth).toFloat(), y.toFloat());
                var bottomLeftPosition = new physics.Vector2(x.toFloat(), physics.FixedPoint.add(y, subHeight).toFloat());
                var bottomRightPosition = new physics.Vector2(physics.FixedPoint.add(x, subWidth).toFloat(), physics.FixedPoint.add(y, subHeight).toFloat());
                this.nodes[0] = new QuadTree(this.level + 1, { position: topRightPosition, width: subWidth, height: subHeight }, this.cellSize);
                this.nodes[1] = new QuadTree(this.level + 1, { position: topLeftPosition, width: subWidth, height: subHeight }, this.cellSize);
                this.nodes[2] = new QuadTree(this.level + 1, { position: bottomRightPosition, width: subWidth, height: subHeight }, this.cellSize);
                this.nodes[3] = new QuadTree(this.level + 1, { position: bottomLeftPosition, width: subWidth, height: subHeight }, this.cellSize);
                var objects = this.spatialHash.retrieveAll();
                this.spatialHash.clear();
                try {
                    for (var objects_1 = __values(objects), objects_1_1 = objects_1.next(); !objects_1_1.done; objects_1_1 = objects_1.next()) {
                        var object = objects_1_1.value;
                        this.insert(object);
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (objects_1_1 && !objects_1_1.done && (_a = objects_1.return)) _a.call(objects_1);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            };
            // 将物体插入到四叉树中
            QuadTree.prototype.insert = function (obj) {
                var e_5, _a;
                if (this.nodes[0]) {
                    var indexes = this.getIndexes(obj);
                    try {
                        for (var indexes_1 = __values(indexes), indexes_1_1 = indexes_1.next(); !indexes_1_1.done; indexes_1_1 = indexes_1.next()) {
                            var index = indexes_1_1.value;
                            this.nodes[index].insert(obj);
                        }
                    }
                    catch (e_5_1) { e_5 = { error: e_5_1 }; }
                    finally {
                        try {
                            if (indexes_1_1 && !indexes_1_1.done && (_a = indexes_1.return)) _a.call(indexes_1);
                        }
                        finally { if (e_5) throw e_5.error; }
                    }
                }
                if (this.spatialHash.retrieve(obj).length > MAX_OBJECTS && this.level < MAX_LEVELS && !this.nodes[0]) {
                    this.split();
                }
                this.spatialHash.insert(obj);
            };
            // 获取物体应该位于哪个象限
            QuadTree.prototype.getIndex = function (obj) {
                var index = -1;
                var verticalMidpoint = physics.FixedPoint.add(this.bounds.position.x, physics.FixedPoint.div(this.bounds.width, 2));
                var horizontalMidpoint = physics.FixedPoint.add(this.bounds.position.y, physics.FixedPoint.div(this.bounds.height, 2));
                var topQuadrant = (obj.position.y.lt(horizontalMidpoint) && physics.FixedPoint.add(obj.position.y, obj.height).lt(horizontalMidpoint));
                var bottomQuadrant = obj.position.y.gt(horizontalMidpoint);
                if (obj.position.x.lt(verticalMidpoint) && physics.FixedPoint.add(obj.position.x, obj.width).lt(verticalMidpoint)) {
                    if (topQuadrant) {
                        index = 1;
                    }
                    else if (bottomQuadrant) {
                        index = 2;
                    }
                }
                else if (obj.position.x.gt(verticalMidpoint)) {
                    if (topQuadrant) {
                        index = 0;
                    }
                    else if (bottomQuadrant) {
                        index = 3;
                    }
                }
                return index;
            };
            // 获取物体可能位于的所有象限
            QuadTree.prototype.getIndexes = function (obj) {
                var indexes = [];
                var verticalMidpoint = physics.FixedPoint.add(this.bounds.position.x, physics.FixedPoint.div(this.bounds.width, 2));
                var horizontalMidpoint = physics.FixedPoint.add(this.bounds.position.y, physics.FixedPoint.div(this.bounds.height, 2));
                var objRight = physics.FixedPoint.add(obj.position.x, obj.width);
                var objBottom = physics.FixedPoint.add(obj.position.y, obj.height);
                var topQuadrant = (obj.position.y.lt(horizontalMidpoint) && objBottom.lt(horizontalMidpoint));
                var bottomQuadrant = obj.position.y.gt(horizontalMidpoint);
                if (obj.position.x.lt(verticalMidpoint) && objRight.lt(verticalMidpoint)) {
                    if (topQuadrant) {
                        indexes.push(1);
                    }
                    if (bottomQuadrant) {
                        indexes.push(2);
                    }
                }
                else if (obj.position.x.gt(verticalMidpoint)) {
                    if (topQuadrant) {
                        indexes.push(0);
                    }
                    if (bottomQuadrant) {
                        indexes.push(3);
                    }
                }
                return indexes;
            };
            // 返回所有可能与给定物体发生碰撞的物体
            QuadTree.prototype.retrieve = function (returnObjects, obj) {
                var e_6, _a, e_7, _b;
                if (!this.boundsIntersects(obj)) {
                    return returnObjects;
                }
                var objects = this.spatialHash.retrieve(obj);
                try {
                    for (var objects_2 = __values(objects), objects_2_1 = objects_2.next(); !objects_2_1.done; objects_2_1 = objects_2.next()) {
                        var object = objects_2_1.value;
                        if (this.collidesWith(object, obj)) {
                            returnObjects.add(object);
                        }
                    }
                }
                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                finally {
                    try {
                        if (objects_2_1 && !objects_2_1.done && (_a = objects_2.return)) _a.call(objects_2);
                    }
                    finally { if (e_6) throw e_6.error; }
                }
                if (this.nodes[0]) {
                    try {
                        for (var _c = __values(this.nodes), _d = _c.next(); !_d.done; _d = _c.next()) {
                            var node = _d.value;
                            node.retrieve(returnObjects, obj);
                        }
                    }
                    catch (e_7_1) { e_7 = { error: e_7_1 }; }
                    finally {
                        try {
                            if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                        }
                        finally { if (e_7) throw e_7.error; }
                    }
                }
                return returnObjects;
            };
            // 使用包围盒相交测试
            QuadTree.prototype.collidesWith = function (obj1, obj2) {
                var obj1Right = physics.FixedPoint.add(obj1.position.x, obj1.width);
                var obj1Bottom = physics.FixedPoint.add(obj1.position.y, obj1.height);
                var obj2Right = physics.FixedPoint.add(obj2.position.x, obj2.width);
                var obj2Bottom = physics.FixedPoint.add(obj2.position.y, obj2.height);
                return !(obj1Right.lt(obj2.position.x) ||
                    obj1Bottom.lt(obj2.position.y) ||
                    obj1.position.x.gt(obj2Right) ||
                    obj1.position.y.gt(obj2Bottom));
            };
            QuadTree.prototype.retrieveAll = function () {
                var objects = this.spatialHash.retrieveAll();
                if (this.nodes[0] != null) {
                    for (var i = 0; i < this.nodes.length; i++) {
                        if (this.nodes[i] != null) {
                            objects = objects.concat(this.nodes[i].retrieveAll());
                        }
                    }
                }
                return objects;
            };
            // 使用简化的相交检测
            QuadTree.prototype.boundsIntersects = function (obj) {
                var objRight = physics.FixedPoint.add(obj.position.x, obj.width);
                var objBottom = physics.FixedPoint.add(obj.position.y, obj.height);
                var boundsRight = physics.FixedPoint.add(this.bounds.position.x, this.bounds.width);
                var boundsBottom = physics.FixedPoint.add(this.bounds.position.y, this.bounds.height);
                return !(objRight.lt(this.bounds.position.x) ||
                    objBottom.lt(this.bounds.position.y) ||
                    obj.position.x.gt(boundsRight) ||
                    obj.position.y.gt(boundsBottom));
            };
            QuadTree.prototype.clear = function () {
                this.spatialHash.clear();
                for (var i = 0; i < this.nodes.length; i++) {
                    if (this.nodes[i] != null) {
                        this.nodes[i].clear();
                        this.nodes[i] = null;
                    }
                }
            };
            return QuadTree;
        }());
        physics.QuadTree = QuadTree;
    })(physics = gs.physics || (gs.physics = {}));
})(gs || (gs = {}));
var gs;
(function (gs) {
    var physics;
    (function (physics) {
        var RigidBody = /** @class */ (function (_super) {
            __extends(RigidBody, _super);
            function RigidBody() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.position = new physics.Vector2();
                _this.velocity = new physics.Vector2();
                _this.mass = new physics.FixedPoint();
                _this.size = new physics.Vector2();
                return _this;
            }
            return RigidBody;
        }(gs.Component));
        physics.RigidBody = RigidBody;
    })(physics = gs.physics || (gs.physics = {}));
})(gs || (gs = {}));
var gs;
(function (gs) {
    var physics;
    (function (physics) {
        var Size = /** @class */ (function () {
            function Size(width, height) {
                if (width === void 0) { width = 0; }
                if (height === void 0) { height = 0; }
                this.width = new physics.FixedPoint(width);
                this.height = new physics.FixedPoint(height);
            }
            Size.prototype.add = function (other) {
                return new Size(this.width.toFloat() + other.width.toFloat(), this.height.toFloat() + other.height.toFloat());
            };
            Size.prototype.subtract = function (other) {
                return new Size(this.width.toFloat() - other.width.toFloat(), this.height.toFloat() - other.height.toFloat());
            };
            Size.prototype.multiply = function (scalar) {
                return new Size(this.width.toFloat() * scalar, this.height.toFloat() * scalar);
            };
            Size.prototype.divide = function (scalar) {
                return new Size(this.width.toFloat() / scalar, this.height.toFloat() / scalar);
            };
            return Size;
        }());
        physics.Size = Size;
    })(physics = gs.physics || (gs.physics = {}));
})(gs || (gs = {}));
var gs;
(function (gs) {
    var physics;
    (function (physics) {
        var SpatialHash = /** @class */ (function () {
            function SpatialHash(cellSize) {
                this.cellSize = cellSize;
                this.hashTable = new Map();
                this.objectTable = new Map();
            }
            SpatialHash.prototype.hash = function (x, y) {
                var prime1 = 73856093, prime2 = 19349663;
                return x * prime1 ^ y * prime2;
            };
            SpatialHash.prototype.insert = function (obj) {
                var minX = Math.floor(obj.position.x.toFloat() / this.cellSize);
                var minY = Math.floor(obj.position.y.toFloat() / this.cellSize);
                var maxX = Math.floor((obj.position.x.toFloat() + obj.width.toFloat()) / this.cellSize);
                var maxY = Math.floor((obj.position.y.toFloat() + obj.height.toFloat()) / this.cellSize);
                var keys = [];
                for (var x = minX; x <= maxX; x++) {
                    for (var y = minY; y <= maxY; y++) {
                        var key = this.hash(x, y);
                        keys.push(key);
                        var bucket = this.hashTable.get(key);
                        if (!bucket) {
                            bucket = new Set();
                            this.hashTable.set(key, bucket);
                        }
                        bucket.add(obj);
                    }
                }
                this.objectTable.set(obj, keys);
            };
            SpatialHash.prototype.retrieve = function (obj) {
                var minX = Math.floor(obj.position.x.toFloat() / this.cellSize);
                var minY = Math.floor(obj.position.y.toFloat() / this.cellSize);
                var maxX = Math.floor((obj.position.x.toFloat() + obj.width.toFloat()) / this.cellSize);
                var maxY = Math.floor((obj.position.y.toFloat() + obj.height.toFloat()) / this.cellSize);
                var result = [];
                for (var x = minX; x <= maxX; x++) {
                    for (var y = minY; y <= maxY; y++) {
                        var key = this.hash(x, y);
                        var bucket = this.hashTable.get(key);
                        if (bucket) {
                            result.push.apply(result, __spread(bucket));
                        }
                    }
                }
                return result;
            };
            SpatialHash.prototype.retrieveAll = function () {
                var e_8, _a;
                var result = [];
                try {
                    for (var _b = __values(this.hashTable.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var bucket = _c.value;
                        result.push.apply(result, __spread(bucket));
                    }
                }
                catch (e_8_1) { e_8 = { error: e_8_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_8) throw e_8.error; }
                }
                return result;
            };
            SpatialHash.prototype.remove = function (obj) {
                var e_9, _a;
                var keys = this.objectTable.get(obj);
                if (keys) {
                    try {
                        for (var keys_1 = __values(keys), keys_1_1 = keys_1.next(); !keys_1_1.done; keys_1_1 = keys_1.next()) {
                            var key = keys_1_1.value;
                            var bucket = this.hashTable.get(key);
                            if (bucket) {
                                bucket.delete(obj);
                            }
                        }
                    }
                    catch (e_9_1) { e_9 = { error: e_9_1 }; }
                    finally {
                        try {
                            if (keys_1_1 && !keys_1_1.done && (_a = keys_1.return)) _a.call(keys_1);
                        }
                        finally { if (e_9) throw e_9.error; }
                    }
                    this.objectTable.delete(obj);
                }
            };
            SpatialHash.prototype.clear = function () {
                this.hashTable.clear();
                this.objectTable.clear();
            };
            return SpatialHash;
        }());
        physics.SpatialHash = SpatialHash;
    })(physics = gs.physics || (gs.physics = {}));
})(gs || (gs = {}));
var gs;
(function (gs) {
    var physics;
    (function (physics) {
        var Transform = /** @class */ (function (_super) {
            __extends(Transform, _super);
            function Transform() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Transform.prototype.onInitialize = function (x, y) {
                if (x === void 0) { x = 0; }
                if (y === void 0) { y = 0; }
                this.position = new physics.Vector2(x, y);
            };
            return Transform;
        }(gs.Component));
        physics.Transform = Transform;
    })(physics = gs.physics || (gs.physics = {}));
})(gs || (gs = {}));
var gs;
(function (gs) {
    var physics;
    (function (physics) {
        var Vector2 = /** @class */ (function () {
            function Vector2(x, y) {
                if (x === void 0) { x = 0; }
                if (y === void 0) { y = 0; }
                this.x = x instanceof physics.FixedPoint ? x : new physics.FixedPoint(x);
                this.y = y instanceof physics.FixedPoint ? y : new physics.FixedPoint(y);
            }
            Vector2.prototype.add = function (other) {
                return new Vector2(this.x.toFloat() + other.x.toFloat(), this.y.toFloat() + other.y.toFloat());
            };
            Vector2.prototype.subtract = function (other) {
                return new Vector2(this.x.toFloat() - other.x.toFloat(), this.y.toFloat() - other.y.toFloat());
            };
            Vector2.prototype.multiply = function (scalar) {
                return new Vector2(this.x.toFloat() * scalar, this.y.toFloat() * scalar);
            };
            Vector2.prototype.divide = function (scalar) {
                return new Vector2(this.x.toFloat() / scalar, this.y.toFloat() / scalar);
            };
            Vector2.prototype.multiplyScalar = function (scalar) {
                return new Vector2(this.x.toFloat() * scalar, this.y.toFloat() * scalar);
            };
            Vector2.prototype.divideScalar = function (scalar) {
                return new Vector2(this.x.toFloat() / scalar, this.y.toFloat() / scalar);
            };
            /** 计算向量的长度 */
            Vector2.prototype.length = function () {
                return new physics.FixedPoint(Math.sqrt(this.x.toFloat() * this.x.toFloat() + this.y.toFloat() * this.y.toFloat()));
            };
            /** 计算向量的平方长度 */
            Vector2.prototype.lengthSquared = function () {
                return new physics.FixedPoint(this.x.toFloat() * this.x.toFloat() + this.y.toFloat() * this.y.toFloat());
            };
            /** 归一化向量 */
            Vector2.prototype.normalize = function () {
                var len = this.length();
                return new Vector2(this.x.div(len), this.y.div(len));
            };
            /** 计算两个向量的点积 */
            Vector2.prototype.dot = function (other) {
                return new physics.FixedPoint(this.x.toFloat() * other.x.toFloat() + this.y.toFloat() * other.y.toFloat());
            };
            /** 计算两个向量的叉积 */
            Vector2.prototype.cross = function (other) {
                return new physics.FixedPoint(this.x.toFloat() * other.y.toFloat() - this.y.toFloat() * other.x.toFloat());
            };
            /** 计算到另一个向量的距离 */
            Vector2.prototype.distanceTo = function (other) {
                var dx = this.x.sub(other.x);
                var dy = this.y.sub(other.y);
                return new physics.FixedPoint(Math.sqrt(dx.toFloat() * dx.toFloat() + dy.toFloat() * dy.toFloat()));
            };
            return Vector2;
        }());
        physics.Vector2 = Vector2;
    })(physics = gs.physics || (gs.physics = {}));
})(gs || (gs = {}));
var gs;
(function (gs) {
    var physics;
    (function (physics) {
        var World = /** @class */ (function () {
            function World(gravity, timeStep, initialPos, initialSize) {
                if (gravity === void 0) { gravity = new physics.FixedPoint(0, -9.81); }
                if (timeStep === void 0) { timeStep = new physics.FixedPoint(1, 60); }
                if (initialPos === void 0) { initialPos = new physics.Vector2(); }
                if (initialSize === void 0) { initialSize = new physics.Size(1000, 1000); }
                this.name = "PhysicsPlugin";
                this.gravity = gravity;
                this.timeStep = timeStep;
                this.bodies = [];
                this.initialPos = initialPos;
                this.size = initialSize;
            }
            World.prototype.onInit = function (core) {
                core.systemManager.registerSystem(new physics.CollisionResponseSystem(core.entityManager));
            };
            World.prototype.onUpdate = function (deltaTime) {
                this.step();
            };
            World.prototype.addBody = function (body) {
                this.bodies.push(body);
            };
            World.prototype.updateSize = function () {
                var e_10, _a;
                try {
                    for (var _b = __values(this.bodies), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var body = _c.value;
                        this.size.width = physics.FixedPoint.max(this.size.width, physics.FixedPoint.add(body.position.x, body.size.x));
                        this.size.height = physics.FixedPoint.max(this.size.height, physics.FixedPoint.add(body.position.y, body.size.y));
                    }
                }
                catch (e_10_1) { e_10 = { error: e_10_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_10) throw e_10.error; }
                }
            };
            World.prototype.handleBorderCollision = function (body) {
                // 当物体碰到边界时反弹
                if (body.position.x.lt(0) || physics.FixedPoint.add(body.position.x, body.size.x).gt(this.size.width)) {
                    body.velocity.x = body.velocity.x.neg();
                }
                if (body.position.y.lt(0) || physics.FixedPoint.add(body.position.y, body.size.y).gt(this.size.height)) {
                    body.velocity.y = body.velocity.y.neg();
                }
            };
            World.prototype.step = function () {
                // for (let body of this.bodies) {
                //     // 更新速度
                //     body.velocity.y = FixedPoint.add(body.velocity.y, FixedPoint.mul(this.gravity, this.timeStep));
                //     // 更新位置
                //     body.position.x = FixedPoint.add(body.position.x, FixedPoint.mul(body.velocity.x, this.timeStep));
                //     body.position.y = FixedPoint.add(body.position.y, FixedPoint.mul(body.velocity.y, this.timeStep));
                //     // 处理边界碰撞
                //     this.handleBorderCollision(body);
                // }
                // 更新世界尺寸
                // this.updateSize();
            };
            return World;
        }());
        physics.World = World;
    })(physics = gs.physics || (gs.physics = {}));
})(gs || (gs = {}));
var gs;
(function (gs) {
    var physics;
    (function (physics) {
        var Collider = /** @class */ (function (_super) {
            __extends(Collider, _super);
            function Collider() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Collider.prototype.getBounds = function () {
                return { position: new physics.Vector2(), width: new physics.FixedPoint(), height: new physics.FixedPoint(), entity: this.entity };
            };
            return Collider;
        }(gs.Component));
        physics.Collider = Collider;
    })(physics = gs.physics || (gs.physics = {}));
})(gs || (gs = {}));
///<reference path="Collider.ts" />
var gs;
///<reference path="Collider.ts" />
(function (gs) {
    var physics;
    (function (physics) {
        var BoxCollider = /** @class */ (function (_super) {
            __extends(BoxCollider, _super);
            function BoxCollider() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.dependencies = [
                    physics.Transform
                ];
                return _this;
            }
            BoxCollider.prototype.onInitialize = function (size) {
                this.size = size;
                this.transform = this.entity.getComponent(physics.Transform);
            };
            BoxCollider.prototype.getBounds = function () {
                return {
                    position: this.transform.position,
                    width: this.size.width,
                    height: this.size.height,
                    entity: this.entity
                };
            };
            return BoxCollider;
        }(physics.Collider));
        physics.BoxCollider = BoxCollider;
    })(physics = gs.physics || (gs.physics = {}));
})(gs || (gs = {}));
var gs;
(function (gs) {
    var physics;
    (function (physics) {
        var Circle = /** @class */ (function () {
            function Circle() {
            }
            Object.defineProperty(Circle.prototype, "width", {
                get: function () {
                    return this.radius.mul(2);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Circle.prototype, "height", {
                get: function () {
                    return this.radius.mul(2);
                },
                enumerable: true,
                configurable: true
            });
            /**
             * 计算圆形面积
             * @returns
             */
            Circle.prototype.area = function () {
                return this.radius.mul(this.radius).mul(Math.PI);
            };
            /**
             * 计算圆形周长
             * @returns
             */
            Circle.prototype.circumference = function () {
                return this.radius.mul(2).mul(Math.PI);
            };
            /**
             * 判断点是否在圆内
             * @param point
             * @returns
             */
            Circle.prototype.containsPoint = function (point) {
                return this.position.distanceTo(point).lte(this.radius);
            };
            /**
             * 判断两个圆是否相交
             * @param other
             * @returns
             */
            Circle.prototype.intersects = function (other) {
                return this.position.distanceTo(other.position).lte(this.radius.add(other.radius));
            };
            return Circle;
        }());
        physics.Circle = Circle;
    })(physics = gs.physics || (gs.physics = {}));
})(gs || (gs = {}));
var gs;
(function (gs) {
    var physics;
    (function (physics) {
        var Rectangle = /** @class */ (function () {
            function Rectangle() {
            }
            /**
             * 计算矩形面积
             * @returns
             */
            Rectangle.prototype.area = function () {
                return this.width.mul(this.height);
            };
            /**
             * 判断点是否在矩形内
             * @param point
             * @returns
             */
            Rectangle.prototype.containsPoint = function (point) {
                return point.x.gte(this.position.x) &&
                    point.x.lte(this.position.x.add(this.width)) &&
                    point.y.gte(this.position.y) &&
                    point.y.lte(this.position.y.add(this.height));
            };
            /**
             * 判断两个矩形是否相交
             * @param rect
             * @returns
             */
            Rectangle.prototype.intersects = function (rect) {
                return !(rect.position.x.add(rect.width).lt(this.position.x) ||
                    rect.position.y.add(rect.height).lt(this.position.y) ||
                    rect.position.x.gt(this.position.x.add(this.width)) ||
                    rect.position.y.gt(this.position.y.add(this.height)));
            };
            return Rectangle;
        }());
        physics.Rectangle = Rectangle;
    })(physics = gs.physics || (gs.physics = {}));
})(gs || (gs = {}));
