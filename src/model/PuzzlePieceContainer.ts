import * as PIXI from "pixi.js";
import { puzzlePieceController } from "../controller/PuzzlePieceController";
import { PuzzlePiece } from "./PuzzlePiece";

export class PuzzlePieceContainer extends PIXI.Container {
    private _puzzle_pieces: PuzzlePiece[];
    public get puzzle_pieces(): PuzzlePiece[] {
        return this._puzzle_pieces;
    }
    constructor(puzzle_pieces: PuzzlePiece[]) {
        super();
        this._puzzle_pieces = puzzle_pieces;
        this.interactive = true;
        this.buttonMode = true;

        this.on("pointerdown", this.onPuzzlePieceDragStart)
            .on("pointerup", this.onPuzzlePieceDragEnd)
            .on("pointerupoutside", this.onPuzzlePieceDragEnd)
            .on("pointermove", this.onPuzzlePieceDragMove);
        this._puzzle_pieces.forEach((p) => this.addChild(p));
    }

    private _dragging = false;
    private _dragging_position: PIXI.Point = new PIXI.Point(0, 0);

    add_puzzle_piece(puzzle_piece: PuzzlePiece) {
        this.addChild(puzzle_piece);
        this._puzzle_pieces.push(puzzle_piece);
        console.log(this.children);
        console.log(this._puzzle_pieces);
    }

    onPuzzlePieceDragStart(event: PIXI.InteractionEvent) {
        if (!this._dragging) {
            this.alpha = 0.5;
            this._dragging = true;
            this._dragging_position = event.data.getLocalPosition(this);
            this.parent.setChildIndex(this, this.parent.children.length - 1);
        }
    }

    onPuzzlePieceDragMove(event: PIXI.InteractionEvent) {
        if (this._dragging) {
            const newPosition = event.data.getLocalPosition(this.parent);
            this.x = newPosition.x - this._dragging_position.x;
            this.y = newPosition.y - this._dragging_position.y;
        }
    }

    onPuzzlePieceDragEnd(event: PIXI.InteractionEvent) {
        if (this._dragging) {
            this.alpha = 1;
            this._dragging = false;
            if (this._puzzle_pieces.length == 1) {
                let single_puzzle_piece = this._puzzle_pieces[0];
                let check_result_piece = single_puzzle_piece.check_connecting();
                if (check_result_piece) {
                    let other_container = check_result_piece.parent as PuzzlePieceContainer;
                    this.removeChild(single_puzzle_piece);
                    this._puzzle_pieces = [];
                    other_container.add_puzzle_piece(single_puzzle_piece);
                    check_result_piece.check_connection_line(other_container);
                    this.destroy();
                }
            }
        }
    }
}
