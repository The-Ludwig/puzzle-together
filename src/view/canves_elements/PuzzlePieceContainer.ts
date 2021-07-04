import * as PIXI from "pixi.js";
import { PuzzlePiece } from "./PuzzlePiece";

/**
 * A Container for PuzzlePieces that are connectd.
 */
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
            this.check_for_connections();
        }
    }

    /**
     * checks for all PuzzlePieces if they have some connection
     */
    check_for_connections() {
        let check_result_piece = this._puzzle_pieces
            .map((p) => p.check_for_nearby_counter_pieces())
            .find((p) => p !== null);

        if (check_result_piece) {
            let other_container = check_result_piece.parent as PuzzlePieceContainer;
            this.merge_into(other_container);
        }
    }

    /**
     * merges this container into the other and checks if because of that some connections were formed
     * @param other_container the Container to merge into
     */
    merge_into(other_container: PuzzlePieceContainer) {
        this.removeChildren();
        this._puzzle_pieces.forEach(p => other_container.add_puzzle_piece(p));
        this._puzzle_pieces.forEach(p => p.check_counter_pieces_in_parent());
    }
}
