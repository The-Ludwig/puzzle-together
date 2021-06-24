class PuzzlePieceController {
    onPuzzlePieceDragStart(this: any, event: any) {
        // store a reference to the data
        // the reason for this is because of multitouch
        // we want to track the movement of this particular touch
        let piece = this;
        piece.data = event.data;
        piece.alpha = 0.5;
        piece.dragging = true;
        piece.locPos = piece.data.getLocalPosition(this);
        // move the last dragged piece to the top
        piece.parent.setChildIndex(piece, piece.parent.children.length - 1);
    }

    onPuzzlePieceDragEnd(this: any) {
        let piece = this;
        piece.alpha = 1;
        piece.dragging = false;
        // set the interaction data to null
        piece.data = null;
    }

    onPuzzlePieceDragMove(this: any) {
        let piece = this;
        if (piece.dragging) {
            const newPosition = piece.data.getLocalPosition(piece.parent);
            piece.x = newPosition.x - piece.locPos.x;
            piece.y = newPosition.y - piece.locPos.y;
        }
    }
}

export const puzzlePieceController: PuzzlePieceController = new PuzzlePieceController();
