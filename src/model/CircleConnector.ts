import { Connector } from "./Connector";

export class CircleConnector implements Connector {

    sibling: CircleConnector | null = null;

    /**
     * 
     * @param size Radius of the Circle drawn as hole or pop out
     * @param orthosize ???
     * @param line_displacement Relative Position of the circle along the Connected line (between -1 and 1)
     * @param orthogonal_displacement Relative amount of poping out the connected line (between -1 and 1)
     * @param negative False if the Connector pops out True if it is a Hole
     */
    constructor(
        public size: number,
        public orthosize: number,
        public line_displacement: number,
        public orthogonal_displacement: number,
        public negative: boolean,
    ) {
        this.orthosize = size;
    }
    get_opposite_side_connector(): Connector {
        return CircleConnector.FromOpposite(this);
    }

    get added_size() {
        return this.negative ? 0 : (this.size / 2) + this.absolute_orthogonal_displacement;
    }

    static FromOpposite(other: CircleConnector) {
        let created = new CircleConnector(other.size, other.orthosize, other.line_displacement, other.orthogonal_displacement, !other.negative);
        other.sibling = created;
        created.sibling = other;
        return created;
    }

    static Random() {
        return new CircleConnector(20, 0, 0, 0.5, Math.random() < 0.5);
    }

    get absolute_orthogonal_displacement(){
        return this.size * this.orthogonal_displacement;
    }
    createOpposite() {
        return CircleConnector.FromOpposite(this);
    }
}