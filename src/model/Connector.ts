import * as PIXI from 'pixi.js';

export interface Connector{
    get_opposite_side_connector():Connector;
    get added_size():number;
}

export function combine_connectors_to_graphics(top:Connector, right:Connector, bottom:Connector, left:Connector):PIXI.Graphics{
    throw new Error("Method not implemented.");
}