const core = gs.Core.instance;

// 创建实体
const entity = core.entityManager.createEntity();
entity.addComponent(PositionComponent);
entity.addComponent(VelocityComponent);
const playerEntity = core.entityManager.createEntity(Player);
playerEntity.addComponent(PositionComponent);
playerEntity.addComponent(VelocityComponent);

// 注册系统到系统管理器中
const moveSystem = new MoveSystem(core.entityManager, 0);
core.systemManager.registerSystem(moveSystem);

const userName = 'test';
const password = 'test';
// 使用你的服务器URL实例化网络适配器
let networkAdapter = new gs.GNetworkAdapter('ws://127.0.0.1:8080', userName, password);
// 添加网络适配器到EntityManager
core.entityManager.getNetworkManager().setNetworkAdapter(networkAdapter);
// 监听服务器更新
core.entityManager.getNetworkManager().getNetworkAdapter().onServerUpdate((serverState: gs.Message) => {
    if (serverState.type == "authentication") {
        document.getElementById('player-session').textContent = "SESSION:" + serverState.payload.sessionId;
        document.getElementById('player-id').textContent = 'ID:' + serverState.payload.id;
        document.getElementById('player-name').textContent = "Name:" + userName;
    } else if(serverState.type == 'sessionId') {
        document.getElementById('player-session').textContent = "SESSION:" + serverState.payload;
    }

    if (serverState.type != 'heartbeat') {
        document.getElementById('loggerArea').append(`[${serverState.type}]: ${JSON.stringify(serverState.payload)}\n`);

        console.warn('更新游戏状态', serverState);
    }
});

document.getElementById('join-room-btn').onclick = ( ev: MouseEvent)=> {
    const joinMessage: gs.Message = {
        type: 'joinRoom',
        payload: null
    };

    networkAdapter.send(joinMessage)
}


let lastTimestamp = performance.now();
let timestamp = 0;
function update() {
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    // 这里写你的更新逻辑
    core.update(deltaTime);

    // 请求下一帧
    requestAnimationFrame(update);
}

// 开始更新循环
requestAnimationFrame(update);
