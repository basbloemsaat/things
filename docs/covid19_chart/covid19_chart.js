var covid19_chart = {};

(function() {
    var obj = this;
    var s = {

        height: 0,
        width: 0,
    }

    this.data = {
        confirmed: {},
    }

    this.init = function() {
        Promise.all([
            d3.csv("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv"),
            d3.csv("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv"),
            d3.csv("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv"),
        ]).then(function(files) {
            obj.data.confirmed = files[0];
            obj.data.deaths = files[1];
            obj.data.recovered = files[2];

            obj.show();
        }).catch(function(err) {
            // handle error here
            console.log(err)
        })
    };

    this.show = function() {

        s.height = window.innerHeight - Math.ceil(d3.select('div#chart_options').node().offsetHeight) -10;
        s.width = window.innerWidth-10;
        console.log(s)

        let svg = this.svg = d3.select('svg#chart');
        svg.attr('height', s.height)

        let g = this.g = svg.append('g')
            .attr('class', 'root');


        this.redraw();
    };

    this.redraw = function() {

    }

}).apply(covid19_chart);
covid19_chart.init();



// Promise.all([
//     d3.csv("file1.csv"),
//     d3.csv("file2.csv"),
// ]).then(function(files) {
//     // files[0] will contain file1.csv
//     // files[1] will contain file2.csv
// }).catch(function(err) {
//     // handle error here
// })