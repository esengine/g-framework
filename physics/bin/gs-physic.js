"use strict";
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
    var physics;
    (function (physics) {
        var AABB = /** @class */ (function () {
            function AABB(x, y, width, height) {
                this.velocityX = 0;
                this.velocityY = 0;
                this.minX = x;
                this.maxX = x + width;
                this.minY = y;
                this.maxY = y + height;
            }
            /**
             * 计算两个 AABB 的并集
             * @param other
             * @returns
             */
            AABB.prototype.union = function (other) {
                var minX = Math.min(this.minX, other.minX);
                var minY = Math.min(this.minY, other.minY);
                var width = Math.max(this.maxX, other.maxX) - minX;
                var height = Math.max(this.maxY, other.maxY) - minY;
                return new AABB(minX, minY, width, height);
            };
            /**
             * 计算 AABB 的面积
             * @returns
             */
            AABB.prototype.area = function () {
                return (this.maxX - this.minX) * (this.maxY - this.minY);
            };
            /**
             * 检查两个 AABB 是否相交
             * @param other
             * @returns
             */
            AABB.prototype.intersects = function (other) {
                return !(this.minX > other.maxX ||
                    this.maxX < other.minX ||
                    this.minY > other.maxY ||
                    this.maxY < other.minY);
            };
            /**
            * 获取 AABB 的中心点
            * @returns
            */
            AABB.prototype.getCenter = function () {
                var centerX = (this.minX + this.maxX) / 2;
                var centerY = (this.minY + this.maxY) / 2;
                return new physics.Point(centerX, centerY);
            };
            /**
             * 计算与另一个物体的可能碰撞时间
             * @param other
             * @returns
             */
            AABB.prototype.computeCollisionTime = function (other) {
                var relativeVelocityX = other.velocityX - this.velocityX;
                var relativeVelocityY = other.velocityY - this.velocityY;
                var tEnterX, tEnterY, tExitX, tExitY;
                if (relativeVelocityX > 0) {
                    tEnterX = (this.minX - other.maxX) / relativeVelocityX;
                    tExitX = (this.maxX - other.minX) / relativeVelocityX;
                }
                else {
                    tEnterX = (this.maxX - other.minX) / relativeVelocityX;
                    tExitX = (this.minX - other.maxX) / relativeVelocityX;
                }
                if (relativeVelocityY > 0) {
                    tEnterY = (this.minY - other.maxY) / relativeVelocityY;
                    tExitY = (this.maxY - other.minY) / relativeVelocityY;
                }
                else {
                    tEnterY = (this.maxY - other.minY) / relativeVelocityY;
                    tExitY = (this.minY - other.maxY) / relativeVelocityY;
                }
                var tEnter = Math.max(tEnterX, tEnterY);
                var tExit = Math.min(tExitX, tExitY);
                if (tEnter < tExit && tEnter < 1 && tExit > 0) {
                    return tEnter;
                }
                else {
                    return Infinity;
                }
            };
            AABB.prototype.clone = function () {
                var width = this.maxX - this.minX;
                var height = this.maxY - this.minY;
                var cloned = new AABB(this.minX, this.minY, width, height);
                cloned.velocityX = this.velocityX;
                cloned.velocityY = this.velocityY;
                return cloned;
            };
            return AABB;
        }());
        physics.AABB = AABB;
    })(physics = gs.physics || (gs.physics = {}));
})(gs || (gs = {}));
var gs;
(function (gs) {
    var physics;
    (function (physics) {
        var BVHNode = /** @class */ (function () {
            function BVHNode(object) {
                this.left = null;
                this.right = null;
                this.object = object || null;
                this.bounds = object ? object.clone() : new physics.AABB(0, 0, -Infinity, -Infinity);
            }
            /**
             * 插入物体并返回是否需要重新平衡
             * @param object
             * @returns
             */
            BVHNode.prototype.insert = function (object) {
                // 如果这个节点是叶子节点，那么直接插入
                if (!this.left && !this.right) {
                    this.object = object;
                    this.bounds = object;
                    this.createChildNodes();
                    return false;
                }
                // 如果这个节点不是叶子节点，那么插入到最小成本的子节点
                var leftBounds = this.left.bounds.union(object);
                var rightBounds = this.right.bounds.union(object);
                var leftCost = leftBounds.area() * (this.left.size() + 1) - this.bounds.area() * this.size();
                var rightCost = rightBounds.area() * (this.right.size() + 1) - this.bounds.area() * this.size();
                if (leftCost < rightCost) {
                    var rebalance = this.left.insert(object);
                    this.bounds = this.bounds.union(object);
                    return rebalance;
                }
                else {
                    var rebalance = this.right.insert(object);
                    this.bounds = this.bounds.union(object);
                    return rebalance;
                }
            };
            BVHNode.prototype.createChildNodes = function () {
                var center = this.bounds.getCenter();
                // 在 createChildNodes 中
                var leftBounds = new physics.AABB(this.bounds.minX, this.bounds.minY, center.x - this.bounds.minX, this.bounds.maxY - this.bounds.minY);
                var rightBounds = new physics.AABB(center.x, this.bounds.minY, this.bounds.maxX - center.x, this.bounds.maxY - this.bounds.minY);
                this.left = new BVHNode(leftBounds);
                this.right = new BVHNode(rightBounds);
            };
            /**
             * 移除物体并返回是否需要重新平衡
             * @param object
             * @returns
             */
            BVHNode.prototype.remove = function (object) {
                if (this.object === object) {
                    this.object = null;
                    return true;
                }
                else if (this.left && this.right) {
                    var rebalance = this.left.remove(object) || this.right.remove(object);
                    if (rebalance) {
                        this.updateBounds();
                    }
                    return rebalance;
                }
                return false;
            };
            /**
             * 更新边界
             */
            BVHNode.prototype.updateBounds = function () {
                this.bounds = this.left.bounds.union(this.right.bounds);
            };
            /**
             * 查询与给定的AABB相交的所有物体
             * @param aabb
             * @returns
             */
            BVHNode.prototype.query = function (aabb) {
                // 如果这个节点的AABB与给定的AABB不相交，那么返回空数组
                if (!this.bounds.intersects(aabb)) {
                    return [];
                }
                var objects = [];
                // 如果这是一个叶子节点，那么检查物体是否与给定的AABB相交
                if (this.object) {
                    if (this.object.intersects(aabb)) {
                        objects.push(this.object);
                    }
                }
                else {
                    // 如果这不是一个叶子节点，那么在子节点中查询
                    if (this.left) {
                        objects.push.apply(objects, __spread(this.left.query(aabb)));
                    }
                    if (this.right) {
                        objects.push.apply(objects, __spread(this.right.query(aabb)));
                    }
                }
                return objects;
            };
            /**
             * 计算节点所包含的物体数量
             * @returns
             */
            BVHNode.prototype.size = function () {
                if (!this.left && !this.right) {
                    return 1;
                }
                else {
                    return this.left.size() + this.right.size();
                }
            };
            /**
             * 获取节点中的所有物体
             * @returns
             */
            BVHNode.prototype.getObjects = function () {
                if (this.object) {
                    return [this.object];
                }
                else {
                    var objects = [];
                    if (this.left) {
                        objects.push.apply(objects, __spread(this.left.getObjects()));
                    }
                    if (this.right) {
                        objects.push.apply(objects, __spread(this.right.getObjects()));
                    }
                    return objects;
                }
            };
            return BVHNode;
        }());
        physics.BVHNode = BVHNode;
        /**
         * 包围体层次结构
         */
        var BVH = /** @class */ (function () {
            function BVH() {
                this.root = new BVHNode();
            }
            /**
             * 插入物体并在必要时重新平衡
             * @param object
             */
            BVH.prototype.insert = function (object) {
                var e_1, _a;
                var rebalance = this.root.insert(object);
                if (rebalance) {
                    // 如果需要重新平衡，那么重构整个树
                    var objects = this.root.getObjects();
                    this.root = new BVHNode();
                    try {
                        for (var objects_1 = __values(objects), objects_1_1 = objects_1.next(); !objects_1_1.done; objects_1_1 = objects_1.next()) {
                            var object_1 = objects_1_1.value;
                            this.root.insert(object_1);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (objects_1_1 && !objects_1_1.done && (_a = objects_1.return)) _a.call(objects_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
            };
            /**
             * 查询与给定的AABB相交的所有物体
             * @param aabb
             * @returns
             */
            BVH.prototype.query = function (aabb) {
                return this.root.query(aabb);
            };
            /**
             * 过滤碰撞对
             * @param pairs
             * @returns
             */
            BVH.prototype.filterPairs = function (pairs) {
                var e_2, _a;
                var filteredPairs = [];
                try {
                    for (var pairs_1 = __values(pairs), pairs_1_1 = pairs_1.next(); !pairs_1_1.done; pairs_1_1 = pairs_1.next()) {
                        var pair = pairs_1_1.value;
                        var aabb1 = pair[0];
                        var aabb2 = pair[1];
                        // 用 BVH 树查询可能与 aabb1 相交的所有对象
                        var candidates = this.query(aabb1);
                        // 如果 aabb2 在候选对象中，那么 aabb1 和 aabb2 可能会碰撞
                        if (candidates.indexOf(aabb2) != -1) {
                            filteredPairs.push(pair);
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (pairs_1_1 && !pairs_1_1.done && (_a = pairs_1.return)) _a.call(pairs_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                return filteredPairs;
            };
            /**
             * 移除物体并在必要时重新平衡
             * @param object
             */
            BVH.prototype.remove = function (object) {
                var e_3, _a;
                var rebalance = this.root.remove(object);
                if (rebalance) {
                    var objects = this.root.getObjects();
                    this.root = new BVHNode();
                    try {
                        for (var objects_2 = __values(objects), objects_2_1 = objects_2.next(); !objects_2_1.done; objects_2_1 = objects_2.next()) {
                            var object_2 = objects_2_1.value;
                            this.root.insert(object_2);
                        }
                    }
                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                    finally {
                        try {
                            if (objects_2_1 && !objects_2_1.done && (_a = objects_2.return)) _a.call(objects_2);
                        }
                        finally { if (e_3) throw e_3.error; }
                    }
                }
            };
            /**
             * 更新物体位置
             * @param object
             * @param newPosition
             */
            BVH.prototype.update = function (object, newPosition) {
                this.remove(object);
                object.minX = newPosition.minX;
                object.minY = newPosition.minY;
                object.maxX = newPosition.maxX;
                object.maxY = newPosition.maxY;
                this.insert(object);
            };
            return BVH;
        }());
        physics.BVH = BVH;
    })(physics = gs.physics || (gs.physics = {}));
})(gs || (gs = {}));
var gs;
(function (gs) {
    var physics;
    (function (physics) {
        var PhysicsComponent = /** @class */ (function (_super) {
            __extends(PhysicsComponent, _super);
            function PhysicsComponent() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            PhysicsComponent.prototype.onInitialize = function (aabb) {
                this.aabb = aabb;
            };
            return PhysicsComponent;
        }(gs.Component));
        physics.PhysicsComponent = PhysicsComponent;
    })(physics = gs.physics || (gs.physics = {}));
})(gs || (gs = {}));
var gs;
(function (gs) {
    var physics;
    (function (physics) {
        var PhysicsEngine = /** @class */ (function () {
            function PhysicsEngine(boundary, capacity, cellSize) {
                if (boundary === void 0) { boundary = new physics.Rectangle(0, 0, 1000, 1000); }
                if (capacity === void 0) { capacity = 4; }
                if (cellSize === void 0) { cellSize = 10; }
                this.quadtree = new physics.QuadTree(boundary, capacity, cellSize);
                this.bvh = new physics.BVH();
                this.entities = new Map();
            }
            PhysicsEngine.prototype.addObject = function (entityId, aabb) {
                this.entities.set(entityId, aabb);
                this.quadtree.insert(aabb);
                this.bvh.insert(aabb);
            };
            PhysicsEngine.prototype.removeObject = function (entityId) {
                var aabb = this.entities.get(entityId);
                if (aabb) {
                    this.bvh.remove(aabb);
                    this.quadtree.remove(aabb);
                    this.entities.delete(entityId);
                }
            };
            PhysicsEngine.prototype.updateObject = function (entityId, newPosition) {
                var aabb = this.entities.get(entityId);
                if (aabb) {
                    this.bvh.remove(aabb);
                    this.quadtree.remove(aabb);
                    aabb.minX = newPosition.minX;
                    aabb.minY = newPosition.minY;
                    aabb.maxX = newPosition.maxX;
                    aabb.maxY = newPosition.maxY;
                    this.bvh.insert(aabb);
                    this.quadtree.insert(aabb);
                }
            };
            PhysicsEngine.prototype.step = function (time) {
                var e_4, _a;
                // 1. 利用四叉树找出可能碰撞的物体对
                var potentialCollisions = this.quadtree.queryPairs();
                // 2. 利用扫描排序缩小可能碰撞的范围
                potentialCollisions = physics.SweepAndPrune.sweepAndPrune(potentialCollisions);
                // 3. 使用BVH进一步减少物体对数量
                potentialCollisions = this.bvh.filterPairs(potentialCollisions);
                try {
                    // 4. 使用基于时间的碰撞检测进行碰撞预测和处理
                    for (var potentialCollisions_1 = __values(potentialCollisions), potentialCollisions_1_1 = potentialCollisions_1.next(); !potentialCollisions_1_1.done; potentialCollisions_1_1 = potentialCollisions_1.next()) {
                        var pair = potentialCollisions_1_1.value;
                        var _b = __read(pair, 2), aabb1 = _b[0], aabb2 = _b[1];
                        var _c = __read(physics.TimeBaseCollisionDetection.handleCollision(aabb1, aabb2), 2), newAabb1 = _c[0], newAabb2 = _c[1];
                        // 5. 立即更新四叉树和 BVH
                        this.quadtree.update(aabb1, newAabb1);
                        this.bvh.update(aabb1, newAabb1);
                        this.quadtree.update(aabb2, newAabb2);
                        this.bvh.update(aabb2, newAabb2);
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (potentialCollisions_1_1 && !potentialCollisions_1_1.done && (_a = potentialCollisions_1.return)) _a.call(potentialCollisions_1);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            };
            return PhysicsEngine;
        }());
        physics.PhysicsEngine = PhysicsEngine;
    })(physics = gs.physics || (gs.physics = {}));
})(gs || (gs = {}));
var gs;
(function (gs) {
    var physics;
    (function (physics_1) {
        var PhysicsSystem = /** @class */ (function (_super) {
            __extends(PhysicsSystem, _super);
            function PhysicsSystem(entityManager, boundary, capacity, cellSize) {
                if (boundary === void 0) { boundary = new physics_1.Rectangle(0, 0, 1000, 1000); }
                if (capacity === void 0) { capacity = 4; }
                if (cellSize === void 0) { cellSize = 10; }
                var _this = _super.call(this, entityManager, 0, gs.Matcher.empty().all(physics_1.PhysicsComponent)) || this;
                _this.engine = new physics_1.PhysicsEngine(boundary, capacity, cellSize);
                return _this;
            }
            PhysicsSystem.prototype.onComponentAdded = function (entity, component) {
                if (component instanceof physics_1.PhysicsComponent) {
                    this.engine.addObject(entity.getId(), component.aabb);
                }
            };
            PhysicsSystem.prototype.onComponentRemoved = function (entity, component) {
                this.engine.removeObject(entity.getId());
            };
            PhysicsSystem.prototype.update = function (entities) {
                var e_5, _a;
                try {
                    for (var entities_1 = __values(entities), entities_1_1 = entities_1.next(); !entities_1_1.done; entities_1_1 = entities_1.next()) {
                        var entity = entities_1_1.value;
                        var physics_2 = entity.getComponent(physics_1.PhysicsComponent);
                        if (physics_2) {
                        }
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (entities_1_1 && !entities_1_1.done && (_a = entities_1.return)) _a.call(entities_1);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
                // 运行物理引擎
                var dt = gs.TimeManager.getInstance().deltaTime;
                this.engine.step(dt);
            };
            return PhysicsSystem;
        }(gs.System));
        physics_1.PhysicsSystem = PhysicsSystem;
    })(physics = gs.physics || (gs.physics = {}));
})(gs || (gs = {}));
var gs;
(function (gs) {
    var physics;
    (function (physics) {
        var Point = /** @class */ (function () {
            function Point(x, y) {
                this.x = x;
                this.y = y;
            }
            return Point;
        }());
        physics.Point = Point;
    })(physics = gs.physics || (gs.physics = {}));
})(gs || (gs = {}));
var gs;
(function (gs) {
    var physics;
    (function (physics) {
        /**
         * 四叉树
         */
        var QuadTree = /** @class */ (function () {
            function QuadTree(boundary, capacity, cellSize) {
                this.boundary = boundary;
                this.capacity = capacity;
                this.cellSize = cellSize;
                this.nw = null;
                this.ne = null;
                this.sw = null;
                this.se = null;
                this.aabbs = [];
                this.spatialHash = new physics.SpatialHash(cellSize);
            }
            QuadTree.prototype.insert = function (aabb) {
                if (!this.boundary.containsAABB(aabb)) {
                    return false;
                }
                if (this.aabbs.length < this.capacity && this.nw === null) {
                    this.aabbs.push(aabb);
                    this.spatialHash.insert(aabb);
                    return true;
                }
                if (this.nw === null) {
                    this.subdivide();
                }
                if (this.nw.insert(aabb)) {
                    return true;
                }
                else if (this.ne.insert(aabb)) {
                    return true;
                }
                else if (this.sw.insert(aabb)) {
                    return true;
                }
                else if (this.se.insert(aabb)) {
                    return true;
                }
                this.aabbs.push(aabb);
                this.spatialHash.insert(aabb);
                return true;
            };
            QuadTree.prototype.subdivide = function () {
                var e_6, _a;
                var x = this.boundary.x;
                var y = this.boundary.y;
                var w = this.boundary.width / 2;
                var h = this.boundary.height / 2;
                var nw = new physics.Rectangle(x, y, w, h);
                var ne = new physics.Rectangle(x + w, y, w, h);
                var sw = new physics.Rectangle(x, y + h, w, h);
                var se = new physics.Rectangle(x + w, y + h, w, h);
                this.nw = new QuadTree(nw, this.capacity, this.spatialHash.cellSize);
                this.ne = new QuadTree(ne, this.capacity, this.spatialHash.cellSize);
                this.sw = new QuadTree(sw, this.capacity, this.spatialHash.cellSize);
                this.se = new QuadTree(se, this.capacity, this.spatialHash.cellSize);
                try {
                    for (var _b = __values(this.aabbs), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var aabb = _c.value;
                        if (this.nw.boundary.containsAABB(aabb))
                            this.nw.insert(aabb);
                        if (this.ne.boundary.containsAABB(aabb))
                            this.ne.insert(aabb);
                        if (this.sw.boundary.containsAABB(aabb))
                            this.sw.insert(aabb);
                        if (this.se.boundary.containsAABB(aabb))
                            this.se.insert(aabb);
                    }
                }
                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_6) throw e_6.error; }
                }
                this.aabbs = [];
                this.spatialHash.clear();
            };
            QuadTree.prototype.remove = function (aabb) {
                if (!this.boundary.containsAABB(aabb)) {
                    return false;
                }
                if (this.spatialHash.remove(aabb)) {
                    return true;
                }
                if (this.nw === null) {
                    return false;
                }
                return (this.nw.remove(aabb) || this.ne.remove(aabb) ||
                    this.sw.remove(aabb) || this.se.remove(aabb));
            };
            QuadTree.prototype.query = function (range, found) {
                if (found === void 0) { found = []; }
                if (!this.boundary.intersects(range)) {
                    return found;
                }
                found.push.apply(found, __spread(this.spatialHash.query(range.x, range.y)));
                if (this.nw === null) {
                    return found;
                }
                this.nw.query(range, found);
                this.ne.query(range, found);
                this.sw.query(range, found);
                this.se.query(range, found);
                return found;
            };
            QuadTree.prototype.queryPairs = function () {
                var e_7, _a;
                var pairs = [];
                // 如果这个节点没有被分割，那么直接从空间哈希中查询
                if (!this.nw) {
                    var potentialCollisions = this.spatialHash.queryPairs();
                    try {
                        for (var potentialCollisions_2 = __values(potentialCollisions), potentialCollisions_2_1 = potentialCollisions_2.next(); !potentialCollisions_2_1.done; potentialCollisions_2_1 = potentialCollisions_2.next()) {
                            var pair = potentialCollisions_2_1.value;
                            pairs.push(pair);
                        }
                    }
                    catch (e_7_1) { e_7 = { error: e_7_1 }; }
                    finally {
                        try {
                            if (potentialCollisions_2_1 && !potentialCollisions_2_1.done && (_a = potentialCollisions_2.return)) _a.call(potentialCollisions_2);
                        }
                        finally { if (e_7) throw e_7.error; }
                    }
                }
                else {
                    // 如果这个节点已经被分割，那么从四个子节点中查询
                    var northwestPairs = this.nw.queryPairs();
                    var northeastPairs = this.ne.queryPairs();
                    var southwestPairs = this.sw.queryPairs();
                    var southeastPairs = this.se.queryPairs();
                    pairs = pairs.concat(northwestPairs, northeastPairs, southwestPairs, southeastPairs);
                }
                return pairs;
            };
            QuadTree.prototype.update = function (point, newPosition) {
                if (!this.remove(point)) {
                    return false;
                }
                point.minX = newPosition.minX;
                point.maxX = newPosition.maxX;
                point.minY = newPosition.minY;
                point.maxY = newPosition.maxY;
                return this.insert(point);
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
        var Rectangle = /** @class */ (function () {
            function Rectangle(x, y, width, height) {
                this.x = x;
                this.y = y;
                this.width = width;
                this.height = height;
            }
            Rectangle.prototype.contains = function (point) {
                return (point.x >= this.x &&
                    point.x < this.x + this.width &&
                    point.y >= this.y &&
                    point.y < this.y + this.height);
            };
            Rectangle.prototype.intersects = function (range) {
                return !(range.x >= this.x + this.width ||
                    range.x + range.width <= this.x ||
                    range.y >= this.y + this.height ||
                    range.y + range.height <= this.y);
            };
            Rectangle.prototype.containsAABB = function (aabb) {
                return this.x <= aabb.minX &&
                    this.x + this.width >= aabb.maxX &&
                    this.y <= aabb.minY &&
                    this.y + this.height >= aabb.maxY;
            };
            return Rectangle;
        }());
        physics.Rectangle = Rectangle;
    })(physics = gs.physics || (gs.physics = {}));
})(gs || (gs = {}));
var gs;
(function (gs) {
    var physics;
    (function (physics) {
        /**
         * 空间哈希
         */
        var SpatialHash = /** @class */ (function () {
            function SpatialHash(cellSize) {
                this.cellSize = cellSize;
                this.buckets = new Map();
            }
            SpatialHash.prototype.size = function () {
                var e_8, _a;
                var size = 0;
                try {
                    for (var _b = __values(this.buckets.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var bucket = _c.value;
                        size += bucket.length;
                    }
                }
                catch (e_8_1) { e_8 = { error: e_8_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_8) throw e_8.error; }
                }
                return size;
            };
            SpatialHash.prototype.hash = function (x, y) {
                var cellX = Math.floor(x / this.cellSize);
                var cellY = Math.floor(y / this.cellSize);
                return cellX + "," + cellY;
            };
            SpatialHash.prototype.insert = function (aabb) {
                var minX = aabb.minX, minY = aabb.minY, maxX = aabb.maxX, maxY = aabb.maxY;
                for (var x = minX; x <= maxX; x += this.cellSize) {
                    for (var y = minY; y <= maxY; y += this.cellSize) {
                        var key = this.hash(x, y);
                        if (!this.buckets.has(key)) {
                            this.buckets.set(key, []);
                        }
                        this.buckets.get(key).push(aabb);
                    }
                }
            };
            SpatialHash.prototype.remove = function (aabb) {
                var minX = aabb.minX, minY = aabb.minY, maxX = aabb.maxX, maxY = aabb.maxY;
                var removed = false;
                for (var x = minX; x <= maxX; x += this.cellSize) {
                    for (var y = minY; y <= maxY; y += this.cellSize) {
                        var key = this.hash(x, y);
                        var bucket = this.buckets.get(key);
                        if (bucket) {
                            var index = bucket.indexOf(aabb);
                            if (index !== -1) {
                                bucket.splice(index, 1);
                                if (bucket.length === 0) {
                                    this.buckets.delete(key);
                                }
                                removed = true;
                            }
                        }
                    }
                }
                return removed;
            };
            SpatialHash.prototype.query = function (x, y) {
                var key = this.hash(x, y);
                return this.buckets.get(key) || [];
            };
            SpatialHash.prototype.queryPairs = function () {
                var pairs = [];
                // 遍历每个 bucket
                this.buckets.forEach(function (bucket, key) {
                    // 在每个 bucket 中，对所有物体进行两两对比
                    for (var i = 0; i < bucket.length; i++) {
                        for (var j = i + 1; j < bucket.length; j++) {
                            pairs.push([bucket[i], bucket[j]]);
                        }
                    }
                });
                return pairs;
            };
            SpatialHash.prototype.clear = function () {
                this.buckets.clear();
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
        /**
         * 扫描排序
         */
        var SweepAndPrune = /** @class */ (function () {
            function SweepAndPrune() {
            }
            SweepAndPrune.sweepAndPrune = function (pairs) {
                var e_9, _a, e_10, _b;
                // 将 AABB 对象提取到一个数组中
                var aabbs = [];
                try {
                    for (var pairs_2 = __values(pairs), pairs_2_1 = pairs_2.next(); !pairs_2_1.done; pairs_2_1 = pairs_2.next()) {
                        var pair = pairs_2_1.value;
                        aabbs.push(pair[0]);
                        aabbs.push(pair[1]);
                    }
                }
                catch (e_9_1) { e_9 = { error: e_9_1 }; }
                finally {
                    try {
                        if (pairs_2_1 && !pairs_2_1.done && (_a = pairs_2.return)) _a.call(pairs_2);
                    }
                    finally { if (e_9) throw e_9.error; }
                }
                aabbs.sort(function (a, b) { return a.minX - b.minX; });
                var potentialCollisions = [];
                var activeList = [];
                var _loop_1 = function (i) {
                    var e_11, _a;
                    var a = aabbs[i];
                    var nextA = aabbs[i + 1];
                    // 获取 activeList 中 maxX 大于 a.minX 的 AABB
                    var overlappingList = activeList.filter(function (b) { return b.maxX > a.minX; });
                    try {
                        for (var overlappingList_1 = __values(overlappingList), overlappingList_1_1 = overlappingList_1.next(); !overlappingList_1_1.done; overlappingList_1_1 = overlappingList_1.next()) {
                            var b = overlappingList_1_1.value;
                            // 检查 a 和 b 是否在 y 轴上重叠
                            if (a.minY <= b.maxY && a.maxY >= b.minY) {
                                potentialCollisions.push([a, b]);
                            }
                        }
                    }
                    catch (e_11_1) { e_11 = { error: e_11_1 }; }
                    finally {
                        try {
                            if (overlappingList_1_1 && !overlappingList_1_1.done && (_a = overlappingList_1.return)) _a.call(overlappingList_1);
                        }
                        finally { if (e_11) throw e_11.error; }
                    }
                    // 将 a 添加到 activeList 中
                    activeList.push(a);
                    // 从 activeList 中移除 maxX 小于 nextA.minX 的 AABB
                    activeList = activeList.filter(function (b) { return b.maxX > nextA.minX; });
                };
                for (var i = 0; i < aabbs.length - 1; i++) {
                    _loop_1(i);
                }
                // 处理最后一个元素
                var lastA = aabbs[aabbs.length - 1];
                var lastOverlappingList = activeList.filter(function (b) { return b.maxX > lastA.minX; });
                try {
                    for (var lastOverlappingList_1 = __values(lastOverlappingList), lastOverlappingList_1_1 = lastOverlappingList_1.next(); !lastOverlappingList_1_1.done; lastOverlappingList_1_1 = lastOverlappingList_1.next()) {
                        var b = lastOverlappingList_1_1.value;
                        if (lastA.minY <= b.maxY && lastA.maxY >= b.minY) {
                            potentialCollisions.push([lastA, b]);
                        }
                    }
                }
                catch (e_10_1) { e_10 = { error: e_10_1 }; }
                finally {
                    try {
                        if (lastOverlappingList_1_1 && !lastOverlappingList_1_1.done && (_b = lastOverlappingList_1.return)) _b.call(lastOverlappingList_1);
                    }
                    finally { if (e_10) throw e_10.error; }
                }
                return potentialCollisions;
            };
            SweepAndPrune.mergeSort = function (aabbs, compareFn) {
                if (aabbs.length <= 1) {
                    return aabbs;
                }
                var middle = Math.floor(aabbs.length / 2);
                var left = this.mergeSort(aabbs.slice(0, middle), compareFn);
                var right = this.mergeSort(aabbs.slice(middle), compareFn);
                return this.merge(left, right, compareFn);
            };
            SweepAndPrune.merge = function (left, right, compareFn) {
                var result = [];
                var indexLeft = 0;
                var indexRight = 0;
                while (indexLeft < left.length && indexRight < right.length) {
                    if (compareFn(left[indexLeft], right[indexRight]) <= 0) {
                        result.push(left[indexLeft]);
                        indexLeft++;
                    }
                    else {
                        result.push(right[indexRight]);
                        indexRight++;
                    }
                }
                return result.concat(left.slice(indexLeft)).concat(right.slice(indexRight));
            };
            return SweepAndPrune;
        }());
        physics.SweepAndPrune = SweepAndPrune;
    })(physics = gs.physics || (gs.physics = {}));
})(gs || (gs = {}));
var gs;
(function (gs) {
    var physics;
    (function (physics) {
        /**
         * 基于时间基础的碰撞检测
         */
        var TimeBaseCollisionDetection = /** @class */ (function () {
            function TimeBaseCollisionDetection() {
            }
            /**
             * 用于处理物体的速度和方向以预测并阻止碰撞
             * @param aabb1
             * @param aabb2
             */
            TimeBaseCollisionDetection.handleCollision = function (aabb1, aabb2) {
                var collisionTime = aabb1.computeCollisionTime(aabb2);
                var newAabb1 = aabb1.clone();
                var newAabb2 = aabb2.clone();
                if (collisionTime < 1) {
                    aabb1.minX += aabb1.velocityX * collisionTime;
                    aabb1.minY += aabb1.velocityY * collisionTime;
                    aabb1.maxX += aabb1.velocityX * collisionTime;
                    aabb1.maxY += aabb1.velocityY * collisionTime;
                    aabb2.minX += aabb2.velocityX * collisionTime;
                    aabb2.minY += aabb2.velocityY * collisionTime;
                    aabb2.maxX += aabb2.velocityX * collisionTime;
                    aabb2.maxY += aabb2.velocityY * collisionTime;
                }
                return [newAabb1, newAabb2];
            };
            /**
             * 处理多个碰撞和反弹
             * @param aabbs
             */
            TimeBaseCollisionDetection.handleCollisions = function (aabbs) {
                var e_12, _a;
                var collisionPairs = [];
                // 计算所有可能的碰撞对
                for (var i = 0; i < aabbs.length; i++) {
                    for (var j = i + 1; j < aabbs.length; j++) {
                        collisionPairs.push([aabbs[i], aabbs[j]]);
                    }
                }
                var _loop_2 = function () {
                    var e_13, _a;
                    // 找出最早的碰撞
                    var earliestCollisionTime = Infinity;
                    var earliestCollisionPair = null;
                    try {
                        for (var collisionPairs_1 = __values(collisionPairs), collisionPairs_1_1 = collisionPairs_1.next(); !collisionPairs_1_1.done; collisionPairs_1_1 = collisionPairs_1.next()) {
                            var pair = collisionPairs_1_1.value;
                            var collisionTime = pair[0].computeCollisionTime(pair[1]);
                            if (collisionTime < earliestCollisionTime) {
                                earliestCollisionTime = collisionTime;
                                earliestCollisionPair = pair;
                            }
                        }
                    }
                    catch (e_13_1) { e_13 = { error: e_13_1 }; }
                    finally {
                        try {
                            if (collisionPairs_1_1 && !collisionPairs_1_1.done && (_a = collisionPairs_1.return)) _a.call(collisionPairs_1);
                        }
                        finally { if (e_13) throw e_13.error; }
                    }
                    // 如果没有碰撞，那么我们就完成了
                    if (earliestCollisionPair === null) {
                        return "break";
                    }
                    // 处理碰撞
                    var _b = __read(earliestCollisionPair, 2), aabb1 = _b[0], aabb2 = _b[1];
                    aabb1.minX += aabb1.velocityX * earliestCollisionTime;
                    aabb1.minY += aabb1.velocityY * earliestCollisionTime;
                    aabb1.maxX += aabb1.velocityX * earliestCollisionTime;
                    aabb1.maxY += aabb1.velocityY * earliestCollisionTime;
                    aabb2.minX += aabb2.velocityX * earliestCollisionTime;
                    aabb2.minY += aabb2.velocityY * earliestCollisionTime;
                    aabb2.maxX += aabb2.velocityX * earliestCollisionTime;
                    aabb2.maxY += aabb2.velocityY * earliestCollisionTime;
                    // 计算反弹
                    var normalX = (aabb1.minX + aabb1.maxX) / 2 - (aabb2.minX + aabb2.maxX) / 2;
                    var normalY = (aabb1.minY + aabb1.maxY) / 2 - (aabb2.minY + aabb2.maxY) / 2;
                    var length_1 = Math.sqrt(normalX * normalX + normalY * normalY);
                    normalX /= length_1;
                    normalY /= length_1;
                    var relativeVelocityX = aabb2.velocityX - aabb1.velocityX;
                    var relativeVelocityY = aabb2.velocityY - aabb1.velocityY;
                    var dotProduct = relativeVelocityX * normalX + relativeVelocityY * normalY;
                    if (dotProduct > 0) {
                        var reflectionX = 2 * dotProduct * normalX - relativeVelocityX;
                        var reflectionY = 2 * dotProduct * normalY - relativeVelocityY;
                        aabb1.velocityX -= reflectionX;
                        aabb1.velocityY -= reflectionY;
                        aabb2.velocityX += reflectionX;
                        aabb2.velocityY += reflectionY;
                    }
                    // 从碰撞对列表中移除已处理的碰撞
                    collisionPairs = collisionPairs.filter(function (pair) { return pair !== earliestCollisionPair; });
                };
                while (true) {
                    var state_1 = _loop_2();
                    if (state_1 === "break")
                        break;
                }
                try {
                    // 移动剩下的物体
                    for (var aabbs_1 = __values(aabbs), aabbs_1_1 = aabbs_1.next(); !aabbs_1_1.done; aabbs_1_1 = aabbs_1.next()) {
                        var aabb = aabbs_1_1.value;
                        aabb.minX += aabb.velocityX;
                        aabb.minY += aabb.velocityY;
                        aabb.maxX += aabb.velocityX;
                        aabb.maxY += aabb.velocityY;
                    }
                }
                catch (e_12_1) { e_12 = { error: e_12_1 }; }
                finally {
                    try {
                        if (aabbs_1_1 && !aabbs_1_1.done && (_a = aabbs_1.return)) _a.call(aabbs_1);
                    }
                    finally { if (e_12) throw e_12.error; }
                }
            };
            return TimeBaseCollisionDetection;
        }());
        physics.TimeBaseCollisionDetection = TimeBaseCollisionDetection;
    })(physics = gs.physics || (gs.physics = {}));
})(gs || (gs = {}));
