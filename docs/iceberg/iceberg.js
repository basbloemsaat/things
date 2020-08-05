// d3 because we already use this
import 'https://d3js.org/d3.v5.js';


let svg = d3.select('svg#ib');
let g =
    svg.append('g')
// .attr('transform', 'translate(250,250)');

var width = 400,
    height = 600,
    caret = 150,
    water = 60,
    wave = 10,
    sin_i = 50

let kite = [
    [width / 2, 0],
    [width, caret],
    [width / 2, height],
    [0, caret],
];

let wave_x = d3.scaleLinear()
    .domain([0, sin_i])
    .range([0, width]);

let wave_y = d3.scaleLinear()
    .domain([-1, 1])
    .range([water - wave, water + wave]);

let sinvals = d3.range(0, sin_i).map(function(d, i) {
    return [wave_x(i), wave_y(Math.sin(i * 2 / Math.PI))]
});





g.append('path')
    .attr('d', "M" + kite.join('L') + "Z")
    .classed('kite', true);


// hoe vul ik dit met voronoi tesselation?
// voorbeeld volgen en dan aanpassen
// eerst vlak vullen dan vlak beperken tot ijsberg?



var sitesx = d3.range(50).map(function(d) {
    return [Math.random() * width, Math.random() * height];
})

sitesx = sitesx.concat(sinvals);
sitesx = sitesx.filter(function(point) {
    var x = point[0],
        y = point[1];

    var inside = false;
    for (var i = 0, j = kite.length - 1; i < kite.length; j = i++) {
        var xi = kite[i][0],
            yi = kite[i][1];
        var xj = kite[j][0],
            yj = kite[j][1];

        var intersect = ((yi > y) != (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
});

var sites = sitesx
    .concat([kite[0], kite[2]])



// console.log(sites);

// g.selectAll("circle")
//     .data(sites.slice(1))
//     .enter().append("circle")
//     .attr("transform", function(d) { return "translate(" + d + ")"; })
//     .attr("r", 1.5);


var voronoi = d3.voronoi()
    .extent([
        [0, 0],
        [width, height]
    ])

var path = g.selectAll("path");

// var polygon = g.append("g")
//     .attr("class", "polygons")
//     .selectAll("path")
//     .data(voronoi.polygons(sites))
//     .enter().append("path")
//     .call(redrawPolygon);

var triangles = g.append("g")
    .attr("class", "triangle")
    .selectAll("path")
    .data(voronoi.triangles(sites))
    .enter().append("path")
    .call(redrawPolygon)
    .attr('fill', function(d, i, b) {
        //todo: color according to position
        if (
            d[0] == kite[0] ||
            d[1] == kite[0] ||
            d[2] == kite[0]

        ) {
            return '#0f0'
        }

        if (
            d[0] == kite[2] ||
            d[1] == kite[2] ||
            d[2] == kite[2]

        ) {
            return '#000'
        }



        return '#f00';

    });


// var link = g.append("g")
//     .attr("class", "links")
//     .selectAll("line")
//     .data(voronoi.links(sites))
//     .enter().append("line")
//     .call(redrawLink);


var site = g.append("g")
    .attr("class", "sites")
    .selectAll("circle")
    .data(sinvals)
    .enter().append("circle")
    .attr("r", 2.5)
    .call(redrawSite);

function redrawPolygon(polygon) {
    polygon
        .attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; });
}

function redrawLink(link) {
    link
        .attr("x1", function(d) { return d.source[0]; })
        .attr("y1", function(d) { return d.source[1]; })
        .attr("x2", function(d) { return d.target[0]; })
        .attr("y2", function(d) { return d.target[1]; });
}

function redrawSite(site) {
    site
        .attr("cx", function(d) { return d[0]; })
        .attr("cy", function(d) { return d[1]; });
}

// function redraw() {
//     path = path
//         .data(voronoi(sites), polygon);

//     path.exit().remove();

//     path.enter().append("path")
//         .attr("class", function(d, i) { return "q" + (i % 9) + "-9"; })
//         .attr("d", polygon);

//     path.order();
// }

// function polygon(d) {
//     console.log(polygon);
//     return "M" + d.join("L") + "Z";
// }

// redraw();