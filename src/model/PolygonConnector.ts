import { sub, get_normal, add, mul, Line } from "../utils/PixiPointUtils";
import * as PIXI from "pixi.js";
import { Connector } from "./Connector";
import { PuzzlePiece } from "./PuzzlePiece";

export class PolygonConnector {
    private _points: PIXI.Point[];
    private _from_point: PIXI.Point;
    private _to_point: PIXI.Point;

    private _sibling: PolygonConnector | null = null;

    constructor(points: PIXI.Point[], from_point: PIXI.Point, to_point: PIXI.Point) {
        this._points = points;
        this._from_point = from_point;
        this._to_point = to_point;
    }

    static get_from_to_polygon_connector(from_point: PIXI.Point, to_point: PIXI.Point): PolygonConnector {
        return new PolygonConnector([from_point], from_point, to_point);
    }

    static get_random_polygon_connector(from_point: PIXI.Point, to_point: PIXI.Point, size: number): PolygonConnector {
        let points = [];
        let line_vector = sub(to_point, from_point);
        let normal = get_normal(line_vector);

        let next_point: PIXI.Point;
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
        if (this._sibling) throw new Error('multiple Siblings');
        this._sibling = new PolygonConnector(
            [...this._points.slice(1), this._to_point].reverse(),
            this._to_point,
            this._from_point,
        );
        this._sibling.sibling = this;
        return this._sibling;
    }

    public get stickout() {
        let line = new Line(this._from_point, sub(this._to_point, this._from_point));
        return Math.max(...this._points.map((p) => line.get_distance_to(p)), 0);
    }
    public get stickin() {
        let line = new Line(this._from_point, sub(this._to_point, this._from_point));
        return Math.min(...this._points.map((p) => line.get_distance_to(p)), 0);
    }
    public get points() {
        return this._points;
    }
    public get from_point() {
        return this._from_point;
    }
    public get to_point() {
        return this._to_point;
    }
    public get sibling(): PolygonConnector | null {
        return this._sibling;
    }
    public set sibling(value: PolygonConnector | null) {
        this._sibling = value;
    }
}
