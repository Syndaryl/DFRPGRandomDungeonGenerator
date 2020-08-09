var last_saved_query = new dungeon_configuration();

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
    last_saved_query = new dungeon_configuration(
        "",
        "ink_miser",
        "hex",
        "rectangle",
        "tiny",
        "yes",
        "scattered",
        "medium",
        "standard",
        "organised",
        "most",
        125,
        "average",
        "onehundred",
        25,
        ["ANY"],
        "mid"
    );

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
    var urlParams = location.search.split(/[?&]/).slice(1).map(function (paramPair) {
        return paramPair.split(/=(.+)?/).slice(0, 2);
    }).reduce(function (obj, pairArray) {
        obj[pairArray[0]] = decodeURIComponent(pairArray[1]);
        return obj;
    }, {});
    /**
     * Any parameters that are not provided from the URL GET are given default values.
     */
    default_query = last_saved_query.update(urlParams);
    alert(JSON.stringify(default_query));
}