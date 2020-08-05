import 'https://d3js.org/d3.v5.js';


class BulletGraph {
    constructor(args = { height: 50, width: 200 }) {
        console.log(args);
        this.height = args['height'] !== undefined ? args['height'] : 50;
        this.width = args['width'] !== undefined ? args['width'] : 200;
    }
}

export { BulletGraph }