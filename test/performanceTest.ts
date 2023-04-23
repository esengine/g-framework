/// <reference path="../source/bin/gs.d.ts" />

const { Entity, EntityManager, Component, ComponentManager, StorageMode, float32Property, useFloat32ArrayStorage } = gs;

// class MovementSystem extends gs.System {
//   constructor(entityManager) {
//     super(entityManager, 1);
//   }

//   entityFilter(entity) {
//     return entity.hasComponent(PositionComponent) && entity.hasComponent(VelocityComponent);
//   }

//   update(entities) {
//     const timeManager = gs.TimeManager.getInstance();
//     const deltaTime = timeManager.deltaTime;
//     for (const entity of entities) {
//       const position = entity.getComponent(PositionComponent);
//       const velocity = entity.getComponent(VelocityComponent);
//       position.x += velocity.vx * deltaTime;
//       position.y += velocity.vy * deltaTime;
//     }
//   }
// }

// const systemManager = new gs.SystemManager(entityManager);
// const movementSystem = new MovementSystem(entityManager);
// systemManager.registerSystem(movementSystem);

// const NUM_UPDATES = 1000;
// const deltaTime = 1 / 60;

// const updateStartTime = performance.now();

// const timeManager = gs.TimeManager.getInstance();
// timeManager.update(deltaTime);
// for (let i = 0; i < NUM_UPDATES; i++) {
//   systemManager.update();
// }

// const updateEndTime = performance.now();
// const updateElapsedTime = updateEndTime - updateStartTime;

// console.log(`更新 ${NUM_UPDATES} 次系统耗时: ${updateElapsedTime.toFixed(2)}ms`);

// const NUM_CREATE_DELETE = 1000;

// const createDeleteStartTime = performance.now();

// for (let i = 0; i < NUM_CREATE_DELETE; i++) {
//   const entity = entityManager.createEntity();
//   entity.addComponent(PositionComponent);
//   entity.addComponent(VelocityComponent);
//   entityManager.deleteEntity(entity.getId());
// }

// const createDeleteEndTime = performance.now();
// const createDeleteElapsedTime = createDeleteEndTime - createDeleteStartTime;

// console.log(`创建并删除 ${NUM_CREATE_DELETE} 个实体耗时: ${createDeleteElapsedTime.toFixed(2)}ms`);

// const NUM_FILTER_ENTITIES = 5000;
// const NUM_POSITION_ONLY = Math.floor(NUM_FILTER_ENTITIES * 0.6);
// const NUM_BOTH_COMPONENTS = NUM_FILTER_ENTITIES - NUM_POSITION_ONLY;

// for (let i = 0; i < NUM_POSITION_ONLY; i++) {
//   const entity = entityManager.createEntity();
//   entity.addComponent(PositionComponent);
// }

// for (let i = 0; i < NUM_BOTH_COMPONENTS; i++) {
//   const entity = entityManager.createEntity();
//   entity.addComponent(PositionComponent);
//   entity.addComponent(VelocityComponent);
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

class PositionComponent extends Component {
  x = 0;
  y = 0;
}

class VelocityComponent extends Component {
  vx = 0;
  vy = 0;
}


const NUM_ENTITIES = 1000;

// 创建一个 EntityManager 实例，并传递 componentManagers 数组
const entityManager = new EntityManager([PositionComponent, VelocityComponent]);

const startTime = performance.now();

// 创建实体并添加组件
for (let i = 0; i < NUM_ENTITIES; i++) {
  const entity = entityManager.createEntity();
  entity.addComponent(PositionComponent);
  entity.addComponent(VelocityComponent);
}

const endTime = performance.now();
const elapsedTime = endTime - startTime;

console.log(`创建 ${NUM_ENTITIES} 个实体并分配组件耗时: ${elapsedTime.toFixed(2)}ms`);

@useFloat32ArrayStorage
class FloatPositionComponent extends Component {
  @float32Property()
  x = 0;

  @float32Property()
  y = 0;
}

@useFloat32ArrayStorage
class FloatVelocityComponent extends Component {
  @float32Property()
  vx = 0;

  @float32Property()
  vy = 0;
}

// 创建一个使用 Float32Array 存储模式的 EntityManager 实例
const float32EntityManager = new EntityManager([
  FloatPositionComponent,
  FloatVelocityComponent,
]);

const float32StartTime = performance.now();

// 使用 Float32Array 存储模式创建实体并添加组件
for (let i = 0; i < NUM_ENTITIES; i++) {
  const entity = float32EntityManager.createEntity();
  entity.addComponent(FloatPositionComponent);
  entity.addComponent(FloatVelocityComponent);
}

const float32EndTime = performance.now();
const float32ElapsedTime = float32EndTime - float32StartTime;

console.log(
  `使用 Float32Array 存储模式创建 ${NUM_ENTITIES} 个实体并分配组件耗时: ${float32ElapsedTime.toFixed(2)}ms`
);

for (let i = 0; i < NUM_ENTITIES; i++) {
  const entity = entityManager.getEntity(i);
  const positionComponent = entity.getComponent(PositionComponent);
  const x = positionComponent.x;
  const y = positionComponent.y;

  const floatPositionComponent = entity.getComponent(VelocityComponent);
  const vx = floatPositionComponent.vx;
  const vy = floatPositionComponent.vy;
}

const readEndTime = performance.now();
const readElapsedTime = readEndTime - float32EndTime;

console.log(
  `读取 ${NUM_ENTITIES} 个实体的 PositionComponent 和 VelocityComponent 属性耗时: ${readElapsedTime.toFixed(2)}ms`
);

for (let i = 0; i < NUM_ENTITIES; i++) {
  const entity = float32EntityManager.getEntity(i);
  const floatVelocityComponent = entity.getComponent(FloatVelocityComponent);
  const vx = floatVelocityComponent.vx;
  const vy = floatVelocityComponent.vy;

  
  const floatPositionComponent = entity.getComponent(FloatPositionComponent);
  const x = floatPositionComponent.x;
  const y = floatPositionComponent.y;
}

const readEndTime2 = performance.now();
const readElapsedTime2 = readEndTime2 - readEndTime;

console.log(
  `读取 ${NUM_ENTITIES} 个实体的 FloatVelocityComponent 和 FloatVelocityComponent 属性耗时: ${readElapsedTime2.toFixed(2)}ms`
);
