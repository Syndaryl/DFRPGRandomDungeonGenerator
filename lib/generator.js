// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// generator.js
//
// written by drow <drow@bin.sh>
// http://creativecommons.org/licenses/by-nc/3.0/


/**
 * Constructor for the weighted_table_entry type.
 * type properties are weight and value.
 * @param {number} entryweight
 * @param {any} entryvalue
 */
function weighted_table_entry(entryweight, entryvalue) {
    this.Weight = entryweight;
    this.Description = entryvalue;
}

/**
 * Expands a given text string
 * @param {string} string_with_wildcards
 */
function generate_text(string_with_wildcards) {
    var list_of_choices;
    if (list_of_choices = gen_data[string_with_wildcards])
        if (list_of_choices = select_from(list_of_choices)) {
            var c = new_trace();
            return expand_tokens(list_of_choices, c);
        }
    return "";
}

/**
 * Selects a random element from an array, or a table of key-range:value pairs, or from an array of objects with Weight properties.
 * @param {any} array_table
 */
function select_from(array_table) {
    return array_table.constructor == Array ?
        // (array_table[0].hasOwnProperty('Weight') ? select_from_weighted_table(array_table) : select_from_array(array_table))
        select_from_array(array_table)
        : select_from_table(array_table);
}

/**
 * Picks a random item from the array
 * @param {Array} arr
 */
function select_from_array(arr) {
    return arr[random(arr.length)]
}

/**
 * Pick a random item from the table.
 * @param {any} tbl
 */
function select_from_table(tbl) {
    var c;
    if (c = scale_table(tbl)) {
        c = random(c) + 1;
        var b;
        for (b in tbl) {
            var d = key_range(b);
            if (c >= d[0] && c <= d[1]) return tbl[b]
        }
    }
    return ""
}

/**
 * Pick a random item from a weighted table.
 * Weighted tables are an Array of weighted_table_entry objects (or any of their subclass)
 * @param {weighted_table_entry[]} table
 * @returns {weighted_table_entry}
 */
function select_from_weighted_table(table) {
    if (table.constructor != Array) {
        console.log("table is not an Array");
        console.trace();
        return {};
    }
    if (table.length == 0) {
        console.log("table is empty");
        console.trace();
        return {};
    }
    if (!table[0].hasOwnProperty('Weight')) {
        console.log("table is not an Array of stuff with Weights");
        console.trace();
        return {};
    }

    var swept_table = table.map(function (entry) {
        entry.Weight = parseInt(entry.Weight + ' ');
        return entry;
    }).filter(function (entry) {
        return entry.Weight > 0;
    });

    if (swept_table.length == 0) {
        console.log("table was empty after sweeping !?");
        console.trace();
        return {};
    }

    var sumOfWeights = swept_table.reduce(function (memo, entry) {
        var wt = parseInt(entry.Weight + ' ');
        return memo + wt;
    }, 0);
    var selectedWeights = {};
    var randomNum = random(sumOfWeights) + 1;
    // console.log('Table has '+ sumOfWeights + ' entries and we are looking for #' + randomNum);
    for (var entry in swept_table) {
        if (randomNum <= swept_table[entry].Weight) {
            return swept_table[entry];
        }
        randomNum = randomNum - swept_table[entry].Weight;
    }
    console.log("table ran out of entries !?");
    console.trace();
    return swept_table[swept_table.length - 1];
}

function scale_table(a) {
    var c = 0,
        rangeString;
    for (rangeString in a) {
        var range = key_range(rangeString);
        if (range[1] > c) c = range[1]
    }
    return c
}

/**
 * returns the range of indexes represented by a string as a two element Array of number; "00" is treated as 100. I.e. a range of "01-16" turns into [1,16], a range of "68-00" turns into [68,100];
 * @param {string} pattern
 * @returns {number[]}
 */
function key_range(regexpTarget) {
    var regResults;
    return (regResults = /(\d+)-00/.exec(regexpTarget)) ? [parseInt(regResults[1], 10), 100] : (regResults = /(\d+)-(\d+)/.exec(regexpTarget)) ? [parseInt(regResults[1], 10), parseInt(regResults[2], 10)] : regexpTarget == "00" ? [100, 100] : [parseInt(regexpTarget, 10), parseInt(regexpTarget, 10)]
}

/**
 * Object constructor for a "trace" object.
 */
function new_trace() {
    return {
        exclude: {},
        "var": {}
    }
}

function local_trace(a) {
    var c = Object.clone(a);
    c["var"] = Object.clone(a["var"]);
    return c
}

/**
 * Recursively goes through and expands tokens to new 
 * @param {string[]} list
 * @param {any} trace
 */

function expand_tokens(list, trace) {
    for (var b = /\${ ([^{}]+) }/, regxpResult; regxpResult = b.exec(list);) {
        var token = regxpResult[1];
        var e;
        list = (e = expand_token(token, trace)) ? list.replace("${ " + token + " }", e) : list.replace("{" + token + "}", token)
    }
    return list
}

/**
 *
 * @param {any} token
 * @param {any} trace
 */
