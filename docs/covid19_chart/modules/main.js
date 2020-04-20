import 'https://d3js.org/d3.v5.js';
import { Chart } from './chart.js';

// resize svg to fit chart

let svg = d3.select('svg#chart');

var chart = new Chart(svg, 'date', 'confirmed');

let data = {
    confirmed: {},
    deaths: {},
    recovered: {},
    population: {},
    prepped: {},
}

let xlog = d3.select('input#xaxis_log');
let ylog = d3.select('input#yaxis_log');
let xvar = d3.select('select#xaxis_var').node();
let yvar = d3.select('select#yaxis_var').node();
xlog.attr('disabled', true);

let input_state = {
    x: 'date',
    fx: 'Date',
    y: 'confirmed',
    fy: 'Linear',
}

// functie om de chartvariabelen en assen goed te zetten;
var set_chart_variables = () => {
    if (xvar.value != input_state.x) {
        input_state.x = xvar.value;
        chart.x = input_state.x;

        if (input_state.x == 'date') {
            input_state.fx = 'Date';
            chart.fx(d3.scaleTime())
            xlog.property('checked', false);
            xlog.property('disabled', true);
        } else {
            input_state.fx = 'Change';
            xlog.property('disabled', false);
        }
    }

    if (xlog.property('checked') && input_state.fx != 'Log' && input_state.fx != 'Date') {
        // set x logaritmic
        chart.fx(d3.scaleLog());
        input_state.fx = 'Log'
    } else if (!xlog.property('checked') && input_state.fx != 'Linear' && input_state.fx != 'Date') {
        // set x linear
        console.log(' x lin ');

        chart.fx(d3.scaleLinear());
        input_state.fx = 'Linear'
    }

    if (yvar.value != input_state.y) {
        input_state.y = yvar.value
        chart.y = input_state.y
    }
    if (ylog.property('checked') && input_state.fy != 'Log') {
        // set y logaritmic
        chart.fy(d3.scaleLog());
        input_state.fy = 'Log'
    } else if (!ylog.property('checked') && input_state.fy != 'Linear') {
        // set y linear
        chart.fy(d3.scaleLinear());
        input_state.fy = 'Linear'
    }
}

set_chart_variables()


d3.selectAll('input').on('change', set_chart_variables)
d3.selectAll('select').on('change', set_chart_variables)


Promise.all([
    d3.csv("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv"),
    d3.csv("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv"),
    d3.csv("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv"),
    d3.csv("https://raw.githubusercontent.com/basbloemsaat/datasets/master/demographics/Countries%20and%20areas%20ranked%20by%20population%20in%202019.csv"),
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


    data.population = d3.nest()
        .key(
            function(d) {
                return d['Country (or dependent territory)']
            })
        .object(files[3]);
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
        let pop = data['population'][key] ? data['population'][key][0] : {};

        let prepped = {
            dates: {},
            population: pop,
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

        // another loop, not very efficient
        for (let i = 0; i < prepped['array'].length; i++) {
            let current = prepped['array'][i];
            // console.log(current);
            let pm = pop['Population'] / 1000000;
            // console.log(pm);

            let x = ['confirmed', 'deaths', 'delta_confirmed', 'delta_deaths', 'delta_recovered', 'recovered', ]
            x.forEach((e) => {
                if (pm) {
                    current[e + '_pm'] = current[e] / pm;
                } else {
                    current[e + '_pm'] = 0;
                }
            })
        }



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

    // chart.add_legend('Nederland', 'green');
    // chart.add_legend('Spanje', 'blue');

    chart.adjust(true);
}

let test = () => {
    // switch getoonde variabele
    // chart.y = 'deaths';
    // chart.fy(d3.scaleLog());
    // chart.fx(d3.scaleLog(), 'deaths');


    // let xy = d3.scaleLog().clamp(true);

    // console.log(xy['base']);

    // console.log(data.prepped['Netherlands']);

}
window.setTimeout(function() { test() }, 2000);

d3.select('button#test').on('click', test)