import 'https://d3js.org/d3.v5.js';

let config = {
    padding: 20,
    transition_duration: 250,
}

class Chart {
    constructor(svg, x = 'x', y = 'y') {
        this.svg = svg;
        this.curves = {};

        this._x = x;
        this._y = y;

        this._scale = {};
        this._axis = {};
        this._axisgroups = {};

        let g = this.g = svg.append('g')
        this.canvas = g.append('g').classed('canvas', true);
        this.legend = this.canvas.append('g').classed('legend', true).attr('transform', 'translate(' + config.padding + ',' + config.padding + ')');
        this._axisgroups.x = g.append('g').classed('xaxis', true);
        this._axisgroups.y = g.append('g').classed('yaxis', true);

        // default scales, used for sizing
        this._scale.x = d3.scaleTime()
            .domain([new Date(2019, 11, 31), new Date()])
            .range([0, 100])
        this._axis.x = d3.axisBottom(this._scale.x)
        this._axisgroups.x.call(this._axis.x);

        this._scale.y = d3.scaleLinear()
            .domain([40000, 1])
            .range([0, 100])
        this._axis.y = d3.axisLeft(this._scale.y)
        this._axisgroups.y.call(this._axis.y);

        this.reposistion_elements();

        this._legend = [];
    }

    // makes the chart fit the svg
    reposistion_elements() {
        let x_height = this._axisgroups.x.node().getBBox()['height'];
        let y_width = this._axisgroups.y.node().getBBox()['width'];

        let svg_height = this.svg.node().clientHeight;
        let svg_width = this.svg.node().clientWidth;

        let canvas_height = svg_height - x_height - (2 * config.padding);
        let canvas_width = svg_width - y_width - (2 * config.padding);


        this._axisgroups.x
            .attr('transform', 'translate(' + (y_width + config.padding) + ',' + (canvas_height + config.padding) + ')')
        this._axisgroups.y
            .attr('transform', 'translate(' + (y_width + config.padding) + ',' + config.padding + ')')

        this.canvas
            .attr('transform', 'translate(' + (y_width + config.padding) + ',' + config.padding + ')')

        this._scale.x.range([0, canvas_width]);
        this._axisgroups.x.transition().call(this._axis.x);

        this._scale.y.range([0, canvas_height]);
        this._axisgroups.y.transition().call(this._axis.y);

        this.draw_curves()
    }

    // makes the axis fit the data
    adjust(notransition = false) {
        let c = Object.keys(this.curves);
        const obj = this;
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

        let domains = {};
        domains['x'] = [cstats.minx, cstats.maxx]
        domains['y'] = [cstats.maxy, cstats.miny]

        let adjust_xy = function(xy) {
            let scale = obj._scale[xy];
            let domain = domains[xy];
            let axis = obj._axis[xy];

            if (scale.ticks()[0] && typeof(scale.ticks()[0]['toISOString']) === 'function') {
                //date 
                // scale.clamp(false);
            } else {
                if (scale['base'] !== undefined) {
                    // hack for 0 in log scales
                    scale.clamp(true);
                    if (domain[0] <= 0) {
                        domain[0] = 1;
                    }
                    if (domain[1] <= 0) {
                        domain[1] = 1;
                    }
                } else {
                    // scale.clamp(false);
                }
                axis.tickFormat(d3.format(".0s"))
            }

            scale.domain(domain);
            obj._axisgroups[xy]
                // .transition().duration(notransition ? 0 : config.transition_duration)
                .call(axis);

        }

        adjust_xy('x')
        adjust_xy('y')

        this.draw_curves(notransition);
        this.draw_legends();
    }

    draw_curves(notransition = false) {
        let c = Object.keys(this.curves);
        for (let i = 0; i < c.length; i++) {
            this.curves[c[i]].draw(this._scale.x, this._scale.y, notransition);
        }
    }

    draw_legends() {
        const l = this.legend.selectAll('g.legendrow').data(this._legend);
        l.exit().remove();

        var news = l.enter()
            .append('g').classed('legendrow', true);

        news.append('rect')
            .classed('legendcolor', true)
            .attr('width', 20)
            .attr('height', 15)
        news.append('text')
            .classed('legendtext', true)
            .attr('transform', 'translate(25,3)')
            .text('bla')

        l.merge(news).each(function(d, i) {
            d3.select(this).attr('transform', 'translate(0,' + (20 * i) + ')')
            d3.select(this).select('rect').attr('fill', d.color)
            d3.select(this).select('text').text(d.text)

        })

    }

    add_curve(name = '', data = [], id = '', options = {}) {
        let g = this.canvas.append('g').classed(name, true);
        let curve = this.curves[name] = new ChartCurve(name, g, data, id, this._x, this._y, options);
        curve.draw(this._scale.x, this._scale.y);
    }

    add_legend(text = '', color = '') {
        this._legend.push({ text: text, color: color });
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
        scale.domain(source.domain());
        scale.range(source.range());
        scale.clamp(true);

        return scale;
    }

    set fx(scale) {
        this._scale.x = this._prep_scale(scale, this._scale.x);
        this._axis.x = d3.axisBottom(this._scale.x)
        this.adjust();
    }

    set fy(scale) {
        this._scale.y = this._prep_scale(scale, this._scale.y);
        this._axis.y = d3.axisLeft(this._scale.y)
        this.adjust();
    }
}

class ChartCurve {
    constructor(name = '', g = undefined, data = [], id = '', x = '', y = '', options = {}) {
        this.name = name;
        this.data = data;
        this.id = id;
        this._x = x;
        this._y = y;
        this.g = g;

        this.color = '#000000';
        this.opacity = 1;

        if (options['color']) {
            this.color = options['color'];
        }

    }

    set x(value) {
        this._x = value;
    }

    set y(value) {
        this._y = value;
    }

    draw(fx, fy, notransition = false) {
        let curve = this;

        // line
        let l = this.g.select('path.curve')

        if (l.size() == 0) {
            l = this.g.append('path')
                .classed('curve', true)
                .style('stroke', this.color);
            notransition = true;
        }

        l.datum(this.data)
            .transition().duration(notransition ? 0 : config.transition_duration)
            .attr("d", d3.line()
                .x(function(d) { return fx(d[curve._x]) })
                .y(function(d) { return fy(d[curve._y]) })
                .curve(d3.curveBasis)
            )

        //points
        let a = this.g.selectAll('circle.curve_point')
            .data(this.data, function(d) { return d[curve.id] });

        a.exit().remove();

        let newa = a.enter().append('circle')
            .classed('curve_point', true)
            .style('stroke', this.color);

        a.merge(newa).transition().duration(notransition ? 0 : config.transition_duration)
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