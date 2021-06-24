import * as PIXI from "pixi.js";
import { PuzzlePiece } from "../model/PuzzlePiece";
import { PolygonConnector } from "../model/PolygonConnector";
import { Polygon } from "pixi.js";

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
                    let upper_left = new PIXI.Point(ix * tile_width, iy * tile_height);
                    let upper_right = new PIXI.Point(
                        ix * tile_width + tile_width - dx * (ix == nx - 1 ? 1 : 0),
                        iy * tile_height,
                    );
                    let lower_left = new PIXI.Point(
                        ix * tile_width,
                        iy * tile_height + tile_height - dy * (iy == ny - 1 ? 1 : 0),
                    );
                    let lower_right = new PIXI.Point(
                        ix * tile_width + tile_width - dx * (ix == nx - 1 ? 1 : 0),
                        iy * tile_height + tile_height - dy * (iy == ny - 1 ? 1 : 0),
                    );
                    let top: PolygonConnector;
                    if (iy != 0) {
                        top = x_pieces[iy - 1].bottom.get_opposite_side_connector();
                    }else{
                        top = PolygonConnector.get_from_to_polygon_connector(upper_left, upper_left);
                    }
                    
                    let right: PolygonConnector;
                    if (ix < nx - 1) {
                        right = PolygonConnector.get_random_polygon_connector(upper_right, lower_right, 30);
                    }else{
                        right = PolygonConnector.get_from_to_polygon_connector(upper_right, lower_right);
                    }
                    let bottom: PolygonConnector;
                    if (iy < ny - 1) {
                        bottom = PolygonConnector.get_random_polygon_connector(lower_right, lower_left, 30);
                    }else{
                        bottom = PolygonConnector.get_from_to_polygon_connector(lower_right, lower_left);
                    }
                    
                    let left: PolygonConnector;
                    if (ix != 0) {
                        left = puzzle_pieces[ix - 1][iy].right.get_opposite_side_connector();
                    }else{
                        left = PolygonConnector.get_from_to_polygon_connector(lower_left, upper_left);
                    }
                    

                    let puzzle_piece: PuzzlePiece = new PuzzlePiece(
                        ix * tile_width,
                        iy * tile_height,
                        tile_width - dx * (ix == nx - 1 ? 1 : 0),
                        tile_height - dy * (iy == ny - 1 ? 1 : 0),
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
