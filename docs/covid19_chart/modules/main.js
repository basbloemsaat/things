import 'https://d3js.org/d3.v5.js';
import { Chart } from './chart.js';

// resize svg to fit chart

let svg = d3.select('svg#chart');

var chart = new Chart(svg, 'date', 'confirmed');

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
    // d3.csv("https://raw.githubusercontent.com/basbloemsaat/datasets/master/demographics/Countries%20and%20areas%20ranked%20by%20population%20in%202019.csv"),
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
    let unique_keys = [...new Set(Object.keys(data.confirmed), Object.keys(data.deaths), Object.keys(data.recovered))];

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

        prepped['Country/Region'] = d.confirmed['Country/Region'] || d.deaths['Country/Region'] || d.recovered['Country/Region'];
        prepped['Province/State'] = d.confirmed['Province/State'] || d.deaths['Province/State'] || d.recovered['Province/State'];


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
                let n = Number(cc[i][1]);
                prepped.dates[cc[i][0]][e] = n;
                prepped.dates[cc[i][0]]['delta_' + e] = n - last_cc;
                last_cc = n;
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
    chart.add_curve('Spanje', data.prepped['Spain'].array, 'date');
    chart.add_curve('Nederland', data.prepped['Netherlands'].array, 'date', { color: "red" });

    chart.add_legend('Nederland', 'green');
    // chart.add_legend('Spanje', 'blue');

    chart.adjust(true);
}

let test = () => {
    // console.log('test')

    // switch getoonde variabele
    // chart.y = 'deaths';
    // chart.fy(d3.scaleLog());
    // chart.fx(d3.scaleLog(), 'deaths');


    // let xy = d3.scaleLog().clamp(true);

    // console.log(xy['base']);



}
window.setTimeout(function() { test() }, 2000);

d3.select('button#test').on('click', test)