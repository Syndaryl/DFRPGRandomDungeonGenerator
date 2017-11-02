// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// canvas.js
//
// written by drow <drow@bin.sh>
// http://creativecommons.org/licenses/by-nc/3.0/
var rgb_cache = {},
    cache_pix = false,
    pixel_cache = {};

function fmt_color(a, c, b) {
    var d = "#" + i2h(a) + i2h(c) + i2h(b);
    rgb_cache[d] = [a, c, b, 255];
    return d
}

function i2h(a) {
    a = a.toString(16);
    return a.length > 1 ? a : "0" + a
}

function color_rgb(a) {
    var c;
    if (rgb_cache[a]) return rgb_cache[a];
    else if (c = parse_color(a)) return rgb_cache[a] = c;
    return [0, 0, 0, 255]
}

function parse_color(a) {
    if (match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(a)) return [h2i(match[1]), h2i(match[2]), h2i(match[3]), 255];
    else if (match = /^#([0-9a-f])([0-9a-f])([0-9a-f])/i.exec(a)) return [h2i(match[1]), h2i(match[2]), h2i(match[3]), 255];
    else if (match = /^rgb[(](\d+),(\d+),(\d+)[)]/i.exec(a)) return [d2i(match[1]), d2i(match[2]), d2i(match[3]), 255];
    return false
}

function d2i(a) {
    return parseInt(a, 10)
}

function h2i(a) {
    return parseInt(a, 16)
}

function set_pixel(a, c, b, d) {
    if (cache_pix)
        if (pixel_cache[d]) pixel_cache[d].push([c, b]);
        else pixel_cache[d] = [
            [c, b]
        ];
    else fill_rect(a, c, b, c, b, d)
}

function cache_pixels(a) {
    cache_pix = a
}

function dump_pixels(a) {
    var c = a.canvas.width,
        b = a.canvas.height,
        d = a.getImageData(0, 0, c, b);
    $H(pixel_cache).keys().each(function(e) {
        var f = color_rgb(e);
        pixel_cache[e].each(function(h) {
            h = h[1] * c + h[0] << 2;
            var g;
            for (g = 0; g < 4; g++) d.data[h + g] = f[g]
        })
    });
    a.putImageData(d, 0, 0);
    cache_pix = false;
    pixel_cache = {}
}

function dump_pixels_1x1(a) {
    $H(pixel_cache).keys().each(function(c) {
        a.fillStyle = c;
        pixel_cache[c].each(function(b) {
            a.fillRect(b[0], b[1], 1, 1)
        })
    });
    cache_pix = false;
    pixel_cache = {}
}

/**
 * draws a line from (x1,y1) to (x2,y2) on the provided image using the provided stroke_style
 * @param {any} pen
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {number} stroke_style
 */
function draw_line(image, x1, y1, x2, y2, stroke_style) {
    if (x2 == x1 && y2 == y1) set_pixel(image, x1, y1, stroke_style);
    else {
        image.beginPath();
        image.moveTo(x1 + 0.5, y1 + 0.5);
        image.lineTo(x2 + 0.5, y2 + 0.5);
        image.strokeStyle = stroke_style;
        image.stroke()
    }
}

function fill_rect(a, c, b, d, e, f) {
    a.fillStyle = f;
    a.fillRect(c, b, d - c + 1, e - b + 1)
}

function stroke_rect(a, c, b, d, e, f) {
    a.strokeStyle = f;
    a.strokeRect(c, b, d - c + 1, e - b + 1)
}

function draw_string(a, c, b, d, e, f) {
    a.textBaseline = "middle";
    a.textAlign = "center";
    a.font = e;
    a.fillStyle = f;
    a.fillText(c, b, d)
}

function draw_image(a, c, b, d) {
    a.drawImage(c, b, d)
}

function save_canvas(a, c) {
    a = a.toDataURL("image/png");
    a = a.replace("image/png", "image/octet-stream");
    var b = document.createElement("a");
    if (typeof b.download === "string") {
        b.href = a;
        b.download = c;
        document.body.appendChild(b);
        b.click();
        document.body.removeChild(b)
    } else window.location.assign(a)
};