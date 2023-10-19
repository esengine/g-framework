///<reference path="InputSystem.ts"/>
///<reference path="MyInputAdapter.ts"/>
///<reference path="DrawSystem.ts"/>
const core = gs.Core.instance;

// 注册系统到系统管理器中
const moveSystem = new MoveSystem(core.entityManager, 0);
core.systemManager.registerSystem(moveSystem);

const inputSystem = new InputSystem(core.entityManager, 0);
core.systemManager.registerSystem(inputSystem);

const drawSystem = new DrawSystem(core.entityManager, 0);

const userName = 'test';
const password = 'test';


// 使用你的服务器URL实例化网络适配器
let networkAdapter = new gs.GNetworkAdapter('ws://127.0.0.1:8080', userName, password);
// 添加网络适配器到EntityManager
core.entityManager.getNetworkManager().setNetworkAdapter(networkAdapter);

let playerId;
let roomId;
let playerNet = {};
let lastSnapshotVersion = 0;

// 监听服务器更新
core.entityManager.getNetworkManager().getNetworkAdapter().onServerUpdate((serverState: gs.Message) => {
    if (serverState.type == "authentication") {
        playerId = serverState.payload.id;

        document.getElementById('player-session').textContent = "SESSION:" + serverState.payload.sessionId;
        document.getElementById('player-id').textContent = 'ID:' + playerId;
        document.getElementById('player-name').textContent = "Name:" + userName;
    } else if(serverState.type == 'sessionId') {
        document.getElementById('player-session').textContent = "SESSION:" + serverState.payload;
    }

    if (serverState.type != 'heartbeat' && serverState.type != 'frameSync') {
        document.getElementById('loggerArea').textContent += (`[${serverState.type}]: ${JSON.stringify(serverState.payload)}\n`);

        console.warn('更新游戏状态', serverState);
    }
});


function createPlayer(id: string) {
    const playerEntity = core.entityManager.createEntity(Player) as Player;
    playerEntity.addComponent(PositionComponent);
    playerEntity.addComponent(VelocityComponent);
    playerEntity.addComponent(ColorComponent);
    playerEntity.playerId = id;
    playerEntity.addTag("player");
    playerNet[id] = playerEntity.getId();
}

function deletePlayer(id: string) {
    core.entityManager.deleteEntity(playerNet[id]);
    delete playerNet[id];

    core.systemManager.invalidateEntityCacheForSystem(drawSystem);
}

function deleteAllPlayer() {
    const players = core.entityManager.getEntitiesWithTag('player');
    for (let i = players.length - 1; i >= 0; i --) {
        let playerId = (players[i] as Player).playerId;
        core.entityManager.deleteEntity(playerNet[playerId]);
    }

    playerNet = {};

    core.systemManager.invalidateEntityCacheForSystem(drawSystem);
}

const syncStrategy = new gs.SnapshotInterpolationStrategy();
syncStrategy.setInterpolationCallback((prevSnapshot, nextSnapshot)=>{

    console.log(`${prevSnapshot} ${nextSnapshot}`);
});
const strategyManager = new gs.SyncStrategyManager(syncStrategy);// 发送状态

document.addEventListener("DOMContentLoaded", function() {
    // 获取加入房间按钮
    const joinRoomButton = document.getElementById("join-room-btn");
    const createRoomButton = document.getElementById("create-room-btn");
    const leaveRoomButton = document.getElementById('leave-room-btn');

    const startFrameBtn = document.getElementById('start-frame');
    const endFrameBtn = document.getElementById('end-frame');

    const clearLogBtn = document.getElementById('clear-log');

    joinRoomButton.onclick = ( ev: MouseEvent)=> {
        console.log("发送加入房间指令");
        // 获取输入框元素
        const roomInputElement = document.getElementById("room-input") as HTMLInputElement;
        // 获取输入框中的房间号
        const roomInput = roomInputElement.value;

        networkAdapter.RoomAPI.joinRoom(roomInput);
    }

    createRoomButton.onclick = (ev: MouseEvent) => {
        console.log("发送创建房间指令");

        networkAdapter.RoomAPI.createRoom(10, room => {
            roomId = room.id;
            document.getElementById('room-id').textContent = "ID: " + roomId;

            createPlayer(playerId);
        });
    };

    clearLogBtn.onclick = (ev: MouseEvent) => {
        document.getElementById('loggerArea').textContent = '';
    };

    leaveRoomButton.onclick = (ev: MouseEvent) => {
        console.log("发送退出房间指令");

        networkAdapter.RoomAPI.leaveRoom(roomId);
    };

    startFrameBtn.onclick = (ev: MouseEvent) => {
        console.log('开始帧同步');

        networkAdapter.RoomAPI.startGame(roomId);
    };

    endFrameBtn.onclick = (ev: MouseEvent) => {
        console.log('结束帧同步');

        networkAdapter.RoomAPI.endGame(roomId);
    };

    networkAdapter.RoomAPI.setPlayerLeftCallback(leftPlayerId => {
        if (leftPlayerId == playerId) {
            // 自己离开房间
            document.getElementById('room-id').textContent = "";

            deleteAllPlayer();
        } else {
            console.log(`有玩家离开: ${leftPlayerId}`);

            deletePlayer(leftPlayerId);
        }
    });

    networkAdapter.RoomAPI.setPlayerJoinedCallback((joinPlayerId, room) => {
        if (joinPlayerId == playerId) {
            roomId = room.id;
            // 自己加入房间
            document.getElementById('room-id').textContent = `ID: ${room.id}`;
            for (let player of room.players) {
                createPlayer(player.id);
            }
        }else {
            console.log(`有玩家加入: ${joinPlayerId}`);
            createPlayer(joinPlayerId);
        }
    });

    networkAdapter.RoomAPI.setFrameSync((payload) =>{
        if (payload.actions)  {
            console.log(payload.frame, payload.actions);
        }

        document.getElementById('frame').textContent = `帧: ${payload.frame}`;

        const snapshot = core.entityManager.createIncrementalStateSnapshot(lastSnapshotVersion);

        // 如果有增量数据
        if (snapshot.entities.length > 0) {
            // 向服务器发送增量数据
            networkAdapter.RoomAPI.snapShot(roomId, snapshot, lastSnapshotVersion);
            // 输出增量帧
            console.log(`version: ${lastSnapshotVersion} snapshot: ${snapshot}`);
        }
    });

    networkAdapter.RoomAPI.setSnapshotCallback((snapshot) => {
        console.log(`receive snapshot: ${snapshot}`);


        lastSnapshotVersion = snapshot.lastSnapVersion;
        strategyManager.receiveState(snapshot);
        // core.entityManager.applyIncrementalSnapshot(snapshot.snapshot);
    });


    const inputAdapter = new MyInputAdapter(core.entityManager.getInputManager(), networkAdapter);
    document.addEventListener("keydown", function(event) {
        inputAdapter.sendInputEvent(event, playerId);
    });

    document.addEventListener("keyup", function (event) {
        inputAdapter.sendInputEvent(event, playerId);
    });

    core.systemManager.registerSystem(drawSystem);
});

let lastTime = 0;

function update(timestamp) {
    const deltaTime = (timestamp - lastTime) / 1000; // 将时间戳转换为秒

    // 这里写你的更新逻辑
    core.update(deltaTime);

    lastTime = timestamp;

    // 请求下一帧
    requestAnimationFrame(update);

    // 处理状态更新
    strategyManager.handleStateUpdate(deltaTime);

}

// 开始更新循环
requestAnimationFrame(update);
