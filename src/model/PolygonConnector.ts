import { Connector } from "./Connector";
import { sub, get_normal, add, mul, Line } from "../utils/PixiPointUtils";
import * as PIXI from "pixi.js";

export class PolygonConnector {
    constructor(public points: PIXI.Point[], public from_point: PIXI.Point, public to_point: PIXI.Point) {}

    static get_from_to_polygon_connector(from_point: PIXI.Point, to_point: PIXI.Point): PolygonConnector {
        return new PolygonConnector([from_point], from_point, to_point);
    }

    static get_random_polygon_connector(from_point: PIXI.Point, to_point: PIXI.Point, size: number): PolygonConnector {
        let points = [];
        let line_vector = sub(to_point, from_point);
        let normal = get_normal(line_vector);

        let next_point = new PIXI.Point();
        points.push(from_point);
        next_point = add(from_point, mul(line_vector, 0.333));
        points.push(next_point);
        next_point = add(next_point, mul(normal, size));
        points.push(next_point);
        next_point = add(next_point, mul(line_vector, 0.333));
        points.push(next_point);
        next_point = add(next_point, mul(normal, -size));
        points.push(next_point);
        return new PolygonConnector(points, from_point, to_point);
    }

    get_random_polygon_connector(from_point: PIXI.Point, to_point: PIXI.Point) {
        let line_vector = sub(to_point, from_point);
        this.points = [];
        this.points.push(from_point);
        this.points.push(add(from_point, mul(line_vector, 0.333)));
    }

    get_opposite_side_connector(): PolygonConnector {
        let line = new Line(this.from_point, sub(this.to_point, this.from_point));
        let points = this.points.map((p) => line.mirror_point(p)).reverse();
        points.pop();
        return new PolygonConnector([this.to_point, ...points], this.to_point, this.from_point);
    }

    /**
     * !DANGER
     * !VORISCHT hier habe ich erstmal einfach nur hardgecodet sollte so auf keinen fall drin bleiben
     */
    get stickout(){
        if (this.points.length > 2) {
            return 30;
        }else {
            return 0;
        }
    }

    get added_size(): number {
        return this.stickout;
    }
}
