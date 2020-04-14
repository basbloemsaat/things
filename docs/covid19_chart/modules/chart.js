import 'https://d3js.org/d3.v5.js';

let config = {
    padding: 10,
}

class Chart {
    constructor(svg) {
        this.svg = svg;
        this.curves = {};


        let g = this.g = svg.append('g')
        this.canvas = g.append('g').classed('canvas', true);
        this.x_axis_g = g.append('g').classed('xaxis', true);
        this.y_axis_g = g.append('g').classed('yaxis', true);


        // default scales, used for sizing
        this.x = d3.scaleTime()
            .domain([new Date(2019, 11, 31), new Date()])
            .range([0, 100])
        this.x_axis = d3.axisBottom(this.x)
        this.x_axis_g.call(this.x_axis);

        this.y = d3.scaleLinear()
            .domain([40000, 1])
            .range([0, 100])
        this.y_axis = d3.axisLeft(this.y)
        this.y_axis_g.call(this.y_axis);

        this.reposistion_elements();
    }

    reposistion_elements() {
        let x_height = this.x_axis_g.node().getBBox()['height'];
        let y_width = this.y_axis_g.node().getBBox()['width'];

        let svg_height = this.svg.node().clientHeight;
        let svg_width = this.svg.node().clientWidth;

        let canvas_height = svg_height - x_height - (2 * config.padding);
        let canvas_width = svg_width - y_width - (2 * config.padding);


        this.x_axis_g
            .attr('transform', 'translate(' + (y_width + config.padding) + ',' + (canvas_height + config.padding) + ')')
        this.y_axis_g
            .attr('transform', 'translate(' + (y_width + config.padding) + ',' + config.padding + ')')

        this.canvas
            .attr('transform', 'translate(' + (y_width + config.padding) + ',' + config.padding + ')')

        this.x.range([0, canvas_width]);
        this.x_axis_g.call(this.x_axis);

        this.y.range([0, canvas_height]);
        this.y_axis_g.call(this.y_axis);

    }

    add_curve(name = '', data = [], id = '', x = '', y = '') {
        let g = this.canvas.append('g').classed(name, true);
        this.curves[name] = new ChartCurve(g, data, id, x, y);
        this.curves[name].draw(this.x, this.y);
    }
}

class ChartCurve {
    constructor(g = undefined, data = [], id = '', x = '', y = '', ) {
        this.data = data;
        this.id = id;
        this.x = x;
        this.y = y;
        this.g = g;
    }

    draw(fx, fy) {
        let x = this.x;
        let y = this.y;
        let id = this.id;
        let a = this.g.selectAll('circle.dp')
            .data(this.data, function(d) { return d[id] });

        a.enter().append('circle')
            .classed('dp', true)
            .attr('cx', function(d) { return fx(d['date']) })
            .attr('cy', function(d) { return fy(d['confirmed']) })
    }
}

export { Chart };