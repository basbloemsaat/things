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

let scales = ['confirmed', 'deaths', 'delta_confirmed', 'delta_deaths', 'delta_recovered', 'recovered', ]

let xlog = d3.select('input#xaxis_log');
let ylog = d3.select('input#yaxis_log');
let xvar = d3.select('select#xaxis_var').node();
let yvar = d3.select('select#yaxis_var').node();
let daysvar = d3.select('input#days').node();
xlog.attr('disabled', true);

let input_state = {
    x: 'date',
    fx: 'Date',
    y: 'confirmed',
    fy: 'Linear',
    smooth_days: 7,
}

// with smooth days: put the data in x and y variables.
// TODO: only do for shown curves
var calc_xy_variables = (x, y, d) => {
    Object.keys(data.prepped).forEach((e) => {
        // if (e != "Netherlands") {
        //     return;
        // }
        let cdata = data.prepped[e];

        for (let i = 0; i < cdata.array.length; i++) {
            // console.log(i)
            let today_data = cdata.array[i];
            today_data['x'] = today_data[x];
            today_data['y'] = today_data[y];

            let rdate = new Date(today_data['date']);
            let countdays = 1;

            for (let j = 1; j < d; j++) {
                rdate.setDate(rdate.getDate() - 1);
                let id = (rdate.getMonth() + 1) + '/' + rdate.getDate() + '/' + (rdate.getYear() - 100);
                let earlierday = cdata['dates'][id];
                if (earlierday) {
                    today_data['x'] += earlierday[x];
                    today_data['y'] += earlierday[y];
                    countdays++;
                }
            }

            today_data['x'] /= countdays;
            today_data['y'] /= countdays;
        }
    })
}

// functie om de chartvariabelen en assen goed te zetten;
var set_chart_variables = () => {
    let smooth_days = daysvar.value;
    if (smooth_days && Number(smooth_days) > 0) {
        calc_xy_variables(xvar.value, yvar.value, smooth_days);
    }

    if (xvar.value != input_state.x || input_state.smooth_days != smooth_days) {
        input_state.x = xvar.value;
        let x = input_state.x;

        if (input_state.x == 'date') {
            input_state.fx = 'Date';
            chart.fx = d3.scaleTime()
            xlog.property('checked', false);
            xlog.property('disabled', true);
        } else {
            if (smooth_days && Number(smooth_days) > 0) {
                x = 'x';
            }
            input_state.fx = 'Change';
            xlog.property('disabled', false);
        }
        chart.x = x;
    }

    if (xlog.property('checked') && input_state.fx != 'Log' && input_state.fx != 'Date') {
        // set x logaritmic
        chart.fx = d3.scaleLog();
        input_state.fx = 'Log'
    } else if (!xlog.property('checked') && input_state.fx != 'Linear' && input_state.fx != 'Date') {
        // set x linear
        chart.fx = d3.scaleLinear();
        input_state.fx = 'Linear'
    }

    if (yvar.value != input_state.y) {
        input_state.y = yvar.value
        let y = input_state.y;
        if (smooth_days && Number(smooth_days) > 0) {
            y = 'y';
        }

        chart.y = y
    }
    if (ylog.property('checked') && input_state.fy != 'Log') {
        // set y logaritmic
        chart.fy = d3.scaleLog();
        input_state.fy = 'Log'
    } else if (!ylog.property('checked') && input_state.fy != 'Linear') {
        // set y linear
        chart.fy = d3.scaleLinear();
        input_state.fy = 'Linear'
    }

    input_state.smooth_days = smooth_days;
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

    data.population['US'] = data.population['United States']

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
    // canada and china are split. Let's lump 'em together
    let unique_keys = [...new Set(Object.keys(data.confirmed), Object.keys(data.deaths), Object.keys(data.recovered))];

    console.log(data);
    let add_countries = [];

    // the data has some countries split up (like Canada), and some partially (like The Netherlands). I only want to group the first.
    for (let i = 0; i < unique_keys.length; i++) {
        let key = unique_keys[i];

        let d = 
             (data.confirmed[key] || data.deaths[key] || data.recovered[key] || [])[0] || {};
        
        let country = d['Country/Region'];

    }


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
        let smooth = undefined;
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
                prepped.dates[cc[i][0]]['smooth_' + e] = n;
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


            scales.forEach((e) => {
                if (pm) {
                    current[e + '_pm'] = current[e] / pm;
                } else {
                    current[e + '_pm'] = 0;
                }
            })
        }



        data.prepped[key] = prepped;
    }

    if (daysvar.value && Number(daysvar.value) > 0) {
        calc_xy_variables(xvar.value, yvar.value, daysvar.value);
    }
}

let redraw = () => {
    svg.attr('height',
        window.innerHeight -
        Math.ceil(d3.select('div#chart_options').node().offsetHeight) -
        Math.ceil(d3.select('div#chart_footer').node().offsetHeight) -
        10)
    chart.reposistion_elements();
}

window.addEventListener("resize", redraw);
redraw();

let draw_chart = () => {
    chart.add_curve('Belgium', data.prepped['Belgium'].array, 'date', { color: "blue" });
    chart.add_legend('Belgium', 'blue');
    chart.add_curve('Germany', data.prepped['Germany'].array, 'date', { color: "yellow" });
    chart.add_legend('Germany', 'yellow');
    chart.add_curve('Italy', data.prepped['Italy'].array, 'date', { color: "red" });
    chart.add_legend('Italy', 'red');
    chart.add_curve('Netherlands', data.prepped['Netherlands'].array, 'date', { color: "orange" });
    chart.add_legend('Netherlands', 'orange');
    chart.add_curve('Spain', data.prepped['Spain'].array, 'date', { color: "black" });
    chart.add_legend('Spain', 'black');
    chart.add_curve('United Kingdom', data.prepped['United Kingdom'].array, 'date', { color: "green" });
    chart.add_legend('United Kingdom', 'green');
    chart.add_curve('US', data.prepped['US'].array, 'date', { color: "lightblue" });
    chart.add_legend('United States', 'lightblue');
    // chart.add_curve('Canada', data.prepped['Canada'].array, 'date', { color: "lightblue" });
    // chart.add_legend('United States', 'lightblue');


    // chart.reposistion_elements();
    chart.adjust(true);
    redraw();
}


let test = () => {
    // switch getoonde variabele
    // chart.y = 'deaths';
    // chart.fy(d3.scaleLog());
    // chart.fx(d3.scaleLog(), 'deaths');


    // let xy = d3.scaleLog().clamp(true);

    // console.log(xy['base']);

    // console.log(data.prepped);

}
window.setTimeout(function() { test() }, 500);

// // d3.select('button#test').on('click', test)