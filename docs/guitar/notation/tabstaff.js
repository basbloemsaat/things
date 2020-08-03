(function() {

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

        this.init();
        return this;
    };

    this.tabstaff.prototype.init = function() {
        this.x_nr_of_notes = Math.floor((this.width - 50) / 24);
        this.scale_x = d3.scaleOrdinal(
            Array.apply(null, { length: this.x_nr_of_notes }).map(function(x, i) { return i * 25 })
        ).domain(
            Array.apply(null, { length: this.x_nr_of_notes }).map(function(x, i) { return i })
        )

        this.init_staff();
        this.init_tab();

        this.svg.append("line")
            .attr("class", "connect")
            .attr("x1", 0).attr("y1", 60)
            .attr("x2", 0).attr("y2", 226);


        this.svg.append('g')
            .attr("class", "scale_x")
            .attr("transform", "translate(50,265)")
            .call(d3.axisBottom(this.scale_x).tickSize(-1000));

        this.separators = this.svg.append('g')
            .attr("class", "separators")
            .attr("transform", "translate(50,60)")
    };

    this.tabstaff.prototype.init_staff = function() {
        this.staff = this.svg.append('g').attr("class", "staff")
            .attr("transform", "translate(0,60)")

        this.staff_scale_y_vis =
            d3.scaleOrdinal(
                Array.apply(null, { length: 5 }).map(function(x, i) { return i * 12 })
            ).domain([1, 2, 3, 4, 5])

        this.staff_axis_vis = this.staff.append('g')
            .attr('class', 'staff_lines')
            .call(d3.axisRight(this.staff_scale_y_vis).tickSize(this.width))
            .append("line")
            .attr("x1", this.width).attr("y1", 0)
            .attr("x2", this.width).attr("y2", 49);

        var all_notes = []
            .concat.apply([], BBMusic.notes)
            .filter(function(item, pos, ary) {
                return !pos || item != ary[pos - 1];
            }).reverse();

        var all_octaves = [];
        var all_scales = [];
        var current_note = all_notes[0].charAt(0);
        var current_pos = 0;
        for (var i = 6; i >= 0; i--) {
            for (var j = 0; j < all_notes.length; j++) {
                if (current_note != all_notes[j].charAt(0)) {
                    current_pos++;
                    current_note = all_notes[j].charAt(0);
                }
                all_octaves.push(all_notes[j] + i);
                all_scales.push(current_pos * 6);
            }
        }
        this.staff_scale_y_pos = d3.scaleOrdinal(all_scales).domain(all_octaves);

        //clef
        var clef = this.staff.append('g').attr('class', 'gclef')
            .attr("transform", "matrix( 1.3,0,0,1.3,-40,-23)");
        clef.append('path')
            .attr('d', "M 39.708934,63.678683 C 39.317094,65.77065 41.499606,70.115061 45.890584,70.256984 C 51.19892,70.428558 54.590321,66.367906 53.010333,59.740875 L 45.086538,23.171517 C 44.143281,18.81826 44.851281,16.457097 45.354941,15.049945 C 46.698676,11.295749 50.055822,9.7473042 50.873134,10.949208 C 51.339763,11.635413 52.468042,14.844006 49.256275,20.590821 C 46.751378,25.072835 35.096985,30.950138 34.2417,41.468011 C 33.501282,50.614249 43.075689,57.369301 51.339266,54.71374 C 56.825686,52.950639 59.653965,44.62402 56.258057,40.328987 C 47.29624,28.994371 32.923702,46.341263 46.846564,51.0935 C 45.332604,49.90238 44.300646,48.980054 44.1085,47.852721 C 42.237755,36.876941 58.741182,39.774741 54.294493,50.18735 C 52.466001,54.469045 45.080341,55.297323 40.874269,51.477433 C 37.350853,48.277521 35.787387,42.113231 39.708327,37.687888 C 45.018831,31.694223 51.288782,26.31366 52.954064,18.108736 C 54.923313,8.4061491 48.493821,0.84188926 44.429027,10.385835 C 43.065093,13.588288 42.557016,16.803074 43.863006,22.963534 L 51.780549,60.311215 C 52.347386,62.985028 51.967911,66.664419 49.472374,68.355474 C 48.236187,69.193154 43.861784,69.769668 42.791575,67.770092");
        clef.append('path')
            .attr('d', 'M 48.24903 64.584198 A 3.439605 3.4987047 0 1 1  41.36982,64.584198 A 3.439605 3.4987047 0 1 1  48.24903 64.584198 z')
            .attr('transform', "matrix(-1.08512,-2.036848e-2,2.036848e-2,-1.08512,90.68868,135.0572)")

        this.staffnotes = this.staff.append("g").attr("class", "notes")
            .attr("transform", "translate(50,-101.5)");

    };


    this.tabstaff.prototype.init_tab = function() {
        this.tab = this.svg.append('g').attr("class", "tab")
            .attr("transform", "translate(0,165)");

        this.tab_scale_y =
            d3.scaleOrdinal(
                Array.apply(null, { length: 6 }).map(function(x, i) { return i * 12 })
            ).domain([1, 2, 3, 4, 5, 6])

        this.tab_axis = this.tab.append('g')
            .attr('class', 'tab_lines')
            .call(d3.axisRight(this.tab_scale_y).tickSize(this.width))
            .append("line")
            .attr("x1", this.width).attr("y1", 0)
            .attr("x2", this.width).attr("y2", 61);

        //clef
        var clef = this.tab.append("g").attr("class", "tab")
            .attr("transform", "matrix( 1.5,0,0,1.5,4,20)");
        // .attr("transform", "matrix(" + scale * 1.2 + ",0,0," + scale * 1.2 + "," + scale * 5 + "," + scale * 17 + ")");
        clef.append("text").text('T')
        clef.append("text").text('A').attr("x", -0.6).attr("y", 13)
        clef.append("text").text('B').attr("x", -0.55).attr("y", 26)

        this.tabnotes = this.tab.append("g").attr("class", "notes")
            .attr("transform", "translate(50,0)");
    };

    this.tabstaff.prototype.add_note = function(position, string, fret, value) {
        if (!value) {
            value = 4
        }

        var note = this.add_tab_note(position, string, fret);
        this.add_staff_note(position, note, value);
    };

    this.tabstaff.prototype.add_tab_note = function(position, string, fret) {
        var tabnote = this.tabnotes.append("g");
        tabnote.append("circle")
            .attr("cx", this.scale_x(position))
            .attr("cy", this.tab_scale_y(string))
            .attr("r", 6)

        tabnote.append("text").text(fret)
            .attr("transform", "translate(" + (this.scale_x(position) - 4) + "," + (this.tab_scale_y(string) + 4) + ")")

        var string_base = BBMusic.strings.Standard.slice().reverse()[string - 1];
        var note = BBMusic.string_notes(string_base)[fret];
        return note;

    };

    this.tabstaff.prototype.add_staff_note = function(position, note, value) {
        var g = this.staffnotes
            .append('g')
            .attr('class', 'note')
        g.append("circle")
            .attr('r', 5)
            .attr('cx', this.scale_x(position))
            .attr('cy', this.staff_scale_y_pos(note))
            .attr('transform', '' +
                'scale(1,1) ' +
                'skewX(-30) ' +
                'translate(' + this.staff_scale_y_pos(note) * 0.575 + ',0) '
            )
            .classed('filled', value != 1 && value != 2);
        if (value >= 2) {
            g.append("line").attr("class", "stem")
                .attr("x1", this.scale_x(position) + 6)
                .attr("y1", this.staff_scale_y_pos(note) - 30)
                .attr("x2", this.scale_x(position) + 6)
                .attr("y2", this.staff_scale_y_pos(note) - 3)

        }

        var add_flag = function(g) {
            var flag = g.append("path").attr("class", "flag")
                .attr("d", "M 68.875,36.34375 L 68.875,49.90625 C 70.04682,51.12509 72.7812,52.71884 77.09375,54.6875 C 87.78118,58.01571 93.12493,61.31258 93.125,64.59375 C 93.12493,68.53132 91.70305,71.64069 88.84375,73.9375 L 90.9375,76.1875 L 91.21875,76.1875 C 96.93743,71.68756 99.81242,66.03132 99.8125,59.1875 C 99.81242,52.71884 94.18742,47.84384 82.9375,44.5625 C 74.82807,41.60947 70.14057,38.8751 68.875,36.34375 z ")
            return flag;
        }

        if (value >= 4) {
            add_flag(g)
                .attr('transform', '' +
                    'scale(0.25,0.3) ' +
                    'translate(' + ((this.scale_x(position) * 4.01) - 50) + ',' + ((this.staff_scale_y_pos(note) * 3.34) - 138) + ')'
                )
        }
        if (value >= 8) {
            add_flag(g)
                .attr('transform', '' +
                    'scale(0.25,0.3) ' +
                    'translate(' + ((this.scale_x(position) * 4.01) - 50) + ',' + ((this.staff_scale_y_pos(note) * 3.34) - 118) + ')'
                )
        }
        if (value >= 16) {
            add_flag(g)
                .attr('transform', '' +
                    'scale(0.25,0.3) ' +
                    'translate(' + ((this.scale_x(position) * 4.01) - 50) + ',' + ((this.staff_scale_y_pos(note) * 3.34) - 98) + ')'
                )
        }
    };

    this.tabstaff.prototype.add_separator = function(position, type) {
        // 5 types of separators:
        // - begin
        // - end
        // - begin repeat
        // - end repeat
        // - bar separator    
        console.log(position, type, this.scale_x(position));
        if (type == 'bar') {
            this.separators
                .append('g')
                .attr("class", "sep_bar")
                .append("line")
                .attr("x1", this.scale_x(position)).attr("y1", 0)
                .attr("x2", this.scale_x(position)).attr("y2", 166);
        } else if (type == 'rep_left' || type == 'rep_right') {
            var g = this.separators
                .append('g')
                .attr("class", "sep_repeat")

            if (type == 'rep_left') {
                g.attr("transform", "translate(" + this.scale_x(position) + ",0)")
            }
            else {
                g.attr("transform", "translate(" + this.scale_x(position) + ",0)  scale(-1,1)")
            }

            g.append("line")
                .attr("class", "fat")
                .attr("x1", -5.5).attr("y1", 0)
                .attr("x2", -5.5).attr("y2", 166);
            g.append("line")
                .attr("class", "thin")
                .attr("x1", 0).attr("y1", 0)
                .attr("x2", 0).attr("y2", 166);
            g.append('circle').attr("cx", 4.5).attr("cy", 18.5).attr("r", 2.5)
            g.append('circle').attr("cx", 4.5).attr("cy", 30.5).attr("r", 2.5)
            g.append('circle').attr("cx", 4.5).attr("cy", 125.5).attr("r", 2.5)
            g.append('circle').attr("cx", 4.5).attr("cy", 145.5).attr("r", 2.5)

        }
    };


    this.tabstaff.prototype.add_time_signature = function(position, signature) {
        var s = [4, 4];
        if (signature !== undefined) {
            var s = signature.split('/');
        }
        var time_signature = this.staff.append("g").attr("class", "time_signature").attr("transform",
            "matrix(1.8,0,0,1.8," + (this.scale_x(position) + 42) + ",22.4)");
        time_signature.append("text").text(s[0])
        time_signature.append("text").text(s[1]).attr("y", 13.5)
    };

}).apply(BBMusic);