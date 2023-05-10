/// <reference path="../source/bin/gs.d.ts" />
const { Entity, EntityManager, Component, ComponentManager, Random, TimeManager } = gs;
var id = 0;
class PositionComponent extends Component {
    constructor() {
        super();
        this.x = 0;
        this.y = 0;
        this.random = new Random(new Date().getDate());
        this.x = this.random.next() + id;
        this.y = this.random.next() + id;
        id++;
    }
    onAdded() {
        console.log('position 组件被添加');
    }
    onRemoved() {
        console.log('position 组件被移除');
    }
    reset() {
        this.x = 0;
        this.y = 0;
    }
}
class VelocityComponent extends Component {
    constructor() {
        super(...arguments);
        this.vx = 0;
        this.vy = 0;
    }
    reset() {
        this.vx = 0;
        this.vy = 0;
    }
}
class Player extends Entity {
    onCreate() {
        console.log('player 实体创建');
    }
    onDestroy() {
        console.log('player 实体销毁');
    }
}
// 创建一个 EntityManager 实例，并传递 componentManagers 数组
const entityManager = new EntityManager([PositionComponent, VelocityComponent]);
var player = entityManager.createCustomEntity(Player);
console.log(player);
class MovementSystem extends gs.System {
    constructor(entityManager) {
        super(entityManager, 1);
    }
    onComponentAdded(entity, component) {
        console.log('组件被添加', entity, component);
    }
    onComponentRemoved(entity, component) {
        console.log('组件被移除', entity, component);
    }
    entityFilter(entity) {
        const hasPosition = entity.hasComponent(PositionComponent);
        const hasVelocity = entity.hasComponent(VelocityComponent);
        return hasPosition && hasVelocity;
    }
    update(entities) {
        const timeManager = gs.TimeManager.getInstance();
        const deltaTime = timeManager.deltaTime;
        for (const entity of entities) {
            const position = entity.getComponent(PositionComponent);
            const velocity = entity.getComponent(VelocityComponent);
            position.x += velocity.vx * deltaTime;
            position.y += velocity.vy * deltaTime;
        }
    }
}
const systemManager = new gs.SystemManager(entityManager);
const movementSystem = new MovementSystem(entityManager);
systemManager.registerSystem(movementSystem);
const NUM_UPDATES = 1000;
const deltaTime = 1 / 60;
const NUM_FILTER_ENTITIES = 5000;
const NUM_POSITION_ONLY = Math.floor(NUM_FILTER_ENTITIES * 0.6);
const NUM_BOTH_COMPONENTS = NUM_FILTER_ENTITIES - NUM_POSITION_ONLY;
for (let i = 0; i < NUM_BOTH_COMPONENTS; i++) {
    const entity = entityManager.createEntity();
    entity.addComponent(PositionComponent);
    entity.addComponent(VelocityComponent);
}
console.log("entity:", entityManager.getEntities()[1]);
console.log("all components:", entityManager.getEntities()[1].getAllComponents());
const updateStartTime = performance.now();
const timeManager = gs.TimeManager.getInstance();
timeManager.update(deltaTime);
for (let i = 0; i < NUM_UPDATES; i++) {
    systemManager.update();
}
// const updateEndTime = performance.now();
// const updateElapsedTime = updateEndTime - updateStartTime;
// console.log(`更新 ${NUM_UPDATES} 次系统耗时: ${updateElapsedTime.toFixed(2)}ms`);
// const NUM_CREATE_DELETE = 1000;
// const createDeleteStartTime = performance.now();
// const createDeleteEndTime = performance.now();
// const createDeleteElapsedTime = createDeleteEndTime - createDeleteStartTime;
// console.log(`创建并删除 ${NUM_CREATE_DELETE} 个实体耗时: ${createDeleteElapsedTime.toFixed(2)}ms`);
// for (let i = 0; i < NUM_POSITION_ONLY; i++) {
//   const entity = entityManager.createEntity();
//   entity.addComponent(PositionComponent);
// }
// const filterStartTime = performance.now();
// const filteredEntities = entityManager
//   .getEntities()
//   .filter(entity => movementSystem.entityFilter(entity));
// const filterEndTime = performance.now();
// const filterElapsedTime = filterEndTime - filterStartTime;
// console.log(
//   `筛选 ${NUM_FILTER_ENTITIES} 个实体中具有位置和速度组件的实体耗时: ${filterElapsedTime.toFixed(2)}ms`
// );
// const NUM_COMPONENT_CHANGES = 1000;
// const componentChangesStartTime = performance.now();
// for (let i = 0; i < NUM_COMPONENT_CHANGES; i++) {
//   const entity = entityManager.createEntity();
//   entity.addComponent(PositionComponent);
//   entity.addComponent(VelocityComponent);
//   entity.removeComponent(PositionComponent);
//   entity.removeComponent(VelocityComponent);
// }
// const componentChangesEndTime = performance.now();
// const componentChangesElapsedTime = componentChangesEndTime - componentChangesStartTime;
// console.log(`添加和删除 ${NUM_COMPONENT_CHANGES} 个实体的组件耗时: ${componentChangesElapsedTime.toFixed(2)}ms`);
// const NUM_ENTITIES = 1000;
// const startTime = performance.now();
// // 创建实体并添加组件
// for (let i = 0; i < NUM_ENTITIES; i++) {
//   const entity = entityManager.createEntity();
//   entity.addComponent(PositionComponent);
//   entity.addComponent(VelocityComponent);
// }
// const endTime = performance.now();
// const elapsedTime = endTime - startTime;
// console.log(`创建 ${NUM_ENTITIES} 个实体并分配组件耗时: ${elapsedTime.toFixed(2)}ms`);
