import * as PIXI from "pixi.js";

type Vector = PIXI.Point;

export function add(a: PIXI.Point, b: PIXI.Point): PIXI.Point {
    return new PIXI.Point(a.x + b.x, a.y + b.y);
}
export function sub(a: PIXI.Point, b: PIXI.Point): PIXI.Point {
    return new PIXI.Point(a.x - b.x, a.y - b.y);
}
export function neg(a: PIXI.Point): PIXI.Point {
    return new PIXI.Point(-a.x, -a.x);
}
export function mul(a: PIXI.Point, factor: number): PIXI.Point {
    return new PIXI.Point(a.x * factor, a.y * factor);
}
export function rotate(a: PIXI.Point, rad: number): PIXI.Point {
    return new PIXI.Point(Math.cos(rad) * a.x - Math.sin(rad) * a.y, Math.sin(rad) * a.x + Math.cos(rad) * a.y);
}
export function get_normal(a: PIXI.Point): PIXI.Point {
    return get_normalized(rotate(a, -Math.PI / 2));
}
export function get_normalized(a: PIXI.Point): PIXI.Point {
    let a_norm = norm(a);
    return new PIXI.Point(a.x / a_norm, a.y / a_norm);
}
export function norm(a: PIXI.Point): number {
    return Math.sqrt(Math.pow(a.x, 2) + Math.pow(a.y, 2));
}
export class Line {
    constructor(private support_vector: PIXI.Point, private direction: Vector) {}

    mirror_point(p:PIXI.Point):PIXI.Point{
        return sub(p, mul(this.normel, this.get_distance_to(p) * 2))
    }

    get_distance_to(p:PIXI.Point):number{
        let n = this.normel;
        let s = this.support_vector;
        let d = this.direction; 
        return (d.x * p.y - d.y * p.x - d.x * s.y - d.y * s.x) / (n.y * d.x - n.x)
    }

    get normel() {
        return get_normal(this.direction);
    }
}
