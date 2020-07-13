import 'https://d3js.org/d3.v5.js';

let svg = d3.select('svg#chart');

const config = {
    padding: 10,
}

let scalewidth = 3;
let number_of_bins = 6;
let calcwidth = scalewidth / number_of_bins;
console.log(calcwidth)

// function to resize the svg based on the size of the windows and
// other elements.
const redraw = () => {
    svg.attr('height',
        window.innerHeight -
        Math.ceil(d3.select('div#header').node().offsetHeight) -
        Math.ceil(d3.select('div#footer').node().offsetHeight) -
        10)
};

redraw();

//pocje gebruikt BSI: scores lopen van 1 tot 4
let data = [
    {
        beginscore: 3.75,
        eindscore: 2.85,
        respons: 0.95,
        n: 100,
        best: 2.5,
        mean: 2.8,
        worst: 3.1,
    },
    {
        beginscore: 3.25,
        eindscore: 2.4,
        respons: 0.75,
        n: 299,
        best: 2.4,
        mean: 2.5,
        worst: 2.7,
    },
    {
        beginscore: 2.75,
        eindscore: 1.8,
        respons: 0.95,
        n: 434,
        best: 1.55,
        mean: 2.0,
        worst: 2.85,
    },
    {
        beginscore: 2.25,
        eindscore: 1.6,
        respons: 0.75,
        n: 375,
        best: 1.4,
        mean: 1.55,
        worst: 2.1,
    },
    {
        beginscore: 1.75,
        eindscore: 1.55,
        respons: 0.95,
        n: 100,
        best: 1.25,
        mean: 1.50,
        worst: 1.60,
    },
];

let totaal_aantal = data.reduce((accumulator, currentValue) => {
    if (typeof(accumulator) == 'object') {
        return accumulator['n'] + currentValue['n'];
    } else {
        return accumulator + currentValue['n'];
    }
})

let max_aantal = data.reduce((accumulator, currentValue) => {
    if (typeof(accumulator) == 'object') {
        return Math.max(accumulator['n'], currentValue['n']);
    } else {
        return Math.max(accumulator, currentValue['n']);
    }
})

// deel svg in: x-as, y-as en canvas
const xaxis = svg.append('g').attr('id', 'chart_x').classed('axis', true);
const x = d3.scaleLinear()
    .domain([4, 1])
    .range([0, 100]) // wordt aangepast door reposition
const axis_x = d3.axisBottom(x)
xaxis.call(axis_x);

const yaxis = svg.append('g').attr('id', 'chart_y').classed('axis', true);
const y = d3.scaleLinear()
    .domain([4, 1])
    .range([0, -100]) // wordt aangepast door reposition
const axis_y = d3.axisLeft(y)
yaxis.call(axis_y);

const canvas = svg.append('g').attr('id', 'chart_canvas');
let canvas_height = 1;

// function to position the chart pieces based on relative sizes of axis
const reposition_chart_pieces = () => {
    // kijk naar de hoogte van de xas en de breedte van de yas
    let x_height = xaxis.node().getBBox()['height'] -
        xaxis.select("g.tick").select('line').node().getBBox()['height']
    let y_width = yaxis.node().getBBox()['width'] -
        yaxis.select("g.tick").select('line').node().getBBox()['width']

    let svg_height = svg.node().clientHeight;
    let svg_width = svg.node().clientWidth;

    canvas_height = svg_height - x_height - (2 * config.padding);
    let canvas_width = svg_width - y_width - (2 * config.padding);
    xaxis.attr('transform', 'translate(' + (y_width + config.padding) + ',' + (canvas_height + config.padding) + ')')
    yaxis.attr('transform', 'translate(' + (y_width + config.padding) + ',' + (canvas_height + config.padding) + ')')

    canvas
        .attr('transform', 'translate(' + (y_width + config.padding) + ',' + config.padding + ')')

    x.range([0, canvas_width]);
    xaxis.call(axis_x);

    y.range([0, -canvas_height]);
    yaxis.call(axis_y.tickSize(-canvas_width));

}

reposition_chart_pieces();
let binwidth = x(0) - x(calcwidth) - 10;
let bw2 = binwidth / 2;
let scorebase = 1.4 * bw2/max_aantal;

const bullets = canvas.selectAll('g.bullet').data(data);
let newbullets = bullets.enter().append('g').classed('bullet', true)
    .attr('transform', function(d) {
        let r = 'translate(' + (x(d['beginscore']) - (binwidth / 2)) + ',' + canvas_height + ')';
        return r;
    });

newbullets.append('rect').classed('worst', true)
    .attr('width', binwidth)
    .attr('height', function(d) {
        return -y(d['worst']);
    })
    .attr('y', function(d) {
        return y(d['worst']);
    });

newbullets.append('rect').classed('mean', true)
    .attr('width', binwidth)
    .attr('height', function(d) {
        return -y(d['mean']) + y(d['worst']);
    })
    .attr('y', function(d) {
        return y(d['mean']);
    });

newbullets.append('rect').classed('best', true)
    .attr('width', binwidth)
    .attr('height', function(d) {
        return -y(d['best']) + y(d['mean']);
    })
    .attr('y', function(d) {
        return y(d['best']);
    });

newbullets.append('rect').classed('value', true)
    .attr('width', function(d) {
        return scorebase * d['n'];
    })
    .attr('x', function (d) {
        return bw2 - (scorebase * d['n']) /2;
    })
    .attr('height', function(d) {
        return -y(d['eindscore']);
    }).attr('y', function(d) {
        return y(d['eindscore']);
    })