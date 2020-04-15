import 'https://d3js.org/d3.v5.js';

let config = {
    padding: 10,
}

class Chart {
    constructor(svg, x = 'x', y = 'y') {
        this.svg = svg;
        this.curves = {};

        this._x = x;
        this._y = y;

        let g = this.g = svg.append('g')
        this.canvas = g.append('g').classed('canvas', true);
        this.x_axis_g = g.append('g').classed('xaxis', true);
        this.y_axis_g = g.append('g').classed('yaxis', true);


        // default scales, used for sizing
        this._fx = d3.scaleTime()
            .domain([new Date(2019, 11, 31), new Date()])
            .range([0, 100])
        this.x_axis = d3.axisBottom(this._fx)
        this.x_axis_g.call(this.x_axis);

        this._fy = d3.scaleLinear()
            .domain([40000, 1])
            .range([0, 100])
        this.y_axis = d3.axisLeft(this._fy)
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

        this._fx.range([0, canvas_width]);
        this.x_axis_g.call(this.x_axis);

        this._fy.range([0, canvas_height]);
        this.y_axis_g.call(this.y_axis);

        console.log(this._fy['base']);

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

        let domain_y = [cstats.maxy, cstats.miny]

        if (this._fy['base'] !== undefined) {
            // hack for 0 in log scales
            this._fy.clamp(true);
            if (domain_y[1] <= 0) {
                domain_y[1] = 0.001;
            }

            //     console.log(d)

        }

        this._fx.domain([cstats.minx, cstats.maxx])
        this.x_axis_g.transition().call(this.x_axis);

        // this._fy.domain([cstats.maxy, cstats.miny])
        this._fy.domain(domain_y)
        this.y_axis_g.call(this.y_axis);

        this.draw_curves()
    }

    draw_curves() {
        let c = Object.keys(this.curves);
        for (let i = 0; i < c.length; i++) {
            this.curves[c[i]].draw(this._fx, this._fy);
        }
    }

    add_curve(name = '', data = [], id = '') {
        let g = this.canvas.append('g').classed(name, true);
        this.curves[name] = new ChartCurve(g, data, id, this._x, this._y);
        this.curves[name].draw(this._fx, this._fy);
    }

    set x(value) {
        this._x = value;
        for (let key in this.curves) {
            this.curves[key].x = value;
        }

        this.adjust();
    }

    set y(value) {
        this._y = value;
        for (let key in this.curves) {
            this.curves[key].y = value;
        }

        this.adjust();
    }

    _prep_scale(scale, source) {
        let d = source.domain();
        console.log(d);


        scale.domain(d);
        scale.clamp(true);
        scale.range(source.range());

        window.xyz = scale;

        return scale;
    }

    fx(scale, x) {
        this._fx = this._prep_scale(scale, this._fx);
        this.x_axis = d3.axisBottom(this._fx)
        this.adjust();
        if (x !== undefined) {
            this.x = x;
        } else {
            this.adjust();
        }
    }

    fy(scale, y) {
        this._fy = this._prep_scale(scale, this._fy);
        this.y_axis = d3.axisLeft(this._fy)
        if (y !== undefined) {
            this.y = y;
        } else {
            this.adjust();
        }
    }
}

class ChartCurve {
    constructor(g = undefined, data = [], id = '', x = '', y = '') {
        this.data = data;
        this.id = id;
        this._x = x;
        this._y = y;
        this.g = g;
    }

    set x(value) {
        this._x = value;
    }

    set y(value) {
        this._y = value;
    }

    draw(fx, fy) {
        let curve = this;

        // line
        let l = this.g.select('path.curve')
        let duration = 400;

        if (l.size() == 0) {
            l = this.g.append('path').classed('curve', true)
            duration = 0;
        }

        l.datum(this.data).transition().duration(duration).attr("d", d3.line()
            .x(function(d) { return fx(d[curve._x]) })
            .y(function(d) { return fy(d[curve._y]) })
        )

        //points
        let a = this.g.selectAll('circle.curve_point')
            .data(this.data, function(d) { return d[curve.id] });

        a.exit().remove();

        let newa = a.enter().append('circle')
            .classed('curve_point', true)

        a.merge(newa).transition().duration(duration)
            .attr('cx', function(d) { return fx(d[curve._x]) })
            .attr('cy', function(d) { return fy(d[curve._y]) })
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

            if (stats.minx === undefined || stats.minx > d[this._x]) {
                stats.minx = d[this._x];
            }
            if (stats.maxx === undefined || stats.maxx < d[this._x]) {
                stats.maxx = d[this._x];
            }
            if (stats.miny === undefined || stats.miny > d[this._y]) {
                stats.miny = d[this._y];
            }
            if (stats.maxy === undefined || stats.maxy < d[this._y]) {
                stats.maxy = d[this._y];
            }
        }

        return stats;
    }
}

export { Chart };