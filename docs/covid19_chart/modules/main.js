import 'https://d3js.org/d3.v5.js';
import { Chart } from './chart.js';

// resize svg to fit chart

let svg = d3.select('svg#chart');

console.log(d3)

var chart = new Chart(svg);

let data = {
    confirmed: {},
}

Promise.all([
    d3.csv("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv"),
    d3.csv("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv"),
    d3.csv("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv"),
]).then(function(files) {
    // console.log(files[0]);
    data.confirmed = d3.nest()
        .key(function(d) { return d['Country/Region'] })
        .key(function(d) { return d['Province/State'] })
        .object(files[0]);
    data.deaths = d3.nest()
        .key(function(d) { return d['Country/Region'] })
        .key(function(d) { return d['Province/State'] })
        .object(files[1]);
    data.recovered = d3.nest()
        .key(function(d) { return d['Country/Region'] })
        .key(function(d) { return d['Province/State'] })
        .object(files[2]);

    draw_chart();
}).catch(function(err) {
    // handle error here
    console.log(err)
})

let prep_data = (data) => {
    
}

let redraw = () => {
    svg.attr('height', window.innerHeight - Math.ceil(d3.select('div#chart_options').node().offsetHeight) - 10)
    chart.reposistion_elements();
}

let points = {};
let curves = {};

window.addEventListener("resize", redraw);
redraw();

let draw_chart = () => {
    console.log(chart);

    points['Netherlands'] = chart.canvas.append('g').classed('Netherlands', true);
    let data_clone = JSON.parse(JSON.stringify(data.confirmed['Netherlands'][''][0]));
    delete data_clone["Province/State"]
    delete data_clone["Country/Region"]
    delete data_clone["Lat"]
    delete data_clone["Long"]
    let adata = Object.entries(data_clone)

    let last = 0;
    adata = adata.map(e => {
        // console.log(e); 

        e[0] = new Date(e[0])

        e[2] = e[1] - last;
        last = e[1];
        return e;
    })
    console.log(adata);

    let a = points['Netherlands'].selectAll('circle.dp')
        .data(adata, function(d) { return d[0] });
    a.enter().append('circle')
        .classed('dp', true)
        .attr('cx', function(d) {return chart.x(d[0])})
        .attr('cy', function(d) {return chart.y(d[1])})

}