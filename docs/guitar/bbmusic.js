var BBMusic = {};
(function() {

    this.margin = { top: 20, right: 20, bottom: 20, left: 20 };
    this.string_spacing = 40;

    //a4 150 dpi svg base
    this.inner_width = 1240 - this.margin.left - this.margin.right;
    this.inner_height = 1753 - this.margin.top - this.margin.bottom;

    this.notes = [
        ['C', 'C'],
        ['C#', 'Db'],
        ['D', 'D'],
        ['D#', 'Eb'],
        ['E', 'E'],
        ['F', 'F'],
        ['F#', 'Gb'],
        ['G', 'G'],
        ['G#', 'Ab'],
        ['A', 'A'],
        ['A#', 'Bb'],
        ['B', 'B']
    ];

    this.strings = {
        'Standard': ['E2', 'A2', 'D3', 'G3', 'B3', 'E4']
    };

    this.all_notes = function() {
        var notes = [];
        for (var i = 0; i < 8; i++) {
            notes = notes.concat(BBMusic.notes.map(function(a) { return a[0] + "" + i }))
        }
        return notes;
    }

    this.string_notes = function(note0) {
        var notes = BBMusic.all_notes();
        notes.unshift("padding");
        var found = false;
        while (!found) {
            notes.shift();
            found = (notes[0] == note0 || notes.length == 0);
        }

        return notes;
    }

    /* staff */
    this.tabstaff = function(root_element) {
        if (root_element === undefined) {
            root_element = d3.select("body");
        }
        this.svg = root_element.append("svg").attr("class", "staff");

        Object.defineProperty(this, "width", {
            get: function() {
                // return 2;
                return this.svg.node().getBoundingClientRect().width;
            }
        });

        this.draw();
        return this;
    };

    // tabstaff parameters
    this.tabstaff.prototype.staff_spacing = 12;

    this.tabstaff.prototype.draw = function() {
        var staff_spacing = this.staff_spacing;
        var xwidth = Math.floor(this.width / this.staff_spacing * 2);
        this.staff_scale_x = d3.scaleOrdinal(
            Array.apply(null, { length: xwidth }).map(function(x, i) { return i * staff_spacing * 2 })
        ).domain(
            Array.apply(null, { length: xwidth }).map(function(x, i) { return i })
        )

        this.drawtab();
        this.drawstaff();

        // this.tab.append('g').attr("transform", "translate(120,200)")
        //     .call(d3.axisBottom(this.staff_scale_x).tickSize(-1000))

    }

    this.tabstaff.prototype.drawtab = function() {
        var staff_spacing = this.staff_spacing;
        var scale = this.staff_spacing / 10;

        this.tab = this.svg.append('g').attr("class", "tab")
            .attr("transform", "translate(0," + this.staff_spacing * 14 + ")");

        this.tab_scale_y =
            d3.scaleOrdinal(
                Array.apply(null, { length: 6 }).map(function(x, i) { return i * staff_spacing })
            ).domain([1, 2, 3, 4, 5, 6])

        this.tab_axis = this.tab.append('g')
            .attr('class', 'tab_lines')
            .call(d3.axisRight(this.tab_scale_y).tickSize(this.width))

        //clef
        var clef = this.tab.append("g").attr("class", "tab").attr("transform",
            "matrix(" + scale * 1.2 + ",0,0," + scale * 1.2 + "," + scale * 5 + "," + scale * 17 + ")");
        clef.append("text").text('T')
        clef.append("text").text('A').attr("x", -0.6).attr("y", 13)
        clef.append("text").text('B').attr("x", -0.6).attr("y", 26)

        this.tabnotes = this.tab.append("g").attr("class", "notes")
            .attr("transform", "translate(120,0)");

    }

    this.tabstaff.prototype.drawstaff = function() {
        var staff_spacing = this.staff_spacing;
        var scale = this.staff_spacing / 10;

        this.staff = this.svg.append('g').attr("class", "staff")
            .attr("transform", "translate(0," + this.staff_spacing * 5 + ")")

        this.staff_scale_y_vis =
            d3.scaleOrdinal(
                Array.apply(null, { length: 5 }).map(function(x, i) { return i * staff_spacing })
            ).domain([1, 2, 3, 4, 5])

        this.staff_axis_vis = this.staff.append('g')
            .attr('class', 'staff_lines')
            .call(d3.axisRight(this.staff_scale_y_vis).tickSize(this.width))

        var all_notes = []
            .concat.apply([], BBMusic.notes)
            .filter(function(item, pos, ary) {
                return !pos || item != ary[pos - 1];
            })

        var all_octaves = [];
        var all_scales = [];
        var current_note = all_notes[0].charAt(0);
        var current_pos = 0;
        for (var i = 0; i < 6; i++) {
            for (var j = 0; j < all_notes.length; j++) {
                // for (var note in all_notes) {
                if (current_note != all_notes[j].charAt(0)) {
                    current_pos++;
                    current_note = all_notes[j].charAt(0);
                }

                all_octaves.push(all_notes[j] + i);
                all_scales.push(current_pos * this.staff_spacing * -0.5);
            }

        }

        this.staff_scale_y_pos = d3.scaleOrdinal(all_scales).domain(all_octaves);

        //clef
        var clef = this.staff.append('g').attr('class', 'gclef').attr("transform",
            "matrix(" + scale + ",0,0," + scale + "," + scale * -29 + "," + scale * -14.5 + ")");
        clef.append('path')
            .attr('d', "M 39.708934,63.678683 C 39.317094,65.77065 41.499606,70.115061 45.890584,70.256984 C 51.19892,70.428558 54.590321,66.367906 53.010333,59.740875 L 45.086538,23.171517 C 44.143281,18.81826 44.851281,16.457097 45.354941,15.049945 C 46.698676,11.295749 50.055822,9.7473042 50.873134,10.949208 C 51.339763,11.635413 52.468042,14.844006 49.256275,20.590821 C 46.751378,25.072835 35.096985,30.950138 34.2417,41.468011 C 33.501282,50.614249 43.075689,57.369301 51.339266,54.71374 C 56.825686,52.950639 59.653965,44.62402 56.258057,40.328987 C 47.29624,28.994371 32.923702,46.341263 46.846564,51.0935 C 45.332604,49.90238 44.300646,48.980054 44.1085,47.852721 C 42.237755,36.876941 58.741182,39.774741 54.294493,50.18735 C 52.466001,54.469045 45.080341,55.297323 40.874269,51.477433 C 37.350853,48.277521 35.787387,42.113231 39.708327,37.687888 C 45.018831,31.694223 51.288782,26.31366 52.954064,18.108736 C 54.923313,8.4061491 48.493821,0.84188926 44.429027,10.385835 C 43.065093,13.588288 42.557016,16.803074 43.863006,22.963534 L 51.780549,60.311215 C 52.347386,62.985028 51.967911,66.664419 49.472374,68.355474 C 48.236187,69.193154 43.861784,69.769668 42.791575,67.770092");
        clef.append('path')
            .attr('d', 'M 48.24903 64.584198 A 3.439605 3.4987047 0 1 1  41.36982,64.584198 A 3.439605 3.4987047 0 1 1  48.24903 64.584198 z')
            .attr('transform', "matrix(-1.08512,-2.036848e-2,2.036848e-2,-1.08512,90.68868,135.0572)")

        //tempo
        var tempo = this.staff.append("g").attr("class", "tempo").attr("transform",
            "matrix(" + scale * 1.5 + ",0,0," + scale * 1.5 + "," + scale * 35 + ", " + scale * 18 + ")");
        tempo.append("text").text('4')
        tempo.append("text").text('4').attr("y", 13.5)

        this.staffnotes = this.staff.append("g").attr("class", "notes")
            .attr("transform", "translate(121," + (0.5+this.staff_spacing * 15.5) + ")");

    }

    // development assumes standard tuning
    this.tabstaff.prototype.add_note = function(position, string, fret, value) {
        if (!value) {
            value = 4
        }

        var note = this.add_tab_note(position, string, fret);
        this.add_staff_note(position, note, value);

    }

    this.tabstaff.prototype.add_tab_note = function(position, string, fret) {
        var tabnote = this.tabnotes.append("g");
        tabnote.append("circle")
            .attr("cx", this.staff_scale_x(position))
            .attr("cy", this.tab_scale_y(string))
            .attr("r", 6)
        tabnote.append("text").text(fret)
            .attr("transform", "translate(" + (this.staff_scale_x(position) - 4) + "," + (this.tab_scale_y(string) + 4) + ")")

        var string_base = BBMusic.strings.Standard.slice().reverse()[string - 1];
        var note = BBMusic.string_notes(string_base)[fret];
        return note;

    }

    this.tabstaff.prototype.add_staff_note = function(position, note, value) {
        this.staffnotes.append("circle").attr('class','note')
            .attr('r', this.staff_spacing * 0.45)
            .attr('cx', this.staff_scale_x(position))
            .attr('cy', this.staff_scale_y_pos(note));

    }

    this.tabstaff.prototype.show_song = function(song) {
        console.log(song);
    }

}).apply(BBMusic);


var flintstones = {
    "name": "Flintstones Theme",
    "artist": "",
    "composer": "Hoyt Curtin, Joseph Barbera and William Hanna",
    "tuning": "Standard",
    "tabx": [{
        "tempo": "4/4",
        "tab": [
            [
                "-------------6;8---------|-------------------------|",
                "-6;4-----p;8-----p;8-8;8-|-6;4-----p;8-6;8-p;8-----|",
                "-------------------------|---------------------8;8-|",
                "-----8;4-----------------|-----8;4-----------------|",
                "-------------------------|-------------------------|",
                "-------------------------|-------------------------|",
            ],
            [
                "------------------------|------",
                "-------------6;8--------|------",
                "-7;8-7;8-8;8--------5;4-|--7;1-",
                "----------------8;4-----|------",
                "------------------------|------",
                "------------------------|------",
            ]
        ]
    }]
};