interface Map {
    getStartNode(): MapNode;
    getEndNode(): MapNode;
    setStartNode(x: number, y: number): void;
    setEndNode(x: number, y: number): void;
    adjacentList(node: MapNode): Array<MapNode>;
    draw(nodes?: Array<MapNode>): void;
}
class Point {
    public x: number;
    public y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
class Astar {


    public static generateRoads(map: Map): Array<MapNode> {
        var closeSet: Array<MapNode> = [];
        var openSet: Array<MapNode> = [];
        var roads = new Array<MapNode>();
        var currentNode = map.getStartNode();
        currentNode.g = 0;
        closeSet.push(currentNode);
        //退出条件
        while (currentNode != map.getEndNode()) {
            //获取当前节点的相邻节点
            var adjacents = map.adjacentList(currentNode);
            for (const adjNode of adjacents) {
                if (closeSet.indexOf(adjNode) > -1) {
                    continue;
                }
                if (openSet.indexOf(adjNode) > -1) {
                    var newG = adjNode.calcG(currentNode);
                    if (newG < adjNode.g) {
                        adjNode.p = currentNode;
                        adjNode.g = newG;
                    }
                } else {
                    adjNode.p = currentNode;
                    adjNode.h = adjNode.calcH(map.getEndNode());
                    adjNode.g = adjNode.calcG(currentNode);
                    openSet.push(adjNode);
                }
            }
            if (openSet.length == 0) {
                break;
            }
            openSet.sort((a, b) => {
                return b.f - a.f;
            });
            var node = openSet.pop();
            if (node) {
                currentNode = node;
                closeSet.push(currentNode);
            }
        }
        if (currentNode == map.getEndNode()) {
            while (currentNode) {
                roads.push(currentNode);
                currentNode = currentNode.p;
            }
        }
        return roads;
    }

}
class MapNode extends Point {
    public pass: boolean;
    private distance: number;
    private step: number;
    private parent: MapNode;

    constructor(x: number, y: number, pass: boolean) {
        super(x, y);
        this.pass = pass;
    }
    public get p() {
        return this.parent;
    }
    public set p(node: MapNode) {
        this.parent = node;
    }
    public get f(): number {
        return this.h + this.g;
    }
    public get h(): number {
        return this.distance;
    }
    public set h(distance: number) {
        this.distance = distance;
    }
    public calcH(node: { x: number, y: number }): number {
        return Math.abs(node.x - this.x) + Math.abs(node.y - this.y);
    }
    public get g(): number {
        return this.step;
    }
    public set g(step: number) {
        this.step = step;
    }
    public calcG(parentNode: MapNode): number {
        return parentNode.g + 1;
    }
    public equals(node: { x: number, y: number }): boolean {
        return this.x == node.x && this.y == node.y;
    }
}

/**
 * map工厂类，继承此类提供map对象初始化功能，默认构造器x,y传入地图的大小
 */
class MapFactory {
    public static initMap<T extends {}>(this: new (x: number, y: number) => T, x: number, y: number): T {
        return <T>new this(x, y);
    }
}
/**
 * 随机地图实现，根据地图大小，自动初始化每个地图块。
 */
class RandomMap extends MapFactory {
    public x: number;
    public y: number;
    public map: Array<Array<MapNode>>;

    constructor(x: number, y: number) {
        super();
        this.x = x;
        this.y = y;
        this.map = new Array<Array<MapNode>>();
        for (var i = 0; i < x; ++i) {
            var xNode = new Array<MapNode>();
            for (var j = 0; j < y; ++j) {
                if (Math.floor(Math.random() * 10) > 1) {
                    xNode.push(new MapNode(i, j, true));
                } else {
                    xNode.push(new MapNode(i, j, false));
                }
            }
            this.map.push(xNode);
        }
    }
}
class ConsoleMap extends RandomMap implements Map {
    private start: MapNode;
    private end: MapNode;

    public getStartNode(): MapNode {
        return this.start;
    }
    public getEndNode(): MapNode {
        return this.end;

    }
    public setStartNode(x: number, y: number): void {
        this.start = this.map[x][y];
    }
    public setEndNode(x: number, y: number): void {
        this.end = this.map[x][y];
    }
    public adjacentList(node: MapNode): Array<MapNode> {
        var nodes = new Array<MapNode>();
        var upX = node.x;
        var upY = node.y - 1;
        var downX = node.x;
        var downY = node.y + 1;
        var leftX = node.x - 1;
        var leftY = node.y;
        var rightX = node.x + 1;
        var rightY = node.y;
        if (upX >= 0 && upY >= 0 && upX < this.x && upY < this.y && this.map[upX][upY].pass) {
            nodes.push(this.map[upX][upY]);
        }
        if (downX >= 0 && downY >= 0 && downX < this.x && downY < this.y && this.map[downX][downY].pass) {
            nodes.push(this.map[downX][downY]);
        }
        if (leftX >= 0 && leftY >= 0 && leftX < this.x && leftY < this.y && this.map[leftX][leftY].pass) {
            nodes.push(this.map[leftX][leftY]);
        }
        if (rightX >= 0 && rightY >= 0 && rightX < this.x && rightY < this.y && this.map[rightX][rightY].pass) {
            nodes.push(this.map[rightX][rightY]);
        }
        return nodes;
    }

    public draw(nodes?: Array<MapNode>): void {
        let line = "";
        for (var i = 0; i < this.x; ++i) {
            for (var j = 0; j < this.y; ++j) {
                var road;
                if (nodes && nodes.indexOf(this.map[i][j]) > -1) {
                    road = "^ "
                } else if (this.map[i][j].pass) {
                    road = "□ "
                } else {
                    road = "■ ";
                }
                if (this.start.equals({ x: i, y: j })) {
                    road = "♂ "
                }
                if (this.end.equals({ x: i, y: j })) {
                    road = "♀ "
                }
                line += road;
            }
            line += "\n";
        }
        console.log(line);
    }
}
console.log("...生成地图ing..... \n □ :可通过 \n ■ :不可通过 \n ♂ :起点 \n ♀ :终点 \n ^ :路径")
let map = ConsoleMap.initMap(8, 8);
var sx = Math.floor(Math.random() * map.x);
var sy = Math.floor(Math.random() * map.y);
map.setStartNode(sx, sy);
console.log("生成随机起点" + sx + "," + sy);
var ex = Math.floor(Math.random() * map.x);
var ey = Math.floor(Math.random() * map.y);
console.log("生成随机终点" + ex + "," + ey);
map.setEndNode(ex, ey);
map.draw();
console.log("....开始自动寻路.....");
let roads = Astar.generateRoads(map);
map.draw(roads);