module gs {
    export class TransformComponent extends Component {
        public x: number = 0;
        public y: number = 0;
        public rotation: number = 0;
        public scaleX: number = 1;
        public scaleY: number = 1;

        public do() {
            const entityManager = new EntityManager();
            const transformManager = new ComponentManager<TransformComponent>(TransformComponent);
            Component.registerComponent(TransformComponent, transformManager);

            const entity = entityManager.createEntity();
            const transform = transformManager.create(entity.getId());
            transform.x = 10;
            transform.y = 20;

            // 获取实体的TransformComponent数据
            const entityTransform = transformManager.get(entity.getId());
            console.log(entityTransform.x, entityTransform.y); // 输出: 10, 20
        }
    }
}

