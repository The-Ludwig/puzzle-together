import * as PIXI from 'pixi.js';
import { puzzlePieceController } from '../controller/PuzzlePieceController';
import { PuzzlePiece } from './PuzzlePiece';

export class PuzzlePieceContainer extends PIXI.Container{
    constructor(private puzzle_pieces:PuzzlePiece[]){
        super()
        this.interactive = true;
        this.buttonMode = true;

        this.on("pointerdown", puzzlePieceController.onPuzzlePieceDragStart)
            .on("pointerup", puzzlePieceController.onPuzzlePieceDragEnd)
            .on("pointerupoutside", puzzlePieceController.onPuzzlePieceDragEnd)
            .on("pointermove", puzzlePieceController.onPuzzlePieceDragMove);
        puzzle_pieces.forEach( (p) => this.addChild(p) );
    }


}