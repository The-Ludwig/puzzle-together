import { Connector } from "./Connector";
import * as PIXI from "pixi.js";

export class PolygonConnector implements Connector {
    private polygon: PIXI.Polygon = new PIXI.Polygon();

    get_random_polygon_connector(
        vertex_count: number,
        line_length: number,
        from_point: PIXI.Point,
        to_point: PIXI.Point,
    ) {
        let points = 
        this.polygon = new PIXI.Polygon(from_point);
    }

    get_opposite_side_connector(): Connector {
        throw new Error("Method not implemented.");
    }
    get added_size(): number {
        throw new Error("Method not implemented.");
    }
}
