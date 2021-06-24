import * as PIXI from "pixi.js";
import { PuzzlePiece } from "../model/PuzzlePiece";
import { CircleConnector as Connector } from "../model/CircleConnector";

class PuzzleController {
    loaded_textures: string[] = [];
    loader: PIXI.Loader = new PIXI.Loader();
    
    createPuzzle(canvas: HTMLCanvasElement, src: string, nx: number, ny: number, con_percentage: number) {
        this.loader = new PIXI.Loader();
        if (con_percentage > 0.5 || con_percentage < 0) {
            throw new Error(`con_percentage must be between 0 and 0.5, but ${con_percentage} was provided.`);
        }
        PIXI.settings.SORTABLE_CHILDREN = false;
        this.loader.add(src);

        this.loader.onComplete.add(() => {
            this.loaded_textures.push(src);
            this.loader.resources[src].data.loop = true;

            let base_texture = new PIXI.BaseTexture(this.loader.resources[src].data);
            canvas.width = base_texture.realWidth;
            canvas.height = base_texture.realHeight;
            const my_app = new PIXI.Application({
                view: canvas,
                width: base_texture.width,
                height: base_texture.height,
                sharedLoader: true,
            });

            let puzzle_pieces: PuzzlePiece[][] = [];

            const tile_width = Math.floor(base_texture.realWidth / nx);
            const tile_height = Math.floor(base_texture.realHeight / ny);
            const dx = base_texture.realWidth - tile_width * nx;
            const dy = base_texture.realHeight - tile_height * ny;

            for (let ix = 0; ix < nx; ix++) {
                let x_pieces = [];
                for (let iy = 0; iy < ny; iy++) {
                    let top: Connector | null = null;
                    if (iy != 0) {
                        top = x_pieces[iy - 1].bottom?.createOpposite() ?? null;
                    }

                    let left: Connector | null = null;
                    if (ix != 0) {
                        left = puzzle_pieces[ix - 1][iy].right?.createOpposite() ?? null;
                    }

                    let bottom: Connector | null = null;
                    if (iy < ny - 1) {
                        bottom = Connector.Random();
                    }

                    let right: Connector | null = null;
                    if (ix < nx - 1) {
                        right = Connector.Random();
                    }

                    let puzzle_piece: PuzzlePiece = new PuzzlePiece(
                        ix * tile_width,
                        iy * tile_height,
                        tile_width - dx * (ix == (nx - 1) ? 1 : 0),
                        tile_height - dy * (iy == (ny - 1) ? 1 : 0),
                        base_texture,
                        1,
                        top,
                        bottom,
                        left,
                        right,
                    );

                    my_app.stage.addChild(puzzle_piece);
                    x_pieces.push(puzzle_piece);
                }
                puzzle_pieces.push(x_pieces);
            }
            console.log(puzzle_pieces);
        });

        this.loader.load();
    }
}

export const puzzleController: PuzzleController = new PuzzleController();
