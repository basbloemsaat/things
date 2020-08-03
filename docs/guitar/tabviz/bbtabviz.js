var BBTabViz = {};
(function() {
    this.song = function(tab) {
        this.src_tab = tab;
        this.ticks = this.parse_tab(tab);

    };

    this.song.prototype.parse_tab = function(tab) {
        var lines = tab.split('\n');
        // console.log(lines);

        var groups = [];
        var current_group = [];
        for (var i = 0; i < lines.length; i++) {
            if ((lines[i].match(/--/g) || []).length > 2) {
                current_group.push(lines[i]);
            } else
            if (current_group.length > 4) {
                groups.push(current_group);
                current_group = [];
            }
        }

        // console.log(groups);
        var ticks = this.parse_tab_group(groups[0]);
        // console.log(ticks)

        return ticks;
    };

    this.song.prototype.parse_tab_group = function(tabgroup) {
        // console.log(tabgroup);
        var l = Math.max(
            tabgroup[0].length, tabgroup[1].length, tabgroup[2].length,
            tabgroup[3].length, tabgroup[4].length, tabgroup[5].length, );

        var tickcheck = function(tick) {
            var checklines = true;
            var digits = false; //tab digits
            var separator = true; //tab digits
            // var others = false; //tab other than digits or -
            var detect = '';
            for (var j = 0; j < 6; j++) {
                if (tick[j] === undefined) {
                    return { "msg": "uneven_length" };
                }
                checklines = checklines && (tick[j] == '-');
                separator = separator && (tick[j] == '|');
                var digit = tick[j].match(/[0-9]/);
                digits = digits || digit;
                var other = tick[j].match(/[^0-9\-]/);

                detect = detect + tick[j];
                if (!digit && !other) {
                    tick[j] = '';
                }
            }

            if (checklines) {
                return { "msg": "lines" };
            }

            if (separator) {
                // 5 types of separators:
                // - begin
                // - end
                // - begin repeat
                // - end repeat
                // - bar separator
                return { "msg": "separator" };
            }

            // console.log(detect);

            if (detect == '--**--') {
                return { "msg": "repeat" };
            }

            if (digits) {
                return { "msg": "digit" };
            }

            // console.log(checklines);
            return { "msg": "include" };
        };

        var ticks = [];
        var last = '';
        for (var i = 0; i < l; i++) {
            var tick = { "notes": [], "type": "note" };
            for (var j = 0; j < 6; j++) {
                tick.notes.push(tabgroup[j][i]);
            }
            var check = tickcheck(tick.notes);
            tick.checkmsg = check.msg;
            // console.log(check);
            if (check.msg == 'digit') {
                if (last == 'digit') {
                    for (var j = 0; j < 6; j++) {
                        ticks[ticks.length - 1].notes[j] = '' + ticks[ticks.length - 1].notes[j] + tick.notes[j]
                    }
                } else {
                    ticks.push(tick);
                }
            } else if (check.msg == 'separator') {
                tick.type = 'separator'
                if (last == 'repeat') {
                    tick.repeat = 'right'
                } else {}
                ticks.push(tick);
            } else if (check.msg == 'repeat') {
                if (last == 'separator') {
                    ticks[ticks.length - 1].repeat = 'left'
                }
            } else if (check.msg == 'include') {
                ticks.push(tick);
            }
            last = check.msg;
        }

        // console.log(ticks);
        return ticks;
    };

}).apply(BBTabViz);