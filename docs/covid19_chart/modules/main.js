import 'https://d3js.org/d3.v5.js';
import { Chart } from './chart.js';

// resize svg to fit chart

let svg = d3.select('svg#chart');

var chart = new Chart(svg);

let data = {
    confirmed: {},
}

Promise.all([
    d3.csv("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv"),
    d3.csv("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv"),
    d3.csv("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv"),
]).then(function(files) {
    data.confirmed = files[0];
    data.deaths = files[1];
    data.recovered = files[2];

    console.log(data);
}).catch(function(err) {
    // handle error here
    console.log(err)
})




let redraw = function() {
    svg.attr('height', window.innerHeight - Math.ceil(d3.select('div#chart_options').node().offsetHeight) - 10)
    chart.reposistion_elements();
}

window.addEventListener("resize", redraw);
redraw();
