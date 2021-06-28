import * as PIXI from "pixi.js";

type Vector = PIXI.Point;

export function add(a: Vector, b: Vector): Vector {
    return new PIXI.Point(a.x + b.x, a.y + b.y);
}
export function sub(a: Vector, b: Vector): Vector {
    return new PIXI.Point(a.x - b.x, a.y - b.y);
}
export function neg(a: Vector): Vector {
    return new PIXI.Point(-a.x, -a.x);
}
export function mul(a: Vector, factor: number): Vector {
    return new PIXI.Point(a.x * factor, a.y * factor);
}
export function rotate(a: Vector, rad: number): Vector {
    return new PIXI.Point(
        Math.cos(rad) * a.x - Math.sin(rad) * a.y, 
        Math.sin(rad) * a.x + Math.cos(rad) * a.y
    );
}
export function get_normal(a: Vector): Vector {
    return get_normalized(rotate(a, -Math.PI / 2));
}
export function get_normalized(a: Vector): Vector {
    let a_norm = norm(a);
    return new PIXI.Point(a.x / a_norm, a.y / a_norm);
}
export function norm(a: Vector): number {
    return Math.sqrt(a.x * a.x + a.y * a.y);
}
export class Line {
    constructor(private support_vector: PIXI.Point, private direction: Vector) {
        this.direction = get_normalized(direction);
    }

    mirror_point(p:PIXI.Point):PIXI.Point{
        return sub(p, mul(this.normel, this.get_distance_to(p) * 2))
    }

    get_distance_to(p:PIXI.Point):number{
        let n = this.normel;
        let r = sub(this.support_vector, p);

        let distance = Math.round((-n.y * r.y) - (r.x * n.x));
        return distance;
    }

    get normel() {
        return get_normal(this.direction);
    }
}
