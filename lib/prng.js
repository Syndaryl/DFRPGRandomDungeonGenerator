// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// prng.js
// seeded pseudo-random number generator
//
// written by drow <drow@bin.sh>
// http://creativecommons.org/licenses/by-nc/3.0/
var seed = Date.now();

/**
 * 
 * @param {any} seed_value can be one of number or string, or something invalid.
 * If number, used directly as the seed.
 * If string, generate a hash of the string using the salt of 42.
 * If invalid, use current date/time as seed.
 */
function init_seed(seed_value) {
    return seed = typeof seed_value == "number" ? Math.floor(seed_value) : typeof seed_value == "string" ? hash_string(42, seed_value) : Date.now()
}

/**
 * Creates a number from provided salt and string, to use for hashing, generating RNG seeds, etc.
 * @param {number} salt
 * @param {string} string_seed
 */
function hash_string(salt, string_seed) {
    var counter;
    for (counter = 0; counter < string_seed.length; counter++) {
        salt = (salt << 5) - salt + string_seed.charCodeAt(counter);
        salt &= 2147483647
    }
    return salt
}

/**
 * Returns a number betwen 0 and max-1; if max is not greater than 1, returns 0.
 * @param {number} max
*  @returns {number}
 */
function random(max) {
    seed = 1103515245 * seed + 12345;
    seed &= 2147483647;
    return max > 1 ? (seed >> 8) % max : 0
};