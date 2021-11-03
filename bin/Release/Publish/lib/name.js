// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// name.js
//
// written by drow <drow@bin.sh>
// http://creativecommons.org/licenses/by-nc/3.0/
var chain_cache = {};

function generate_name(a) {
    if (a = markov_chain(a)) return markov_name(a);
    return ""
}

function markov_chain(a) {
    var b;
    if (b = chain_cache[a]) return b;
    else if (b = name_set[a])
        if (b = construct_chain(b)) return chain_cache[a] = b;
    return false
}

function construct_chain(a) {
    var b = {},
        c;
    for (c = 0; c < a.length; c++) {
        var e = a[c].split(/\s+/);
        b = incr_chain(b, "parts", e.length);
        var f;
        for (f = 0; f < e.length; f++) {
            var d = e[f];
            b = incr_chain(b, "name_len", d.length);
            var g = d.substr(0, 1);
            b = incr_chain(b, "initial", g);
            d = d.substr(1);
            for (var h = g; d.length > 0;) {
                g = d.substr(0, 1);
                b = incr_chain(b, h, g);
                d = d.substr(1);
                h = g
            }
        }
    }
    return scale_chain(b)
}

function incr_chain(a, b, c) {
    if (a[b])
        if (a[b][c]) a[b][c]++;
        else a[b][c] = 1;
    else {
        a[b] = {};
        a[b][c] = 1
    }
    return a
}

function scale_chain(a) {
    var b = {},
        c;
    for (c in a) {
        b[c] = 0;
        var e;
        for (e in a[c]) {
            var f = a[c][e];
            f = Math.floor(Math.pow(f, 1.3));
            a[c][e] = f;
            b[c] += f
        }
    }
    a.table_len = b;
    return a
}

function markov_name(a) {
    var b = select_link(a, "parts"),
        c = [],
        e;
    for (e = 0; e < b; e++) {
        var f = select_link(a, "name_len"),
            d = select_link(a, "initial"),
            g = d;
        for (d = d; g.length < f;) {
            d = select_link(a, d);
            g += d;
            d = d
        }
        c.push(g)
    }
    return c.join(" ")
}

function select_link(a, b) {
    var c = a.table_len[b];
    c = random(c);
    var e = 0;
    for (token in a[b]) {
        e += a[b][token];
        if (c < e) return token
    }
    return "-"
};