import * as PIXI from "pixi.js";
import { PolygonConnector } from "../../model/PolygonConnector";
import { draw_line } from "../../utils/PixiGraphicsUtils";
import { add, norm, sub } from "../../utils/PixiPointUtils";
import { PuzzlePieceContainer } from "./PuzzlePieceContainer";

/**
 * The Class that represents a single PuzzlePiece.
 * currently it uses the PolygonConnector, but in the future this should be a abstrakt Connector
 */
export class PuzzlePiece extends PIXI.Container {
    private _inner_upper_left: PIXI.Point;
    private _inner_upper_right: PIXI.Point;
    private _inner_lower_right: PIXI.Point;
    private _inner_lower_left: PIXI.Point;

    private _texture_upper_left: PIXI.Point;
    private _texture_upper_right: PIXI.Point;
    private _texture_lower_right: PIXI.Point;
    private _texture_lower_left: PIXI.Point;

    private _puzzle_piece_inner_width: number;
    private _puzzle_piece_inner_height: number;

    private _top_connector: PolygonConnector;
    private _top_connected: boolean = false;
    private _bottom_connector: PolygonConnector;
    private _bottom_connected: boolean = false;
    private _left_connector: PolygonConnector;
    private _left_connected: boolean = false;
    private _right_connector: PolygonConnector;
    private _right_connected: boolean = false;

    private _top_counter_piece: PuzzlePiece | null = null;
    private _bottom_counter_piece: PuzzlePiece | null = null;
    private _left_counter_piece: PuzzlePiece | null = null;
    private _right_counter_piece: PuzzlePiece | null = null;

    private _local_transform_vector: PIXI.Point = new PIXI.Point(0, 0);
    private _rim_line = new PIXI.Graphics();

    /**
     * @param x The x position (upper left corner) of the PuzzlePiece inside the BaseTexture
     * @param y The y Position (upper left corner) of the PuzzlePiece inside the BaseTextrure
     * @param puzzle_piece_inner_width The width of the PuzzlePiece inside the BaseTextrue
     * @param puzzle_piece_inner_height The height of the PuzzlePiece inside the BaseTexture
     * @param base_texture The BaseTexture
     * @param top The Connector the PuzzlePiece is Connected to at the top
     * @param bottom The Connector the PuzzlePiece is Connected to at the bottom
     * @param left The Connector the PuzzlePiece is Connected to at the left
     * @param right The Connector the PuzzlePiece is Connected to at the right
     */
    constructor(
        x: number,
        y: number,
        puzzle_piece_inner_width: number,
        puzzle_piece_inner_height: number,
        base_texture: PIXI.BaseTexture,
        top: PolygonConnector,
        bottom: PolygonConnector,
        left: PolygonConnector,
        right: PolygonConnector,
    ) {
        super();
        this.position.x = x;
        this.position.y = y;

        this._puzzle_piece_inner_width = puzzle_piece_inner_width;
        this._puzzle_piece_inner_height = puzzle_piece_inner_height;
        this._top_connector = top;
        this._bottom_connector = bottom;
        this._left_connector = left;
        this._right_connector = right;

        this._inner_upper_left = new PIXI.Point(x, y);
        this._inner_upper_right = new PIXI.Point(x + this._puzzle_piece_inner_width, y);
        this._inner_lower_right = new PIXI.Point(
            x + this._puzzle_piece_inner_width,
            y + this._puzzle_piece_inner_height,
        );
        this._inner_lower_left = new PIXI.Point(x, y + this._puzzle_piece_inner_height);

        this._texture_upper_left = new PIXI.Point(x - this._left_connector.stickout, y - this._top_connector.stickout);
        this._texture_upper_right = new PIXI.Point(
            x + this._puzzle_piece_inner_width + this._right_connector.stickout,
            y - this._top_connector.stickout,
        );
        this._texture_lower_right = new PIXI.Point(
            x + this._puzzle_piece_inner_width + this._right_connector.stickout,
            y + this._puzzle_piece_inner_height + this._bottom_connector.stickout,
        );
        this._texture_lower_left = new PIXI.Point(
            x - this._left_connector.stickout,
            y + this._puzzle_piece_inner_height + this._bottom_connector.stickout,
        );

        this._width = this._texture_upper_right.x - this._texture_upper_left.x;
        this._height = this._texture_lower_left.y - this._texture_upper_left.y;

        let tile_texture = new PIXI.Texture(
            base_texture,
            new PIXI.Rectangle(this.position.x, this.position.y, this._width, this._height),
        );
        let tile_sprite = new PIXI.Sprite(tile_texture);

        let polygon_points = [
            ...this._top_connector.points,
            ...this._right_connector.points,
            ...this._bottom_connector.points,
            ...this._left_connector.points,
        ];
        let min_x = Math.min(...polygon_points.map((p) => p.x));
        let min_y = Math.min(...polygon_points.map((p) => p.y));
        this._local_transform_vector = new PIXI.Point(min_x, min_y);
        polygon_points = polygon_points.map((p) => sub(p, this._local_transform_vector));

        let mask = new PIXI.Graphics();
        mask.beginFill(0xff0000, 1);
        mask.drawPolygon(polygon_points);
        mask.endFill();

        tile_sprite.mask = mask;
        this.addChild(tile_sprite);
        this.addChild(mask);
        this.addChild(this._rim_line);
        this.draw_unconnected_lines();
    }

