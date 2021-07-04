import * as PIXI from 'pixi.js';

/**
 * draws a line that connects the given points in the given PIXI.Graphics object
 * @param graphics_object the graphics object in wich the line should be drawen
 * @param points the points that should be connected
 */
export function draw_line(graphics_object: PIXI.Graphics, points: PIXI.Point[]) {
    if (points.length >= 2) {
        graphics_object.moveTo(points[0].x, points[0].y);
        points.slice(1).forEach((p) => graphics_object.lineTo(p.x, p.y));
    }
}