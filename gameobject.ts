enum GameObjectType {
    Image,
    Text,
    Box
}

class GameObject {
    type: GameObjectType;
    pos: { x: number, y: number };
    visible: boolean
    data: string;
    size: { x: number, y: number };
    selected = false;

    constructor(type: GameObjectType, position={ x: 0, y: 0 }, size={ x: 0, y: 0 }, data="", visible=true) {
        this.type = type;
        this.data = data;
        this.pos = position;
        this.visible = visible;
        this.size = size;
    }
}