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

        let next_point:PIXI.Point;
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

    get_opposite_side_connector(): PolygonConnector {
        return new PolygonConnector( [...this.points.slice(1), this.to_point].reverse() , this.to_point, this.from_point);
    }

    get stickout(){
        let line = new Line(this.from_point, sub(this.to_point, this.from_point));
        return Math.max(...this.points.map( (p) => line.get_distance_to(p)), 0);
    }
    
    get stickin(){
        let line = new Line(this.from_point, sub(this.to_point, this.from_point));
        return Math.min(...this.points.map( (p) => line.get_distance_to(p)), 0)
    }
}