    /**
     * checks if some of the the pieces counterpieces are in the same parent. if so the corresponding connected property is set to true and the outline is redrawn
     */
    public check_counter_pieces_in_parent() {
        if (this._top_counter_piece && this.parent.children.includes(this._top_counter_piece)) {
            this._top_counter_piece._bottom_connected = true;
            this._top_counter_piece.draw_unconnected_lines();
            this._top_connected = true;
        }
        if (this._right_counter_piece && this.parent.children.includes(this._right_counter_piece)) {
            this._right_counter_piece._left_connected = true;
            this._right_counter_piece.draw_unconnected_lines();
            this._right_connected = true;
        }
        if (this._bottom_counter_piece && this.parent.children.includes(this._bottom_counter_piece)) {
            this._bottom_counter_piece._top_connected = true;
            this._bottom_counter_piece.draw_unconnected_lines();
            this._bottom_connected = true;
        }
        if (this._left_counter_piece && this.parent.children.includes(this._left_counter_piece)) {
            this._left_counter_piece._right_connected = true;
            this._left_counter_piece.draw_unconnected_lines();
            this._left_connected = true;
        }
        this.draw_unconnected_lines();
    }

    /**
     * draws the outline for all unconnected sides
     */
    private draw_unconnected_lines() {
        this.removeChild(this._rim_line);
        this._rim_line = new PIXI.Graphics();
        this._rim_line.lineStyle(5, 0xff0000, 1);

        if (!this._top_connected) {
            let top_local_points = [...this._top_connector.points, this._top_connector.to_point].map((p) =>
                sub(p, this._local_transform_vector),
            );
            draw_line(this._rim_line, top_local_points);
        }
        if (!this._right_connected) {
            let right_local_points = [...this._right_connector.points, this._right_connector.to_point].map((p) =>
                sub(p, this._local_transform_vector),
            );
            draw_line(this._rim_line, right_local_points);
        }

        if (!this._bottom_connected) {
            let bottom_local_points = [...this._bottom_connector.points, this._bottom_connector.to_point].map((p) =>
                sub(p, this._local_transform_vector),
            );
            draw_line(this._rim_line, bottom_local_points);
        }
        if (!this._left_connected) {
            let left_local_points = [...this._left_connector.points, this._left_connector.to_point].map((p) =>
                sub(p, this._local_transform_vector),
            );
            draw_line(this._rim_line, left_local_points);
        }
        this.addChild(this._rim_line);
    }

