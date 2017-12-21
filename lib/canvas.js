// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// canvas.js
//
// written by drow <drow@bin.sh>
// http://creativecommons.org/licenses/by-nc/3.0/
var rgb_cache = {},
    cache_pix = false,
    pixel_cache = {};

/**
 * Creates a hex colour from RGB values
 * @param {int} r - Red value
 * @param {int} g - Green value 
 * @param {int} b - Blue value
 * @returns {String} - RGB value in hex
 */
function fmt_color(r, g, b) {
    var d = "#" + i2h(r) + i2h(g) + i2h(b);
    rgb_cache[d] = [r, g, b, 255];
    return d
}

/**
 * Converts integer to hex value (with padding)
 * @param {int} a 
 * @returns {String} hex value as a string
 */
function i2h(a) {
    a = a.toString(16);
    return a.length > 1 ? a : "0" + a
}

/**
 * Returns an RGBA Array for a given hex value
 * @param {String} a - Hex value for a color
 * @returns {Array} RGBA array
 */
function color_rgb(a) {
    var c;
    if (rgb_cache[a]) return rgb_cache[a];
    else if (c = parse_color(a)) return rgb_cache[a] = c;
    return [0, 0, 0, 255]
}

/**
 * Parses a hex value and returns an Array of RGBA or False
 * @param {String} a - Hex value as a string (inc. #)
 * @returns {Array|Bool} Array of RGBA values or false
 */
function parse_color(a) {
    if (match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(a)) return [h2i(match[1]), h2i(match[2]), h2i(match[3]), 255];
    else if (match = /^#([0-9a-f])([0-9a-f])([0-9a-f])/i.exec(a)) return [h2i(match[1]), h2i(match[2]), h2i(match[3]), 255];
    else if (match = /^rgb[(](\d+),(\d+),(\d+)[)]/i.exec(a)) return [d2i(match[1]), d2i(match[2]), d2i(match[3]), 255];
    return false
}

/**
 * Converts decimal to integer
 * @param {Number} a - Decimal number
 */
function d2i(a) {
    return parseInt(a, 10)
}

/**
 * Converts hex value to integer
 * @param {String|Number} a 
 */
function h2i(a) {
    return parseInt(a, 16)
}

/**
 * Draws a single pixel at coordinates (c, b) on element a
 * @param {Object} a - DOM element
 * @param {Number} c - x coordinate
 * @param {Number} b - y coordinate
 * @param {String|Object} d - Fill style
 */
function set_pixel(a, c, b, d) {
    if (cache_pix)
        if (pixel_cache[d]) pixel_cache[d].push([c, b]);
        else pixel_cache[d] = [
            [c, b]
        ];
    else fill_rect(a, c, b, c, b, d)
}

/**
 * Sets cache_pix flag
 * @param {Bool} a - Flag value
 */
function cache_pixels(a) {
    cache_pix = a
}

/**
 * TODO figure out what this function does
 * @param {Object} a - HTML canvas
 */
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

/**
 * TODO figure out what this function does
 * @param {Object} a - HTML canvas
 */
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
 * @param {Number} x1
 * @param {Number} y1
 * @param {Number} x2
 * @param {Number} y2
 * @param {Number} stroke_style
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

/**
 * Draws filled rectangle
 * @param {Object} a - HTML canvas
 * @param {Number} c - Top x
 * @param {Number} b - Top y
 * @param {Number} d - Width - 1
 * @param {Number} e - Height - 1
 * @param {String|Object} f - Fill style
 */
function fill_rect(a, c, b, d, e, f) {
    a.fillStyle = f;
    a.fillRect(c, b, d - c + 1, e - b + 1)
}

/**
 * Draws rectangle
 * @param {Object} a - HTML canvas
 * @param {Number} c - Top x
 * @param {Number} b - Top y
 * @param {Number} d - Width - 1
 * @param {Number} e - Height - 1
 * @param {String|Object} f - Stroke Style
 */
function stroke_rect(a, c, b, d, e, f) {
    a.strokeStyle = f;
    a.strokeRect(c, b, d - c + 1, e - b + 1)
}

/**
 * Draws text on the HTML canvas (centered on [b, d])
 * @param {Object} a - HTML canvas 
 * @param {String} c - Text to draw
 * @param {Number} b - x coordinate
 * @param {Number} d - y coordinate
 * @param {String} e - Font
 * @param {String|Object} f - Fill style
 */
function draw_string(a, c, b, d, e, f) {
    a.textBaseline = "middle";
    a.textAlign = "center";
    a.font = e;
    a.fillStyle = f;
    a.fillText(c, b, d)
}

/**
 * Draws image on the HTML canvas
 * @param {Object} a - HTML canvas 
 * @param {Object} c - Image DOM element 
 * @param {Number} b - Top x coordinate
 * @param {Number} d - Top y coordinate
 */
function draw_image(a, c, b, d) {
    a.drawImage(c, b, d)
}

/**
 * Saves HTML canvas to png file
 * @param {Object} element - HTML canvas
 * @param {String} filename - Filename to save
 */
function save_canvas(element, filename) {
    element = element.toDataURL("image/png");
    element = element.replace("image/png", "image/octet-stream");
    var b = document.createElement("a");
    if (typeof b.download === "string") {
        b.href = element;
        b.download = filename;
        document.body.appendChild(b);
        b.click();
        document.body.removeChild(b)
    } else window.location.assign(element)
};