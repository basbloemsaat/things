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

    // makes the chart fit the svg
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

        this.draw_curves()
    }

    // makes the axis fit the data
    adjust() {
        let c = Object.keys(this.curves);
        if (!c.length) {
            return;
        }
        let cstats = {
            minx: undefined,
            maxx: undefined,
            miny: undefined,
            maxy: undefined,
        }
        for (let i = 0; i < c.length; i++) {
            let stats = this.curves[c[i]].stats;

            if (cstats.minx === undefined || cstats.minx > stats.minx) {
                cstats.minx = stats.minx;
            }
            if (cstats.maxx === undefined || cstats.maxx < stats.maxx) {
                cstats.maxx = stats.maxx;
            }
            if (cstats.miny === undefined || cstats.miny > stats.miny) {
                cstats.miny = stats.miny;
            }
            if (cstats.maxy === undefined || cstats.maxy < stats.maxy) {
                cstats.maxy = stats.maxy;
            }
        }

        this.x.domain([cstats.minx, cstats.maxx])
        this.x_axis_g.call(this.x_axis);

        this.y.domain([cstats.maxy, cstats.miny])
        this.y_axis_g.call(this.y_axis);

        this.draw_curves()
    }

    draw_curves() {
        let c = Object.keys(this.curves);
        for (let i = 0; i < c.length; i++) {
            this.curves[c[i]].draw(this.x, this.y);
        }
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
        let curve = this;

        // line
        let l = this.g.select('path.curve')

        if (l.size() == 0) {
            l = this.g.append('path').classed('curve', true)
        }

        l.datum(this.data).attr("d", d3.line()
            .x(function(d) { return fx(d[curve.x]) })
            .y(function(d) { return fy(d[curve.y]) })
        )




        //points
        let a = this.g.selectAll('circle.curve_point')
            .data(this.data, function(d) { return d[curve.id] });

        a.exit().remove();

        let newa = a.enter().append('circle')
            .classed('curve_point', true)

        a.merge(newa)
            .attr('cx', function(d) { return fx(d[curve.x]) })
            .attr('cy', function(d) { return fy(d[curve.y]) })
    }

    // todo: get stats based on data and settings
    get stats() {
        let stats = {
            minx: undefined,
            maxx: undefined,
            miny: undefined,
            maxy: undefined,
        };

        for (let i = 0; i < this.data.length; i++) {
            let d = this.data[i];

            if (stats.minx === undefined || stats.minx > d[this.x]) {
                stats.minx = d[this.x];
            }
            if (stats.maxx === undefined || stats.maxx < d[this.x]) {
                stats.maxx = d[this.x];
            }
            if (stats.miny === undefined || stats.miny > d[this.y]) {
                stats.miny = d[this.y];
            }
            if (stats.maxy === undefined || stats.maxy < d[this.y]) {
                stats.maxy = d[this.y];
            }


        }

        return stats;
    }
}

export { Chart };