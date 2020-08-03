    this.fret_scale = d3.scaleOrdinal()
        .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
        .range(
            Array.apply(null, { length: 12 })
            .map(function(i, j) { return (0.5 + j) * BBMusic.inner_width / 12 }, Number)
        );

    this.string_scale = d3.scaleOrdinal()
        .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
        .range(
            Array.apply(null, { length: 12 })
            .map(function(d, i) { return BBMusic.string_spacing / 2 + i * BBMusic.string_spacing; }, Number)
        );

    this.scales = {
        'Minor Pentatonic': [0, 3, 5, 7, 10]
    };


    /* fretboard */
    this.fretboard = function(g) {
        this.g = g;
    };

    this.fretboard.prototype.add_note = function(fret, string, finger) {

        var note = this.g.append('g');
        note.append('circle')
            .attr("cx", function(d) { return BBMusic.fret_scale(fret - 1); })
            .attr("cy", function(d) { return BBMusic.string_scale(string - 1); })
            .attr("r", function(d) { return 15 });

        return note;
    };

    this.fretboard.prototype.draw = function() {
        g.selectAll('.string').data(BBMusic.strings['Standard']).enter()
            .append('line')
            .classed('string', true)
            .attr("x1", 0)
            .attr("y1", function(d, i) { return BBMusic.string_scale(i) })
            .attr("x2", BBMusic.inner_width)
            .attr("y2", function(d, i) { return BBMusic.string_scale(i) })

        g.selectAll('.fret_line').data(BBMusic.notes).enter()
            .append('line')
            .classed('fret_line', true)
            .attr("x1", function(d, i) { return BBMusic.fret_scale(0) + BBMusic.fret_scale(i) })
            .attr("y1", BBMusic.string_spacing / 2)
            .attr("x2", function(d, i) { return BBMusic.fret_scale(0) + BBMusic.fret_scale(i) })
            .attr("y2", BBMusic.string_spacing / 2 + 5 * BBMusic.string_spacing)

        g.append('line')
            .classed('fret_line', true)
            .classed('fret_first', true)
            .attr("x1", 0)
            .attr("y1", BBMusic.string_spacing / 2)
            .attr("x2", 0)
            .attr("y2", BBMusic.string_spacing / 2 + 5 * BBMusic.string_spacing)
    }

    this.draw_fretboard = function(g) {
        fretboard = new BBMusic.fretboard(g);
        fretboard.draw();

        return fretboard;
    }


    this.tabx = function(input) {

        // console.log(input)

        var tabs = this.tabs = [];
        for (var i = 0; i < input.tabx.length; i++) {
            tabs.push(input.tabx[i].tabs)
        }

        // console.log(tabs);

        return this;
    }
