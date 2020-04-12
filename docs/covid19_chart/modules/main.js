import 'https://d3js.org/d3.v5.js';
import { Chart } from './chart.js';

// resize svg to fit chart

let svg = d3.select('svg#chart');

var chart = new Chart(svg);

let data = {
    confirmed: {},
    deaths: {},
    recovered: {},
    prepped: {},
}

Promise.all([
    d3.csv("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv"),
    d3.csv("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv"),
    d3.csv("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv"),
]).then(function(files) {
    data.confirmed = d3.nest()
        .key(
            function(d) {
                return d['Country/Region'] + (d['Province/State'] ? '-' + d['Province/State'] : "")
            })
        .object(files[0]);
    data.deaths = d3.nest()
        .key(
            function(d) {
                return d['Country/Region'] + (d['Province/State'] ? '-' + d['Province/State'] : "")
            })
        .object(files[1]);
    data.recovered = d3.nest()
        .key(
            function(d) {
                return d['Country/Region'] + (d['Province/State'] ? '-' + d['Province/State'] : "")
            })
        .object(files[2]);

    console.log(data.prepped)

    prep_data();
    draw_chart();
}).catch(function(err) {
    // handle error here
    console.log(err)
})


let clone_data_obj = (obj) => {
    let data_clone = JSON.parse(JSON.stringify(obj));
    delete data_clone["Province/State"]
    delete data_clone["Country/Region"]
    delete data_clone["Lat"]
    delete data_clone["Long"]
    return Object.entries(data_clone)
}

let prep_data = () => {
    let unique_keys = [...new Set( Object.keys(data.confirmed), Object.keys(data.deaths), Object.keys(data.recovered))];

    for (let i = 0; i < unique_keys.length; i++) {
        let key = unique_keys[i];
        let prepped = {
            dates: {},
        };
        let d = {
            confirmed: (data.confirmed[key] || [])[0] || {},
            deaths: (data.deaths[key] || [])[0] || {},
            recovered: (data.recovered[key] || [])[0] || {},
        }

        prepped['Country/Region'] = d.confirmed['Country/Region'] || d.deaths['Country/Region'] || d.recovered['Country/Region']
        prepped['Province/State'] = d.confirmed['Province/State'] || d.deaths['Province/State'] || d.recovered['Province/State']


        let x = ['confirmed', 'deaths', 'recovered'];
        x.forEach((e) => {
            if (!d[e]) {
                return;
            }
            let cc = clone_data_obj(d[e]);
            let last_cc = 0;
            for (let i = 0; i < cc.length; i++) {
                if (!prepped.dates[cc[i][0]]) {
                    prepped.dates[cc[i][0]] = {
                        date: new Date(cc[i][0])
                    };
                }
                prepped.dates[cc[i][0]][e] = cc[i][1];
                prepped.dates[cc[i][0]]['delta_' + e] = cc[i][1] - last_cc;
                last_cc = cc[i][1];
            }
        })

        prepped['array'] = Object.values(prepped.dates);

        data.prepped[key] = prepped;
    }

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
    console.log(data.prepped['Netherlands']);

    points['Netherlands'] = chart.canvas.append('g').classed('Netherlands', true);
    let a = points['Netherlands'].selectAll('circle.dp')
        .data(data.prepped['Netherlands'].array, function(d) { return d['date'] });
    a.enter().append('circle')
        .classed('dp', true)
        .attr('cx', function(d) { return chart.x(d['date']) })
        .attr('cy', function(d) { return chart.y(d['confirmed']) })

    console.log(chart.y)

}