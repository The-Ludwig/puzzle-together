import * as PIXI from "pixi.js";
import { PolygonConnector } from "./PolygonConnector";
import { puzzlePieceController } from "../controller/PuzzlePieceController";
import { sub } from "../utils/PixiPointUtils";

export class PuzzlePiece extends PIXI.Container {

    private inner_upper_left: PIXI.Point;
    private inner_upper_right: PIXI.Point;
    private inner_lower_right: PIXI.Point;
    private inner_lower_left: PIXI.Point;
    
    private texture_upper_left: PIXI.Point;
    private texture_upper_right: PIXI.Point;
    private texture_lower_right: PIXI.Point;
    private texture_lower_left: PIXI.Point;

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
        private puzzle_piece_inner_width: number,
        private puzzle_piece_inner_height: number,
        base_texture: PIXI.BaseTexture,
        public top: PolygonConnector,
        public bottom: PolygonConnector,
        public left: PolygonConnector,
        public right: PolygonConnector,
    ) {
        super();

        this.inner_upper_left = new PIXI.Point(x,y);
        this.inner_upper_right = new PIXI.Point(x + puzzle_piece_inner_width,y);
        this.inner_lower_right = new PIXI.Point(x + puzzle_piece_inner_width, y + puzzle_piece_inner_height);
        this.inner_lower_left = new PIXI.Point(x, y + puzzle_piece_inner_height);
        
        this.texture_upper_left = new PIXI.Point(x - left.stickout, y - top.stickout);
        this.texture_upper_right = new PIXI.Point(x + puzzle_piece_inner_width + right.stickout, y - top.stickout );
        this.texture_lower_right = new PIXI.Point(x + puzzle_piece_inner_width + right.stickout, y + puzzle_piece_inner_height + bottom.stickout);
        this.texture_lower_left = new PIXI.Point(x - left.stickout, y + puzzle_piece_inner_height + bottom.stickout);


        this.position.x = x;
        this.position.y = y;
        this._width = this.texture_upper_right.x - this.texture_upper_left.x ;
        this._height = this.texture_lower_left.y - this.texture_upper_left.y;

        let tile_texture = new PIXI.Texture(
            base_texture,
            new PIXI.Rectangle(this.position.x, this.position.y, this._width, this._height),
        );
        let tile_sprite = new PIXI.Sprite(tile_texture);

        let polygon_points = [
            ...top.points,
            ...right.points,
            ...bottom.points,
            ...left.points,
        ];
        let min_x = Math.min(...polygon_points.map( p => p.x));
        let min_y = Math.min(...polygon_points.map( p => p.y));
        let loacal_transform_vector = new PIXI.Point(min_x, min_y);
        polygon_points = polygon_points.map( p => sub(p, loacal_transform_vector) );

        let mask = new PIXI.Graphics();
        mask.beginFill(0xff0000, 1);
        mask.drawPolygon(polygon_points);
        mask.endFill();
        this.interactive = true;
        this.buttonMode = true;
        tile_sprite.mask = mask;
        this.addChild(tile_sprite);
        this.addChild(mask);

        this.on("pointerdown", puzzlePieceController.onPuzzlePieceDragStart)
            .on("pointerup", puzzlePieceController.onPuzzlePieceDragEnd)
            .on("pointerupoutside", puzzlePieceController.onPuzzlePieceDragEnd)
            .on("pointermove", puzzlePieceController.onPuzzlePieceDragMove);
    }

    get innerWidth() {
        // return this._width - (this.left?.added_size ?? 0) - (this.right?.added_size ?? 0);
        return this.puzzle_piece_inner_width;
    }

    get innerHeight() {
        // return this._height - (this.top?.added_size ?? 0) - (this.bottom?.added_size ?? 0);
        return this.puzzle_piece_inner_height;
    }

    get midX() {
        return this.innerX + Math.floor(this.innerWidth / 2);
    }

    get midY() {
        return this.innerY + Math.floor(this.innerHeight / 2);
    }

    get innerX() {
        return this.left.stickout;
    }

    get innerY() {
        return this.top.stickout;
    }
}
