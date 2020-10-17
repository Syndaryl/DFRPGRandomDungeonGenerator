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
    return d;
}

/**
 * Converts integer to hex value (with padding)
 * @param {int} a 
 * @returns {String} hex value as a string
 */
function i2h(a) {
    a = a.toString(16);
    return a.length > 1 ? a : "0" + a;
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
    return [0, 0, 0, 255];
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
    return parseInt(a, 10);
}

/**
 * Converts hex value to integer
 * @param {String|Number} a 
 */
function h2i(a) {
    return parseInt(a, 16);
}

/**
 * Draws a single pixel at coordinates (c, b) on element a
 * @param {Object} a - DOM element
 * @param {Number} x - x coordinate
 * @param {Number} y - y coordinate
 * @param {String|Object} d - Fill style
 */
function set_pixel(a, x, y, d) {
    if (cache_pix)
        if (pixel_cache[d]) pixel_cache[d].push([x, y]);
        else pixel_cache[d] = [
            [x, y]
        ];
    else fill_rect(a, x, y, x, y, d);
}

/**
 * Sets cache_pix flag
 * @param {Bool} a - Flag value
 */
function cache_pixels(a) {
    cache_pix = a;
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
        pixel_cache[e].each(function (h) {
            h = h[1] * c + h[0] << 2;
            var g;
            for (g = 0; g < 4; g++) d.data[h + g] = f[g];
        });
    });
    a.putImageData(d, 0, 0);
    cache_pix = false;
    pixel_cache = {};
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
    pixel_cache = {};
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
        image.stroke();
    }
}

/**
 * Draws filled rectangle
 * @param {CanvasRenderingContext2D} canvas - HTML canvas
 * @param {Number} x1 - Top x
 * @param {Number} y1 - Top y
 * @param {Number} x2 - Width - 1
 * @param {Number} y2 - Height - 1
 * @param {String|Object} f - Fill style
 */
function fill_rect(canvas, x1, y1, x2, y2, f) {
    canvas.fillStyle = f;
    canvas.fillRect(x1, y1, x2 - x1 + 1, y2 - y1 + 1);
}

/**
 * Draws rectangle
 * @param {CanvasRenderingContext2D} canvas - HTML canvas
 * @param {Number} x1 - Top x
 * @param {Number} y1 - Top y
 * @param {Number} x2 - Width - 1
 * @param {Number} y2 - Height - 1
 * @param {String|Object} f - Stroke Style
 */
function stroke_rect(canvas, x1, y1, x2, y2, f) {
    canvas.strokeStyle = f;
    canvas.strokeRect(x1, y1, x2 - x1 + 1, y2 - y1 + 1);
}

/**
 * Draws text on the HTML canvas (centered on [b, d])
 * @param {Object} canvas - HTML canvas 
 * @param {String} text - Text to draw
 * @param {Number} x - x coordinate
 * @param {Number} y - y coordinate
 * @param {String} font - Font
 * @param {String|Object} fill - Fill style
 */
function draw_string(canvas, text, x, y, font, fill) {
    canvas.textBaseline = "middle";
    canvas.textAlign = "center";
    canvas.font = font;
    canvas.fillStyle = fill;
    canvas.fillText(text, x, y);
}

/**
 * Draws image on the HTML canvas
 * @param {CanvasRenderingContext2D } context - HTML canvas
 * @param {CanvasImageSource} image - Image DOM element 
 * @param {Number} topX - Top x coordinate
 * @param {Number} topY - Top y coordinate
 */
function draw_image(context, image, topX, topY) {
    context.drawImage(image, topX, topY);
}

/**
 * Saves HTML canvas to png file
 * @param {HTMLCanvasElement} element - HTML canvas
 * @param {String} filename - Filename to save
 */
function save_canvas(element, filename) {
    var img = element.toDataURL("image/png");
    img = img.replace("image/png", "image/octet-stream");
    var b = document.createElement("a");
    if (typeof b.download === "string") {
        b.href = img;
        b.download = filename;
        document.body.appendChild(b);
        b.click();
        document.body.removeChild(b);
    } else window.location.assign(img);
};
/**
 * Saves HTML canvas to png file
 * @param {HTMLImageElement} element - HTML canvas
 * @param {String} filename - Filename to save
 */
function save_image(element, filename) {
    // Create an empty canvas element
    var canvas = document.createElement("canvas");
    canvas.width = element.width;
    canvas.height = element.height;

    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(element, 0, 0);

    // Get the data-URL formatted image
    // Firefox supports PNG and JPEG. You could check img.src to
    // guess the original format, but be aware the using "image/jpg"
    // will re-encode the image.
    var dataURL = canvas.toDataURL("image/png");

    //var blobdata = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    blobdata = dataURL.replace("image/png", "image/octet-stream");

    var b = document.createElement("a");
    if (typeof b.download === "string") {
        b.href = blobdata;
        b.download = filename;
        document.body.appendChild(b);
        b.click();
        document.body.removeChild(b);
    } else window.location.assign(blobdata);
};