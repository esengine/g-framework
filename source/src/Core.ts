module gs {
    export class Core {
        private _entityManager: EntityManager;
        private _systemManager: SystemManager;
        private _timeManager: TimeManager;
        private _plugins: IPlugin[] = [];

        public get entityManager() {
            return this._entityManager;
        }

        public get systemManager() {
            return this._systemManager;
        }

        private static _instance: Core;
        public static get instance() {
            if (this._instance == null) {
                this._instance = new Core();
                this._instance.onInit();
            }

            return this._instance;
        }

        private constructor() {}

        private onInit() {
            this._entityManager = new EntityManager();
            this._systemManager = new SystemManager(this._entityManager);
            this._timeManager = TimeManager.getInstance();
            return this;
        }

        public registerPlugin(plugin: IPlugin): void {
            this._plugins.push(plugin);
            plugin.onInit(this);
        }

        update(deltaTime: number) {
            this._timeManager.update(deltaTime);
            this._systemManager.update();

            for (const plugin of this._plugins) {
                plugin.onUpdate(deltaTime);
            }
        }
    }
}