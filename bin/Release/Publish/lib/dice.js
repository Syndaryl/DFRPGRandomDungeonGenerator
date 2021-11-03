// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// dice.js
//
// written by drow <drow@bin.sh>
// http://creativecommons.org/licenses/by-nc/3.0/
var fn = /([a-z]*)\(([^()]*?)\)/,
    dice = /(\d*)d(\d+)/,
    incr = /([+-]?\d+\.\d+|[+-]?\d+)(\+\+|--)/,
    mult = /([+-]?\d+\.\d+|[+-]?\d+)\s*(\*|\/|%)\s*([+-]?\d+\.\d+|[+-]?\d+)/,
    add = /([+-]?\d+\.\d+|[+-]?\d+)\s*(\+|-)\s*([+-]?\d+\.\d+|[+-]?\d+)/,
    fp = /(\d+\.\d\d\d+)/,
    max_dice = 1E3;

/**
 * parses a standard dice expression or math expression
 * @param {string} dice_expression
 */
function roll_dice(dice_expression) {
    for (var a; a = fn.exec(dice_expression);) {
        a = rd_fn(a[1], a[2]);
        dice_expression = dice_expression.replace(fn, a)
    }
    for (; a = dice.exec(dice_expression);) {
        a = rd_dice(a[1], a[2]);
        dice_expression = dice_expression.replace(dice, a)
    }
    for (; a = incr.exec(dice_expression);) {
        a = rd_math(a[1], a[2]);
        dice_expression = dice_expression.replace(incr, a)
    }
    for (; a = mult.exec(dice_expression);) {
        a = rd_math(a[1], a[2], a[3]);
        dice_expression = dice_expression.replace(mult, a)
    }
    for (; a = add.exec(dice_expression);) {
        a = rd_math(a[1], a[2], a[3]);
        dice_expression = dice_expression.replace(add, a)
    }
    for (; a = fp.exec(dice_expression);) {
        a = Math.floor(a[1] * 100 + 0.5) / 100;
        dice_expression = dice_expression.replace(fp, a)
    }
    return dice_expression
}

function rd_fn(b, a) {
    a = roll_dice(a);
    if (b == "int") return Math.floor(a);
    else if (b == "round") return Math.floor(a + 0.5);
    else if (b == "sqrt") return Math.sqrt(a);
    return a
}

function rd_dice(b, a) {
    b = parseInt(b);
    if (isNaN(b) || b < 1) b = 1;
    a = parseInt(a);
    if (isNaN(a) || a < 0) return 0;
    if (b > max_dice) return 0;
    var c = 0,
        d;
    for (d = 0; d < b; d++) c += rd_rand(a) + 1;
    return c
}

function rd_rand(b) {
    return Math.floor(Math.random() * 0.9999 * b)
}

function rd_math(b, a, c) {
    b = parseFloat(b);
    if (isNaN(b)) b = 0;
    c = parseFloat(c);
    if (isNaN(c)) c = 0;
    if (a == "++") return ++b;
    if (a == "--") return --b;
    if (a == "*") return b * c;
    if (a == "/") return b / c;
    if (a == "%") return b % c;
    if (a == "+") return b + c;
    if (a == "-") return b - c;
    return 0
};