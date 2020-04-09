import 'https://d3js.org/d3.v5.js';
import { Chart } from './chart.js';

// resize svg to fit chart

let svg = d3.select('svg#chart');

svg.attr('height', window.innerHeight - Math.ceil(d3.select('div#chart_options').node().offsetHeight) -10)

var chart = new Chart(svg);