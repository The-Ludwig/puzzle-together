import * as PIXI from "pixi.js";

let loaded_textures: string[] = [];

class PuzzlePiece extends PIXI.Container {
  top: Connector | null;
  bottom: Connector | null;
  left: Connector | null;
  right: Connector | null;

  base_texture: PIXI.BaseTexture;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    base_texture: PIXI.BaseTexture,
    con_percentage: number,
    top: Connector | null = null,
    bottom: Connector | null = null,
    left: Connector | null = null,
    right: Connector | null = null
  ) {
    super();
    this.x = x;
    this.y = y;
    this._width = width;
    this._height = height;
    this.base_texture = base_texture;

    this.top = top;
    this.bottom = bottom;
    this.left = left;
    this.right = right;

    if (top) {
      this._height += top.added_size;
      this.y -= top.added_size;
    }
    if (bottom) {
      this._height += bottom.added_size;
    }
    if (left) {
      this._width += left.added_size;
      this.x -= left.added_size;
    }
    if (right) {
      this._width += right.added_size;
    }

    let tile_texture = new PIXI.Texture(
      base_texture,
      new PIXI.Rectangle(x, y, this._width, this._height)
    );
    let tile_sprite = new PIXI.Sprite(tile_texture);

    let mask = new PIXI.Graphics();
    mask.lineStyle(0); // draw a circle, set the lineStyle to zero so the circle doesn't have an outline
    mask.beginFill(0xffffff, 1);
    mask.drawRect(this.innerX, this.innerY, this.innerWidth, this.innerHeight);
    let test = new PIXI.Graphics();

    mask.beginHole();
    if (top && top.negative) {
      mask.drawEllipse(
        this.midX + this.innerWidth * top.pos,
        this.innerY + top.out,
        top.orthosize,
        top.size
      );
    }
    if (bottom && bottom.negative) {
      mask.drawEllipse(
        this.midX + this.innerWidth * bottom.pos,
        this.innerY + this.innerHeight - bottom.out,
        bottom.orthosize,
        bottom.size
      );
    }
    if (left && left.negative) {
      test.beginFill(0xff0000, 1);
      test.drawEllipse(
        this.innerX + left.out,
        this.midY + this.innerHeight * left.pos,
        left.size,
        left.orthosize
      );
      test.endFill()
      mask.drawEllipse(
        this.innerX + left.out,
        this.midY + this.innerHeight * left.pos,
        left.size,
        left.orthosize
      );
    }
    if (right && right.negative) {
      mask.drawEllipse(
        this.innerX + this.innerWidth - right.out,
        this.midY + this.innerHeight * right.pos,
        right.size,
        right.orthosize
      );
    }
    mask.endHole();

    mask.beginFill(0xffffff, 1);
    if (top && !top.negative) {
      mask.drawEllipse(
        this.midX + this.innerWidth * top.pos,
        this.innerY - top.out,
        top.orthosize,
        top.size
      );
    }
    if (bottom && !bottom.negative) {
      mask.drawEllipse(
        this.midX + this.innerWidth * bottom.pos,
        this.innerY + this.innerHeight + bottom.out,
        bottom.orthosize,
        bottom.size
      );
    }
    if (left && !left.negative) {
      mask.drawEllipse(
        this.innerX - left.out,
        this.midY + this.innerHeight * left.pos,
        left.size,
        left.orthosize
      );
    }
    if (right && !right.negative) {
      mask.drawEllipse(
        this.innerX + this.innerWidth + right.out,
        this.midX + this.innerWidth * right.pos,
        right.size,
        right.orthosize
      );
    }
    mask.endFill();

    this.interactive = true;
    this.buttonMode = true;
    tile_sprite.mask = mask;
    this.addChild(tile_sprite);
    this.addChild(mask);
    this.addChild(test);

    this.on("pointerdown", onDragStart)
      .on("pointerup", onDragEnd)
      .on("pointerupoutside", onDragEnd)
      .on("pointermove", onDragMove);
  }

  get innerWidth() {
    return (
      this._width - (this.left?.added_size ?? 0) - (this.right?.added_size ?? 0)
    );
  }

  get innerHeight() {
    return (
      this._height -
      (this.top?.added_size ?? 0) -
      (this.bottom?.added_size ?? 0)
    );
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

class Connector {
  size: number;
  // size orthogonal to the size
  orthosize: number;
  pos: number;
  out: number;
  negative: boolean;
  sibling: Connector | null = null;

  constructor(
    size: number,
    orthosize: number,
    pos: number,
    out: number,
    negative: boolean
  ) {
    this.size = size;
    this.orthosize = size;
    this.pos = pos;
    this.out = out;
    this.negative = negative;
  }

  get added_size() {
    return this.negative ? 0 : this.size/2 + this.out;
  }

  static FromOpposite(other: Connector) {
    let created = new Connector(
      other.size,
      other.orthosize,
      other.pos,
      other.out,
      !other.negative
    );
    other.sibling = created;
    created.sibling = other;
    return created;
  }

  static Random() {
    return new Connector(30, 30, 0, 20, Math.random() < 0.5);
  }

  createOpposite() {
    return Connector.FromOpposite(this);
  }
}

export function reset() {
  for (let texture of loaded_textures) {
    PIXI.Texture.removeFromCache(texture);
  }
  loaded_textures = [];
  PIXI.Loader.shared.reset();
}

export function createPuzzle(
  canvas: HTMLCanvasElement,
  src: string,
  nx: number,
  ny: number,
  con_percentage: number
) {
  if (con_percentage > 0.5 || con_percentage < 0) {
    throw new Error(
      `con_percentage must be between 0 and 0.5, but ${con_percentage} was provided.`
    );
  }
  let loader = PIXI.Loader.shared;
  PIXI.settings.SORTABLE_CHILDREN = false;
  loader.add(src);
  loaded_textures.push(src);

  loader.onComplete.add(() => {
    loader.resources[src].data.loop = true;

    let base_texture = new PIXI.BaseTexture(loader.resources[src].data);
    canvas.width = base_texture.width;
    canvas.height = base_texture.height;
    const my_app = new PIXI.Application({
      view: canvas,
      width: base_texture.width,
      height: base_texture.height,
      sharedLoader: true,
    });

    let puzzle_pieces: PuzzlePiece[][] = [];

    const tile_width = Math.floor(base_texture.width / nx);
    const tile_height = Math.floor(base_texture.height / ny);
    const dx = base_texture.width - tile_width * nx;
    const dy = base_texture.height - tile_height * ny;

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
          tile_width + dx * (ix == nx - 1 ? 1 : 0),
          tile_height + dy * (iy == ny - 1 ? 1 : 0),
          base_texture,
          1,
          top,
          bottom,
          left,
          right
        );

        my_app.stage.addChild(puzzle_piece);
        x_pieces.push(puzzle_piece);
      }
      puzzle_pieces.push(x_pieces);
    }
    console.log(puzzle_pieces);
  });

  loader.load();
}

function onDragStart(this: any, event: any) {
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

function onDragEnd(this: any) {
  let piece = this;
  piece.alpha = 1;
  piece.dragging = false;
  // set the interaction data to null
  piece.data = null;
}

function onDragMove(this: any) {
  let piece = this;
  if (piece.dragging) {
    const newPosition = piece.data.getLocalPosition(piece.parent);
    piece.x = newPosition.x - piece.locPos.x;
    piece.y = newPosition.y - piece.locPos.y;
  }
}
