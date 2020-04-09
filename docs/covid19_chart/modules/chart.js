import 'https://d3js.org/d3.v5.js';

let config = {
    margin: 10,
}

class Chart {
    constructor(svg) {
        this.svg = svg;


        let g = this.g = svg.append('g')
        this.canvas = g.append('g').classed('canvas', true);
        this.x_axis_g = g.append('g').classed('xaxis', true);
        this.y_axis_g = g.append('g').classed('yaxis', true);


        // temp scales, used for sizing
        this.x = d3.scaleTime()
            .domain([new Date(2019, 11, 31), new Date()])
            .range([0, 100]);
        this.x_axis = d3.axisBottom(this.x)
        this.x_axis_g.call(this.x_axis);

        this.y = d3.scaleLinear()
            .domain(0, 10000)
            .range([0, 100]);
        this.y_axis = d3.axisLeft(this.y)
        this.y_axis_g.call(this.y_axis);

        this.reposistion_elements()
    }

    reposistion_elements() {
        let x_height = this.x_axis_g.node().getBBox()['height'];
        let y_width = this.y_axis_g.node().getBBox()['width'];

        let svg_height = this.svg.node().clientHeight;
        let svg_width = this.svg.node().clientWidth;

        let canvas_height = svg_height - x_height;
        let canvas_width = svg_width - y_width;


        this.x_axis_g
            .attr('transform', 'translate(' + y_width + ',' + canvas_height + ')')
        this.y_axis_g
            .attr('transform', 'translate(' + y_width + ',0)')

        this.canvas
            .attr('transform', 'translate(' + y_width + ',0)')

        this.x.range([0, canvas_width]);
        this.x_axis_g.call(this.x_axis);

        this.y.range([0, canvas_height]);
        this.y_axis_g.call(this.y_axis);

    }

}

export { Chart };