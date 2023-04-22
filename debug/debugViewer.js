class DebugViewer {
    constructor() {
        this.gui = new dat.GUI();
        this.entitiesFolder = this.gui.addFolder('Entities');
        this.systemsFolder = this.gui.addFolder('Systems');

        this.gui.add(this, 'createEntity').name('Create Entity');
    }

    createEntity() {
        const positionManager = new gs.ComponentManager(PositionComponent);
        const entityManager = new gs.EntityManager([positionManager]);
        const entity = entityManager.createEntity();
        entity.name = 'New Entity';
        entity.creationTime = new Date();

        const entityFolder = this.addEntity(entity);
        entityFolder.add(entity, 'creationTime').name('Creation Time');
    }

    addEntity(entity) {
        const entityFolder = this.entitiesFolder.addFolder(entity.name);
        entityFolder.open();
        return entityFolder;
    }

    addComponent(folder, component) {
        const componentFolder = folder.addFolder(component.constructor.name);
        for (const key in component) {
            if (typeof component[key] !== 'function') {
                componentFolder.add(component, key);
            }
        }
        componentFolder.open();
        return componentFolder;
    }

    addSystem(system) {
        const systemFolder = this.systemsFolder.addFolder(system.constructor.name);
        systemFolder.open();
        return systemFolder;
    }

    init() {
        // 创建一个 PositionComponentManager
        const positionManager = new gs.ComponentManager(PositionComponent);
        gs.Component.registerComponent(PositionComponent, positionManager);

        // 创建一个实体管理器，传入 ComponentManager 数组
        const entityManager = new gs.EntityManager([positionManager]);

        // 创建一个实体
        const entity = entityManager.createEntity();
        entity.name = 'Player';

        // 为实体添加一个 PositionComponent
        const positionComponent = entity.addComponent(PositionComponent);

        // 添加实体到 DebugViewer
        const entityFolder = this.addEntity(entity);

        // 添加 PositionComponent 到 DebugViewer
        this.addComponent(entityFolder, positionComponent);

        const movementSystem = new MovementSystem();

        // 添加系统到 DebugViewer
        this.addSystem(movementSystem);
    }
}

class PositionComponent {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}


// 创建一个系统
class MovementSystem extends gs.System {
    constructor() {
        super([gs.PositionComponent]);
    }

    update() {
        // 更新逻辑
    }
}