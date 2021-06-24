import * as PIXI from "pixi.js";
import { PolygonConnector } from "./PolygonConnector";
import { puzzlePieceController } from "../controller/PuzzlePieceController";

export class PuzzlePiece extends PIXI.Container {
    /**
     * @param x The x position (upper left corner) of the PuzzlePiece inside the BaseTexture
     * @param y The y Position (upper left corner) of the PuzzlePiece inside the BaseTextrure
     * @param puzzle_piece_inner_width The width of the PuzzlePiece inside the BaseTextrue
     * @param puzzle_piece_inner_height The height of the PuzzlePiece inside the BaseTexture
     * @param base_texture The BaseTexture
     * @param con_percentage ????
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
        private con_percentage: number,
        public top: PolygonConnector,
        public bottom: PolygonConnector,
        public left: PolygonConnector,
        public right: PolygonConnector,
    ) {
        super();
        this.position.x = x;
        this.position.y = y;
        this._width = puzzle_piece_inner_width;
        this._height = puzzle_piece_inner_height;

        if (top) {
            this._height += top.added_size;
            this.position.y -= top.added_size;
        }
        if (bottom) {
            this._height += bottom.added_size;
        }
        if (left) {
            this._width += left.added_size;
            this.position.x -= left.added_size;
        }
        if (right) {
            this._width += right.added_size;
        }

        let tile_texture = new PIXI.Texture(
            base_texture,
            new PIXI.Rectangle(this.position.x, this.position.y, this._width, this._height),
        );
        let tile_sprite = new PIXI.Sprite(tile_texture);

        let polygon_points = [
            ...(top ? top.points : []),
            ...(right ? right.points : []),
            ...(bottom ? bottom.points : []),
            ...(left ? left.points : []),
        ];

        let mask = new PIXI.Graphics();
        mask.beginFill(0xffffff, 1);
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
        return this.left?.added_size ?? 0;
    }

    get innerY() {
        return this.top?.added_size ?? 0;
    }
}
