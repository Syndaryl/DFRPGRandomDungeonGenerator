var last_saved_query = new dungeon_configuration();
var Global_Dungeon_Config = new dungeon_configuration().update(default_query);

function supports_local_storage() {
    try {
        return !!window.localStorage
            && typeof localStorage.getItem === 'function'
            && typeof localStorage.setItem === 'function'
            && typeof localStorage.removeItem === 'function';
    } catch (e) {
        return false;
    }
}

/**
 * Tries to get a value from localstorage. If value is not available, 
 * initializes localstorage with the provided default, and returns the provided default.
 * @param {string} key
 * @param {object} default_value
 * 
 * @returns {object}
 */
function FetchStorage(key, default_value) {
    try {
        var stored = window.localStorage.getItem(key);
        if (stored) {
            return JSON.parse(stored);
        } else {
            UpdateStorage(key, default_value);
            return default_value;
        }
    } catch (e) {
        return default_value;
    }
}

function UpdateStorage(key, val) {
    var store = [];
    store.push(val);
    window.localStorage.setItem(key, JSON.stringify(store));
}

/**
 * Load query configuration from LocalStorage
 * */
function LoadFromStorage() {
    last_saved_query = new dungeon_configuration(Global_Dungeon_Config);

    if (supports_local_storage()) {
        /**
         * Last saved query settings for the HTML form
         */
        var Query_Storage = FetchStorage('last_saved_query');

        if (Query_Storage !== null) {
            var last_saved_query_json = Query_Storage;

            if (last_saved_query_json === null) {
                last_saved_query_json = {};
            }
            else {
                last_saved_query = last_saved_query.update(last_saved_query_json);
            }
        }
    } else {
        // Sorry! No Web Storage support..
    }
    /**
 * Rip apart the HTTP GET request and get out the parameters for the query.
 */
    var param_pairs = location.search.split(/[?&]/).slice(1);
    if (param_pairs.length > 0) {
        var split_to_reduce = param_pairs.map(function (paramPair) {
            return paramPair.split(/=(.+)?/).slice(0, 2);
        });
        var urlParams = split_to_reduce.reduce(function (obj, pairArray) {
            obj[pairArray[0]] = decodeURIComponent(pairArray[1]);
            return obj;
        }, {});
        /**
         * Any parameters that are not provided from the URL GET are given default values.
         */
        Global_Dungeon_Config = last_saved_query.update(urlParams);
    }
    //alert(JSON.stringify(Global_Dungeon_Config));

    /*
     * http://localhost:57343/?seed=The%20Barrow%20of%20Adamant%20Woe&map_style=ink_miser&grid=hex&dungeon_layout=square&dungeon_size=tiny&add_stairs=many&room_layout=tight&room_size=medium&doors=deathtrap&corridor_layout=organized&remove_deadends=all&cer=250&challenge=average&generosity=onehundred&resolution=12&biomes_fields=%5B%22DESERT%22%2C%22DUNGEON%22%2C%22JUNGLE%22%2C%22MOUNTAIN%22%5D&biome_strictness=yielding&travel_distance=mid
     * */
}