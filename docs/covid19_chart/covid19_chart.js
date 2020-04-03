var covid19_chart = {};

(function() {
    var g = this;
    var s = {
        height: 0,
        width: 0,
    }

    g.data = {
        confirmed: {},
    }

    g.init = function() {
        Promise.all([
            d3.csv("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv"),
            d3.csv("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv"),
            d3.csv("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv"),
        ]).then(function(files) {
            // files[0] will contain file1.csv
            // files[1] will contain file2.csv
            g.data.confirmed = files[0];
            g.data.deaths = files[1];
            g.data.recovered = files[2];

            g.show();
        }).catch(function(err) {
            // handle error here
            console.log(err)
        })
    };

    g.show = function() {

        s.height = window.innerHeight - d3.select('div#chart_options').node().offsetHeight;
        s.width = window.innerWidth;
        console.log(s)

        let svg = g.svg = d3.select('svg#chart');
        svg.attr('height', s.height)

    };

}).apply(covid19_chart);




// Promise.all([
//     d3.csv("file1.csv"),
//     d3.csv("file2.csv"),
// ]).then(function(files) {
//     // files[0] will contain file1.csv
//     // files[1] will contain file2.csv
// }).catch(function(err) {
//     // handle error here
// })