function expand_token(token, trace) {
    var b, d;
    if (b = /^\d*d\d+/.exec(token)) return roll_dice(b[1]);
    else if (b = /^calc (.+)/.exec(token)) return roll_dice(b[1]);
    else if (b = /^(\d+) x (.+)/.exec(token)) return expand_x(b[1], b[2], trace);
    else if (b = /^\[ (.+) \]/.exec(token)) {
        d = b[1].split(/,\s*/);
        return expand_tokens(select_from_array(d), trace)
    } else if (d = gen_data[token]) return expand_tokens(select_from(d), trace);
    else if (b = /^alt (.+) def (.+)/.exec(token)) return (d = gen_data[b[1]]) ? expand_tokens(select_from(d), trace) : (d = gen_data[b[2]]) ? expand_tokens(select_from(d),
        trace) : b[2];
    else if (b = /^unique (.+)/.exec(token)) return expand_unique(b[1], trace);
    else if (b = /^local (.+)/.exec(token)) {
        token = local_trace(trace);
        return expand_token(b[1], token)
    } else if (b = /^new (.+)/.exec(token)) {
        token = new_trace();
        return expand_token(b[1], token)
    } else if (b = /^set (\w+) = (.+?) in (.+)/.exec(token)) {
        trace["var"][b[1]] = b[2];
        return expand_token(b[3], trace)
    } else if (b = /^set (\w+) = (.+)/.exec(token)) return set_var(b[1], b[2], trace);
    else if (b = /^get (\w+) def (.+)/.exec(token)) return trace["var"][b[1]] || b[2];
    else if (b = /^get (\w+) fix (.+)/.exec(token)) return trace["var"][b[1]] ||
        set_var(b[1], b[2], trace);
    else if (b = /^get (\w+)/.exec(token)) return trace["var"][b[1]];
    else if (b = /^shift (\w+) = (.+)/.exec(token)) {
        trace["var"][b[1]] = b[2].split(/,\s*/);
        return trace["var"][b[1]].shift()
    } else if (b = /^shift (\w+)/.exec(token)) return trace["var"][b[1]].shift();
    else if (b = /^an (.+)/.exec(token)) return aoran(expand_token(b[1], trace));
    else if (b = /^An (.+)/.exec(token)) return ucfirst(aoran(expand_token(b[1], trace)));
    else if (b = /^nt (.+)/.exec(token)) return nothe(expand_token(b[1], trace));
    else if (b = /^lc (.+)/.exec(token)) return lc(expand_token(b[1], trace));
    else if (b = /^lf (.+)/.exec(token)) return inline_case(expand_token(b[1], trace));
    else if (b = /^lt (.+)/.exec(token)) return lthe(expand_token(b[1], trace));
    else if (b = /^uc (.+)/.exec(token)) return uc(expand_token(b[1], trace));
    else if (b = /^uf (.+)/.exec(token)) return ucfirst(expand_token(b[1], trace));
    else if (b = /^sc (.+)/.exec(token)) return ucfirst(lc(expand_token(b[1], trace)));
    else if (b = /^tc (.+)/.exec(token)) return title_case(expand_token(b[1], trace));
    else if (b = /^gen_name (.+)/.exec(token)) {
        b = b[1].replace(/,.*/, "");
        return generate_name(b)
    }
    return token
}

function expand_x(a, c, b) {
    for (var d = {}, e = [], i = b.comma || ", "; match = /^(and|literal|unique) (.+)/.exec(c);) {
        opt[match[1]] = true;
        c = match[2]
    }
    var h;
    for (h = 0; h < a; h++) {
        var f = new String(c);
        f = opt.unique ? expand_unique(f, b) : expand_token(f, b);
        if (opt.literal) e.push(f);
        else if (match = /^(\d+) x (.+)/) d[match[2]] += parseInt(match[1], 10);
        else d[f] += 1
    }
    $H(d).keys().sort().each(function (g) {
        d[g] > 1 ? e.push([d[g], g].join(" x ")) : e.push(g)
    });
    if (opt.and) {
        a = e.pop();
        return e.length ? [e.join(i), a].join(" and ") : a
    } else return e.join(i)
}

function expand_unique(a, c) {
    var b;
    for (b = 0; b < 100; b++) {
        var d = expand_token(a, c);
        if (!c.exclude[d]) {
            c.exclude[d] = true;
            return d
        }
    }
    return ""
}

function set_var(a, c, b) {
    if (a == "npc_name") b["var"].name = (match = /^(.+?) .+/.exec(c)) ? match[1] : c;
    return b["var"][a] = c
}

function aoran(a) {
    return /^the /i.test(a) ? a : /^(nunchaku)/i.test(a) ? a : /^(unicorn|unique|university)/i.test(a) ? "a " + a : /^(hour)/i.test(a) ? "an " + a : /^[BCDGJKPQTUVWYZ][A-Z0-9]+/.test(a) ? "a " + a : /^[AEFHILMNORSX][A-Z0-9]+/.test(a) ? "an " + a : /^[aeiou]/i.test(a) ? "an " + a : "a " + a
}

function nothe(a) {
    return (match = /^the (.+)/i.exec(a)) ? match[1] : a
}

function lc(a) {
    return a.toLowerCase()
}

function lcfirst(a) {
    return (match = /^([a-z])(.*)/i.exec(a)) ? lc(match[1]) + match[2] : a
}

function inline_case(a) {
    return /^[A-Z][A-Z]/.test(a) ? a : lcfirst(a)
}

function lthe(a) {
    return (match = /^the (.+)/i.exec(a)) ? "the " + match[1] : a
}

function uc(a) {
    return a.toUpperCase()
}

function ucfirst(a) {
    return (match = /^([a-z])(.*)/i.exec(a)) ? uc(match[1]) + match[2] : a
}

function title_case(a) {
    return a.split(/\s+/).map(uc).join(" ")
};