import * as PIXI from "pixi.js";
import { PolygonConnector } from "./PolygonConnector";
import { puzzlePieceController } from "../controller/PuzzlePieceController";
import { sub } from "../utils/PixiPointUtils";

export class PuzzlePiece extends PIXI.Container {
    private _inner_upper_left: PIXI.Point;
    private _inner_upper_right: PIXI.Point;
    private _inner_lower_right: PIXI.Point;
    private _inner_lower_left: PIXI.Point;

    private _texture_upper_left: PIXI.Point;
    private _texture_upper_right: PIXI.Point;
    private _texture_lower_right: PIXI.Point;
    private _texture_lower_left: PIXI.Point;

    /**
     * @param x The x position (upper left corner) of the PuzzlePiece inside the BaseTexture
     * @param y The y Position (upper left corner) of the PuzzlePiece inside the BaseTextrure
     * @param _puzzle_piece_inner_width The width of the PuzzlePiece inside the BaseTextrue
     * @param _puzzle_piece_inner_height The height of the PuzzlePiece inside the BaseTexture
     * @param base_texture The BaseTexture
     * @param _top The Connector the PuzzlePiece is Connected to at the top
     * @param _bottom The Connector the PuzzlePiece is Connected to at the bottom
     * @param _left The Connector the PuzzlePiece is Connected to at the left
     * @param _right The Connector the PuzzlePiece is Connected to at the right
     */
    constructor(
        x: number,
        y: number,
        private _puzzle_piece_inner_width: number,
        private _puzzle_piece_inner_height: number,
        base_texture: PIXI.BaseTexture,
        private _top: PolygonConnector,
        private _bottom: PolygonConnector,
        private _left: PolygonConnector,
        private _right: PolygonConnector,
    ) {
        super();

        this._inner_upper_left = new PIXI.Point(x, y);
        this._inner_upper_right = new PIXI.Point(x + _puzzle_piece_inner_width, y);
        this._inner_lower_right = new PIXI.Point(x + _puzzle_piece_inner_width, y + _puzzle_piece_inner_height);
        this._inner_lower_left = new PIXI.Point(x, y + _puzzle_piece_inner_height);

        this._texture_upper_left = new PIXI.Point(x - _left.stickout, y - _top.stickout);
        this._texture_upper_right = new PIXI.Point(x + _puzzle_piece_inner_width + _right.stickout, y - _top.stickout);
        this._texture_lower_right = new PIXI.Point(
            x + _puzzle_piece_inner_width + _right.stickout,
            y + _puzzle_piece_inner_height + _bottom.stickout,
        );
        this._texture_lower_left = new PIXI.Point(x - _left.stickout, y + _puzzle_piece_inner_height + _bottom.stickout);

        this.position.x = x;
        this.position.y = y;
        this._width = this._texture_upper_right.x - this._texture_upper_left.x;
        this._height = this._texture_lower_left.y - this._texture_upper_left.y;

        let tile_texture = new PIXI.Texture(
            base_texture,
            new PIXI.Rectangle(this.position.x, this.position.y, this._width, this._height),
        );
        let tile_sprite = new PIXI.Sprite(tile_texture);

        let polygon_points = [..._top.points, ..._right.points, ..._bottom.points, ..._left.points];
        let min_x = Math.min(...polygon_points.map((p) => p.x));
        let min_y = Math.min(...polygon_points.map((p) => p.y));
        let loacal_transform_vector = new PIXI.Point(min_x, min_y);
        polygon_points = polygon_points.map((p) => sub(p, loacal_transform_vector));

        let mask = new PIXI.Graphics();
        mask.beginFill(0xff0000, 1);
        mask.drawPolygon(polygon_points);
        mask.endFill();

        tile_sprite.mask = mask;
        this.addChild(tile_sprite);
        this.addChild(mask);
    }

    get innerWidth() {
        // return this._width - (this.left?.added_size ?? 0) - (this.right?.added_size ?? 0);
        return this._puzzle_piece_inner_width;
    }

    get innerHeight() {
        // return this._height - (this.top?.added_size ?? 0) - (this.bottom?.added_size ?? 0);
        return this._puzzle_piece_inner_height;
    }

    get midX() {
        return this.innerX + Math.floor(this.innerWidth / 2);
    }

    get midY() {
        return this.innerY + Math.floor(this.innerHeight / 2);
    }

    get innerX() {
        return this._left.stickout;
    }

    get innerY() {
        return this._top.stickout;
    }

    get top(){
        return this._top;
    }

    get right(){
        return this._right;
    }

    get bottom(){
        return this._bottom;
    }

    get left(){
        return this._left;
    }
}