    /**
     * checks weather a counter piece is nearby, and if so returns it otherwise null
     * @returns the first found (from top clockwise) counterpiece that is nearby, or null if no counterpiece is nearby
     */
    public check_for_nearby_counter_pieces(): PuzzlePiece | null {
        if (this._top_counter_piece && !this._top_connected) {
            let detection_point = add(this.mid_position_global, new PIXI.Point(0, -this._puzzle_piece_inner_height));
            let distance_to_detection_point = norm(sub(detection_point, this._top_counter_piece.mid_position_global));
            console.log(`top distance: ${distance_to_detection_point}`);
            if (distance_to_detection_point <= this._puzzle_piece_inner_width / 4) {
                return this._top_counter_piece;
            }
        }
        if (this._bottom_counter_piece && !this._bottom_connected) {
            let detection_point = add(this.mid_position_global, new PIXI.Point(0, this._puzzle_piece_inner_height));
            let distance_to_detection_point = norm(
                sub(detection_point, this._bottom_counter_piece.mid_position_global),
            );
            console.log(`bottom distance: ${distance_to_detection_point}`);
            if (distance_to_detection_point <= this._puzzle_piece_inner_width / 4) {
                return this._bottom_counter_piece;
            }
        }
        if (this._right_counter_piece && !this._right_connected) {
            let detection_point = add(this.mid_position_global, new PIXI.Point(this._puzzle_piece_inner_width, 0));
            let distance_to_detection_point = norm(sub(detection_point, this._right_counter_piece.mid_position_global));
            console.log(`right distance: ${distance_to_detection_point}`);
            if (distance_to_detection_point <= this._puzzle_piece_inner_height / 4) {
                return this._right_counter_piece;
            }
        }
        if (this._left_counter_piece && !this._left_connected) {
            let detection_point = add(this.mid_position_global, new PIXI.Point(-this._puzzle_piece_inner_width, 0));
            let distance_to_detection_point = norm(sub(detection_point, this._left_counter_piece.mid_position_global));
            console.log(`left distance: ${distance_to_detection_point}`);
            if (distance_to_detection_point <= this._puzzle_piece_inner_height / 4) {
                return this._left_counter_piece;
            }
        }

        return null;
    }

    public get innerWidth() {
        return this._puzzle_piece_inner_width;
    }
    public get innerHeight() {
        return this._puzzle_piece_inner_height;
    }

    public get midX() {
        return this.innerX + Math.floor(this.innerWidth / 2);
    }
    public get midY() {
        return this.innerY + Math.floor(this.innerHeight / 2);
    }
    public get mid_position_global() {
        return add(this.getGlobalPosition(), new PIXI.Point(this.midX, this.midY));
    }
    public get innerX() {
        return this._left_connector.stickout;
    }
    public get innerY() {
        return this._top_connector.stickout;
    }
    public get top() {
        return this._top_connector;
    }
    public get right() {
        return this._right_connector;
    }
    public get bottom() {
        return this._bottom_connector;
    }
    public get left() {
        return this._left_connector;
    }
    public get top_counter_piece(): PuzzlePiece | null {
        return this._top_counter_piece;
    }
    public set top_counter_piece(value: PuzzlePiece | null) {
        if (value) value._bottom_counter_piece = this;
        this._top_counter_piece = value;
    }
    public get bottom_counter_piece(): PuzzlePiece | null {
        return this._bottom_counter_piece;
    }
    public set bottom_counter_piece(value: PuzzlePiece | null) {
        if (value) value._top_counter_piece = this;
        this._bottom_counter_piece = value;
    }
    public get left_counter_piece(): PuzzlePiece | null {
        return this._left_counter_piece;
    }
    public set left_counter_piece(value: PuzzlePiece | null) {
        if (value) value._right_counter_piece = this;
        this._left_counter_piece = value;
    }
    public get right_counter_piece(): PuzzlePiece | null {
        return this._right_counter_piece;
    }
    public set right_counter_piece(value: PuzzlePiece | null) {
        if (value) value._left_counter_piece = this;
        this._right_counter_piece = value;
    }
}
