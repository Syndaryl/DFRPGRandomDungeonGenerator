// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// dungeon.js // version 1.0.3
//
// written by drow <drow@bin.sh>
// http://creativecommons.org/licenses/by-nc/3.0/



/**
 * Initializes the webforms drop-down options, and sets up event observers
 */
function init_form() {
    $("dungeon_name").observe("change", name_reaction);
    $("new_name").observe("click", new_name);
    $("cer").observe("change", new_dungeon);
    $("remote_treasure").observe("change", new_dungeon);
    // go through the various dropdowns and populate them from the lists in this file
    // and then observe them
    $H(dungeon_options).keys().each(function(key_primus) {
        $H(dungeon_options[key_primus]).keys().each(function(key_secondus) {
            var option_text = dungeon_options[key_primus][key_secondus].title;
            $(key_primus).insert(create_option(key_secondus, option_text))
        });
        $(key_primus).observe("change", new_dungeon)
    });
    dungeon_options.cer = $("cer").getValue();
    // set defaults
    var query_keys = $H(default_query).keys();
    query_keys.each(set_default);
    new_name()
}

function set_default(drop_down) {
    var q = default_query[drop_down];
    $(drop_down).setValue(q);
}

/**
 * Creates a JSON object  with the specified name and value.
 * @param {string} name
 * @param {any} value
 */
function create_option(name, value) {
    return new_option({
        value: name
    }).update(value)

}

/**
 * Creates a new key-value pair with the name "option" and the value from @{value}
 * @param {any} value
 */
function new_option(value) {
    return build_tag("option", value)
}

/**
 * Creates a new key-value pair
 * @param {string} key
 * @param {any} value
 * @returns {Element}
 */
function build_tag(key, value) {
    return new Element(key, value)
}

/**
 * Event to handle changes to dungeon name. Triggers a new dungeon.
 */
function name_reaction() {
    $("dungeon_title").update($("dungeon_name").getValue());

    new_dungeon()
}

/**
 * Generates a new dungeon name, assigns it internally, and triggers the name_reaction() event.
 */
function new_name() {
    $("dungeon_name").setValue(generate_text("Dungeon Name"));
    cer_reaction()
}

/**
 * Event to handle changes to a dungeons cer level. Triggers a new dungeon.
 */
function cer_reaction() {

    new_dungeon()
}


/**
 * Create a new dungeon, generate an image for the new dungeon.
 */
function new_dungeon() {
    var dungeonOBJ = create_dungeon();
    dungeonOBJ.challenge = 'average';
    image_dungeon_player(dungeonOBJ);
    describe_dungeon(dungeonOBJ);
}

function describe_dungeon(dungeonOBJ) {
    var room_key = document.getElementById('room_key');
    while (room_key.firstChild) {
        room_key.removeChild(room_key.firstChild);
    }
    for (var roomItr = 1; roomItr <= dungeonOBJ.n_rooms; roomItr++) {
        var room = dungeonOBJ.room[roomItr.toString()];
        console.log(room, null, 3);

        var div = document.createElement('div');
        div.id = 'room_' + room['id'];
        div.className = 'room';

        decribe_title(div, room['id']);

        describe_description(div, room);

        describe_features(div, room);
        room.treasure_node = document.createElement('div');
        room.treasure_node.id = 'treasure';
        div.appendChild(room.treasure_node);

        describe_monsters(div, room);
        describe_traps(div, room);
        room_key.appendChild(div);

        // generally done async
        room = treasure_room(room, dungeonOBJ.cer, div);
    }
}

function decribe_title(element, number) {

    var title = document.createElement('h2');
    title.innerText = 'Room ' + number;
    element.appendChild(title);

}

function describe_description(element, room) {
    var description = document.createElement('p');
    add_labeled_text(description, 'Description: ',
        'This room is ' + (room['width'] * 0.3) + ' feet wide and ' + (room['height'] *  0.3) + ' feet long. ' +
        room['description'].join('. ') + '.');

    element.appendChild(description);
}

function describe_features(element, room) {
    var contents = document.createElement('p');
    add_labeled_list(contents, 'Contents: ', room['contents']);
    element.appendChild(contents);
}

function describe_monsters(element, room) {
    if (room['monsters'].length > 0) {
        var container = document.createElement('div');
        container.id = 'monsters';
        element.appendChild(container);

        var contents = document.createElement('p');
        var mons = [];
        for (var i = 0; i < room['monsters'].length; i++) {
            var source = "";
            if (room['monsters'][i].monster.Source1 != "") source += room['monsters'][i].monster.Source1 + " p" + room['monsters'][i].monster.Page1
            if (room['monsters'][i].monster.Source1 != "" && room['monsters'][i].monster.Source2 != "") source += ", ";
            if (room['monsters'][i].monster.Source2 != "" ) source += room['monsters'][i].monster.Source2 + " p" + room['monsters'][i].monster.Page2;
            mons.push("CER: " + (room['monsters'][i].quantity * room['monsters'][i].cer)+ "; " + room['monsters'][i].quantity + " x " + room['monsters'][i].monster.Description + " (" + source + ")");
        }
        add_labeled_list(contents, 'Monsters: ', mons);
        container.appendChild(contents);
    }
}

function describe_treasures(element, room) {
    if (room['treasure'].length > 0){
        add_labeled_list(room.treasure_node, 'Treasures: ', room['treasure']);
    }
}

function describe_traps(element, room) {
    if (room['traps'].length > 0) {
        var container = document.createElement('div');
        container.id = 'traps';
        element.appendChild(container);

        var contents = document.createElement('p');
        var traps = [];
        for (var i = 0; i < room['traps'].length; i++) {
            var source = "";
            if (room['traps'][i].Book != "") source += room['traps'][i].Book + " p" + room['traps'][i].Page
            traps.push(room['traps'][i].Description + " (" + source + ")");
        }
        add_labeled_list(contents, 'Traps: ', traps);
        container.appendChild(contents);
    }
}

function add_labeled_list(node, label, list) {
    var label_node = document.createElement('span');
    label_node.className  = 'label';
    label_node.innerText = label;

    node.appendChild(label_node);

    for (var i = 0; i < list.length; i ++) {
        var text_node = document.createElement('span');
        text_node.className  = 'text';
        text_node.innerText = list[i];
        node.appendChild(text_node);

        var br = document.createElement('br');
        node.appendChild(br);
    }
}

function add_labeled_text(node, label, text) {
    var label_node = document.createElement('span');
    label_node.className  = 'label';
    label_node.innerText = label;

    var text_node = document.createElement('span');
    text_node.className  = 'text';
    text_node.innerText = text;

    node.appendChild(label_node);
    node.appendChild(text_node);
}

/**
 * 
 * @param {dungeon_configuration} dungeonOBJ
 */
function describe_rooms(dungeonOBJ) {
    var roomIDX;
    for (roomIDX = 1; roomIDX <= dungeonOBJ.n_rooms; roomIDX++) {
        room = describe_room(dungeonOBJ.room[roomIDX]);
        room = feature_room(dungeonOBJ.room[roomIDX]);
        room = monster_room(dungeonOBJ, roomIDX, threat_distribution[dungeonOBJ.challenge]);
        //room = treasure_room(dungeonOBJ.room[roomIDX], dungeonOBJ.cer);
        room = trap_room(dungeonOBJ.room[roomIDX], dungeonOBJ.cer);
    }
    return dungeonOBJ
}

function describe_room(room) {
    room.description = [];

    var decoNum = select_from_weighted_table(decorationNumber);
    if (decoNum == {}) return room;
    if (decoNum.Description == 0) {
        room.description.push('Nothing much');
    }

    for (var i = 1; i <= decoNum.Description; i++) {
        table_rolls_to_property(room, decoNum.Tables, "description");
    }

    var smellNum = select_from_weighted_table(smellsNumber);
    if (smellNum == {} || smellNum == undefined) return room;
    for (var i = 1;
        i <= smellNum.Description;
        i++) {
        table_rolls_to_property(room, smellNum.Tables, "description");
    }

    return room;
}

function feature_room(room) {
    room.contents = [];
    var feat = select_from_weighted_table(feature);
    if (feat == {}) return room;
    room.contents.push(feat.Description);
    room.feature = feat;
    table_rolls_to_property(room, feat.Tables, "contents", ['monsters', 'traps', 'treasure','container']);

    return room;
}

function treasure_room(room, dungeonCER, element) {
    /* var roomIDX;
    for (roomIDX = 1; roomIDX <= dungeonOBJ.n_rooms; roomIDX++) {
    
    } */
    room.treasure = [];

    var has_treasure = false,
        has_container = false;
    if (room.feature.Tables != undefined) has_treasure = room.feature.Tables.includes('treasure');
    if (room.feature.Tables != undefined) has_container = room.feature.Tables.includes('container');

        // TODO: check if there is a monster or trap or both, use encounter cer + ter instead when available.
        // TODO: add cer to the weird atmospheres.
    var cer = dungeonCER;
    if (room.monsters.length > 0) {
        cer = monsters_cer(room.monsters);
        var encounter = find_encounter_level(dungeonCER / cer);
        if (encounter == "Boss" || encounter == "Epic") has_treasure = true;
        if (encounter == "Worthy") {
            var coin_flip = random(10);
            coin_flip = coin_flip < 5;
            has_treasure = (has_treasure) || coin_flip;
        }
    }

    if (has_treasure) {
        cer *= modify_cer_for_treasure(dungeonCER / cer);
        var horde_min = cer * 5;
        var horde_max = horde_min * (1 + roll_dice('4d6') / 11);

        horde_max = clean_number(horde_max, 2);
        var coin_value = horde_min * 0.5;
        if (coin_value > 0){
            var money = cash_value(coin_value); // TODO: treasure types table.
            horde_min -= coin_value;
            horde_max -= coin_value;
            room.treasure.push(money);
        }
        if (remote_available) {
            fetch_remote_treasure(room, element, horde_min, horde_max, has_container)
        }
        else {
            if (has_container) manual_container(room);
            manual_treasure(room, horde_min, horde_max);
            describe_treasures(element, room);
        }
        
    }
    return room
}

function monsters_cer(monsters) {
    return monsters.reduce(
        function (memo, entry) {
            return memo + (entry.cer * entry.quantity);
        }, 0
    );
}

function find_threats_n(n, key) {
    var keys = Object.keys(threats);
    for (var i = 0; i < keys.length; i++) {
        if (n > threats[keys[i]].NgtX && n <= threats[keys[i]].NltX) {
            return threats[keys[i]][key];
        }
    }

    return undefined;
}

/**
 * 
 * @param {number} n
 * @returns {string}
 */
function find_encounter_level(n) {
    var level = find_threats_n(n, "Name");
    return level == undefined ? "Worthy" : level;
}

/**
 * 
 * @param {number} n
 */
function modify_cer_for_treasure(n) {
    var treasure = find_threats_n(n, "Treasure");
    return treasure == undefined ? 1 : treasure;
}

/**
 * Clean up a number to a certain number of significant figures.
 * e.g. clean_number(15893.8887,3) returns 15900 but clean_number(893.8887,3) returns 893 and clean_number(0.8887,3) returns 0.89
 * @param {number} fpn a number that probably has some decimal points trailing after it.
 * @param {number} sig_figures the number of figures to clean up to
 */
function clean_number(fpn, sig_figures) {
    var wiggle = Math.floor(Math.log10(fpn)); // find number of digits (not counting decimal places)
    if (wiggle < sig_figures) return Math.round(fpn * 100)/100; // round trailing decimals to two places

    if (wiggle > sig_figures )
    { wiggle = (wiggle - sig_figures) * 10 }
    else { wiggle = 1; }

    fpn /= wiggle;
    fpn = Math.round(fpn);
    fpn *= wiggle;

    return fpn;
}

/**
 * 
 * @param {number} target
 * @returns {string}
 */
function cash_value(target) {
    // var base = 10;
    // var magnitude = Math.floor(logX(fpn, base));
    // var scale = (magnitude - 1) * base;
    // var x = Math.ceil(target / (Math.pow(base, scale) * 3.5 ) );
    if (target >= 10.5) {
        var x = Math.ceil(target / 3.5);
        target = roll_dice(x + 'd6');
    }

    var result = "";

    // split into currency types
    var cur = JSON.parse(JSON.stringify(currency)); // deep copy
    var curList = $H(cur).keys().sort(function (a, b) {
        cur[a].value > cur[b].value;
    });

    var weight = 0;
    var net = 0;
    
    for (var i = 0; i < curList.length; i++) {
        c = curList[i];
        var v = cur[c].value;

        if (target / v > 0) {
            cur[c].quantity = Math.trunc(target / v);

            if ( i != curList.length -1 ) {
                var r = roll_dice('3d6');
                cur[c].quantity =
                    r > 14 ? cur[c].quantity :
                    r > 11 ? Math.trunc(cur[c].quantity * 0.75) :
                    r > 9 ? Math.trunc(cur[c].quantity * 0.5) :
                    0; // it's not always about the efficient packing of money :D
            }
            net += (cur[c].quantity * v); 
            target -= (cur[c].quantity * v); // remove from remailing value that needs calculating
            weight += cur[c].quantity * cur[c].weight; // accumulate weight
        }
        if (cur[c].quantity > 0) {
            result += cur[c].quantity + ' ' + cur[c].name;
            result += ' ';
        }
    }
    result += '[' + number_to_money(net) + '; '  + gurps_weight(weight)  + ']';
    return result;
}

/**
 * Find the logX of n
 * @param {number} n
 * @param {number} x
 */
function logX(n, x) {
    return Math.log(n) / Math.log(x);
}

function fetch_remote_container(room, element, capacity, value_min, value_max) {
    var value = {
        min: Math.round(value_min),
        max: Math.round(value_max)
    }
    console.log("Generating a treasure container");
    var request_url = 'http://df-treasure-generator.herokuapp.com/v1/generate/1/Containers?min=' + value.min + '&max=' + value.max ;
    var request = new XMLHttpRequest();
    request.open('GET', request_url, true);

    request.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status >= 200 && this.status < 400) {
                // Success!
                var data = JSON.parse(this.responseText);
                value.current = money_to_number(data['items'][0]['cost_per_item']);
                console.log("* container of value " + value.current + ": " + data.items[0].desc);
                install_treasure(data, room);
            } else {
                // We reached our target server, but it returned an error
                console.log("Error: Response status " + this.status + ", failing over to manual.");
                manual_container(room);
            }
        }
    };

    request.onerror = function () {
        // There was a connection error of some sort
        console.log("Error: Response status " + this.status + ", failing over to manual.");
        manual_container(room);
    };

    request.send();

}

function fetch_remote_treasure(room, element, value_min, value_max, has_container) {
    var value = {
        min: Math.round(value_min),
        max: Math.round(value_max)
    }
    console.log("Generating a treasure between " + value.min + " and " + value.max);
    var request_url = 'http://df-treasure-generator.herokuapp.com/v1/generate/1?max=' + value.max + '&min=' + value.min;
    var request = new XMLHttpRequest();
    request.open('GET', request_url, true);

    request.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status >= 200 && this.status < 400) {
                // Success!
                var data = JSON.parse(this.responseText);
                value.current = money_to_number(data['items'][0]['cost_per_item']);
                console.log("* treasure of value " + value.current + ": " + data.items[0].desc);
                value.max -= value.current;
                if (value.max > value.min) {
                    console.log("need more value up to " + value.max);
                    install_treasure(data, room);
                    fetch_remote_treasure(room, element, value.min, value.max);
                }
                else {
                    if (has_container) {
                        var horde_weight = 0;

                        fetch_remote_container(room, element, horde_weight, 0, horde_min);
                    }
                    console.log("done");
                    install_treasure(data, room);
                    describe_treasures(element, room);
                }
            } else {
                // We reached our target server, but it returned an error
                console.log("Error: Response status " + this.status + ", failing over to manual.");
                if (has_container) manual_container(room);
                manual_treasure(room);
                describe_treasures(element, room);
            }
        }
    };

    request.onerror = function () {
        // There was a connection error of some sort
        console.log("Error: Response status " + this.status + ", failing over to manual.");
        manual_treasure(room);
        describe_treasures(element, room);
    };

    request.send();

}

function install_treasure(json, room) {
    for (var x = 0; x < json.items.length; x++){
        var item = json.items[x].desc;

        room.treasure.push(item);
    }
}

function manual_container(room) {
    room.treasure.push('Roll on DF8: Treasure Tables, on the containers table, for an appropriate container.' );
}

function manual_treasure(room, horde_min, horde_max) {
    // table_rolls_to_property(room, 'treasure', 'treasure', []);
    room.treasure.push('Roll on DF8: Treasure Tables untill you reach a collected item value between ' + number_to_money(horde_min) +
        ' and ' + number_to_money(horde_max) );
}

function gurps_weight(value) {
    var pounds = Math.trunc(value * 100) / 100;
    return pounds + ' lb.';
    //return pounds + ' lb.' +  (ounces > 0 ? ' ' + ounces + ' oz.' : '');
}

/**
 * 
 * @param {string} value
 */
function money_to_number(value) {
    var currency = value; 
    var cur_re = /\D*(\d.*?\d)(?:\D+(\d+))?\D*$/;
    var parts = cur_re.exec(currency);
    return Number(parts[1].replace(/\D/, '') + '.' + (parts[2] ? parts[2] : '00'));
}

function number_to_money(value) {
    var options = {
        'style': 'currency',
        'currency': 'USD',
        'currencyDisplay': 'symbol'
    };

    return value.toLocaleString(undefined, options);
}

function trap_room(room, cer) {
    /* var roomIDX;
    for (roomIDX = 1; roomIDX <= dungeonOBJ.n_rooms; roomIDX++) {
    
    } */
    room.traps = [];

    var has_traps =  false;
    if (room.feature.Tables != undefined) has_traps = room.feature.Tables.includes('traps');
    if (has_traps) {
        table_rolls_to_property(room, 'traps', 'traps', [], false, true);
    }
    return room
}

function table_rolls_to_property(room, table_string, targetProperty, exemptions, invert, push_object) {
    if (targetProperty == undefined){
        targetProperty = "description";
    }
    if (room[targetProperty] == undefined) {
        room[targetProperty] = [];
    }
    if (exemptions == undefined)
        exemptions = ['monsters', 'treasure'];
    if (invert == undefined)
        invert == false;
    if (push_object == undefined)
        push_object == false;

    var tables = get_tables(table_string, exemptions, invert);

    if (tables.constructor === Array) {
        for (var t = 0; t < tables.length; t++) {
            if (tables[t].constructor === Array) {
                if (tables[t].length > 0) {
                    var deco = select_from_weighted_table(tables[t]);
                    if (deco != {}) room[targetProperty].push(
                        push_object ? deco
                            : (deco.Description == undefined ? deco.Name : deco.Description)
                    );
                }
            }
        }
    }
}

/**
 * 
 * @param {string} tables
 * @param {string[]} exemptions
 * @param {boolean} invert
 * @returns {weighted_table_entry[]}
 */
function get_tables(table_list_string, exemptions, invert) {
    var tables = get_requested_table_names(table_list_string, exemptions, invert);
    if (tables.length == 0) return [];
    var new_tables = [];
    for (var i = 0; i < tables.length; i++) {
            new_tables.push(tables_index[tables[i]]);
    }
    return new_tables;
}

/**
 * 
 * @param {string} table_list_string
 * @param {string[]} exemptions
 * @param {boolean} invert
 * @returns {string[]}
 */
function get_requested_table_names(table_list_string, exemptions, invert) {
    if (table_list_string == "" || table_list_string == undefined) return [];
    if (exemptions == undefined) exemptions = [];
    if (invert == undefined) invert = false;
    var tables = [].concat(table_list_string.split(';'));
    var new_tables = [];
    for (var i = 0; i < tables.length; i++) {
        var table_name = tables[i].trim();
        if (invert == false && exemptions.indexOf(table_name) == -1 ||
            invert == true && exemptions.indexOf(table_name) > -1) {
            new_tables.push(table_name);
        }
    }
    return new_tables;
}

function create_dungeon() {
    var dungeonOBJ = init_dungeon();
    dungeonOBJ = emplace_rooms(dungeonOBJ);
    dungeonOBJ = open_rooms(dungeonOBJ);
    dungeonOBJ = label_rooms(dungeonOBJ);
    dungeonOBJ = describe_rooms(dungeonOBJ);
    dungeonOBJ = corridors(dungeonOBJ);
    if (dungeonOBJ.add_stairs) dungeonOBJ = emplace_stairs(dungeonOBJ);
    return dungeonOBJ = gelatinous_cube(dungeonOBJ)
}

function init_dungeon() {
    var seed = {
        seed: init_seed($("dungeon_name").getValue())
    };
    $H(dungeon_options).keys().each(function (g) {
        // console.log("init: " + g);
        seed[g] = $(g).getValue()
    });
    dungeon_options.cer = $("cer").getValue();
    var b = get_dungeon_configuration("dungeon_size", seed),
        c = get_dungeon_configuration("dungeon_layout", seed),
        d = b.size,
        e = c.aspect;
    b = b.cell;
    seed.n_i = Math.floor(d * e / b);
    seed.n_j = Math.floor(d / b);
    seed.cell_size = b;
    seed.n_rows = seed.n_i * 2;
    seed.n_cols = seed.n_j * 2;
    seed.max_row = seed.n_rows - 1;
    seed.max_col = seed.n_cols - 1;
    seed.cell = [];
    for (d = 0; d <= seed.n_rows; d++) {
        seed.cell[d] = [];
        for (e = 0; e <= seed.n_cols; e++) seed.cell[d][e] = NOTHING
    }
    if (c = c.mask) seed = mask_cells(seed, c);
    else if (seed.dungeon_layout ==
        "saltire") seed = saltire_mask(seed);
    else if (seed.dungeon_layout == "hexagon") seed = hex_mask(seed);
    else if (seed.dungeon_layout == "round") seed = round_mask(seed);
    return seed
}

function get_dungeon_configuration(key, dungeonOBJ) {
    return dungeon_options[key][dungeonOBJ[key]]
}

function mask_cells(a, b) {
    var c = b.length / (a.n_rows + 1),
        d = b[0].length / (a.n_cols + 1),
        e;
    for (e = 0; e <= a.n_rows; e++) {
        var g = b[Math.floor(e * c)],
            f;
        for (f = 0; f <= a.n_cols; f++) g[Math.floor(f * d)] || (a.cell[e][f] = BLOCKED)
    }
    return a
}

function saltire_mask(a) {
    Math.floor(a.n_rows / 2);
    var b = Math.floor(a.n_rows / 4),
        c;
    for (c = 0; c < b; c++) {
        var d = b + c,
            e = a.n_cols - d;
        for (d = d; d <= e; d++) {
            a.cell[c][d] = BLOCKED;
            a.cell[a.n_rows - c][d] = BLOCKED;
            a.cell[d][c] = BLOCKED;
            a.cell[d][a.n_cols - c] = BLOCKED
        }
    }
    return a
}

function hex_mask(a) {
    var b = Math.floor(a.n_rows / 2),
        c;
    for (c = 0; c <= a.n_rows; c++) {
        var d = Math.floor(Math.abs(c - b) * 0.57735) + 1,
            e = a.n_cols - d,
            g;
        for (g = 0; g <= a.n_cols; g++)
            if (g < d || g > e) a.cell[c][g] = BLOCKED
    }
    return a
}

function round_mask(a) {
    var b = a.n_rows / 2,
        c = a.n_cols / 2,
        d;
    for (d = 0; d <= a.n_rows; d++) {
        var e = Math.pow(d / b - 1, 2),
            g;
        for (g = 0; g <= a.n_cols; g++) {
            var f = Math.sqrt(e + Math.pow(g / c - 1, 2));
            if (f > 1) a.cell[d][g] = BLOCKED
        }
    }
    return a
}

/**
 * Takes the dungeon provided and creates rooms.
 * @param {any} dungeonOBJ
 */
function emplace_rooms(dungeonOBJ) {
    var room_size = get_dungeon_configuration("room_size", dungeonOBJ),
        room_layout = get_dungeon_configuration("room_layout", dungeonOBJ);
    dungeonOBJ.huge_rooms = room_size.huge;
    dungeonOBJ.complex_rooms = room_layout.complex;
    dungeonOBJ.n_rooms = 0;
    dungeonOBJ.room = [];
    return dungeonOBJ = dungeonOBJ.room_layout == "dense" ? dense_rooms(dungeonOBJ) :
        dungeonOBJ.room_layout == "scatter" ? scatter_rooms(dungeonOBJ) :
            sparse_rooms(dungeonOBJ);
}

function scatter_rooms(dungeon) {
    var b = alloc_rooms(dungeon),
        c;
    for (c = 0; c < b; c++) dungeon = emplace_room(dungeon);
    if (dungeon.huge_rooms) {
        b = alloc_rooms(dungeon, "medium");
        for (c = 0; c < b; c++) {
            var d = {
                size: "medium"
            };
            dungeon = emplace_room(dungeon, d)
        }
    }
    return dungeon
}

function sparse_rooms(dungeon) {
    var b = alloc_rooms(dungeon),
        c;
    for (c = 0; c < b; c++) dungeon = emplace_room(dungeon);
    if (dungeon.huge_rooms) {
        b = alloc_rooms(dungeon, "medium");
        for (c = 0; c < b; c++) {
            var d = {
                size: "medium"
            };
            dungeon = emplace_room(dungeon, d)
        }
    }
    return dungeon
}

function alloc_rooms(dungeon, b) {
    dungeon = dungeon;
    var c = b || dungeon.room_size;
    b = dungeon.n_cols * dungeon.n_rows;
    var d = dungeon_options.room_size[c];
    c = d.size || 2;
    d = d.radix || 5;
    c = c + d + 1;
    c = c * c;
    b = Math.floor(b / c) * 2;
    if (dungeon.room_layout == "sparse") b /= 13;
    if (dungeon.room_layout == "scatter") b /= 13;
    return b
}

function dense_rooms(dungeon) {
    var b;
    for (b = 0; b < dungeon.n_i; b++) {
        var c = b * 2 + 1,
            d;
        for (d = 0; d < dungeon.n_j; d++) {
            var e = d * 2 + 1;
            if (!(dungeon.cell[c][e] & ROOM))
                if (!((b == 0 || d == 0) && random(2) > 0)) {
                    var g = {
                        i: b,
                        j: d
                    };
                    dungeon = emplace_room(dungeon, g);
                    if (dungeon.huge_rooms)
                        if (!(dungeon.cell[c][e] & ROOM)) {
                            g = {
                                i: b,
                                j: d,
                                size: "medium"
                            };
                            dungeon = emplace_room(dungeon, g)
                        }
                }
        }
    }
    return dungeon
}

function emplace_room(dungeon, b) {
    dungeon = dungeon;
    if (dungeon.n_rooms == 999) return dungeon;
    var c = b || {};
    c = set_room(dungeon, c);
    b = c.i * 2 + 1;
    var d = c.j * 2 + 1,
        e = (c.i + c.height) * 2 - 1,
        g = (c.j + c.width) * 2 - 1;
    if (b < 1 || e > dungeon.max_row) return dungeon;
    if (d < 1 || g > dungeon.max_col) return dungeon;
    var f = sound_room(dungeon, b, d, e, g);
    if (f.blocked) return dungeon;
    f = $H(f).keys();
    var h = f.length;
    if (h == 0) {
        f = dungeon.n_rooms + 1;
        dungeon.n_rooms = f
    } else if (h == 1)
        if (dungeon.complex_rooms) {
            f = f[0];
            if (f != c.complex_id) return dungeon
        } else return dungeon;
    else return dungeon;
    for (h = b; h <= e; h++) {
        var i;
        for (i = d; i <= g; i++) {
            if (dungeon.cell[h][i] & ENTRANCE) dungeon.cell[h][i] &=
                ~ESPACE;
            else if (dungeon.cell[h][i] & PERIMETER) dungeon.cell[h][i] &= ~PERIMETER;
            dungeon.cell[h][i] |= ROOM | f << 6
        }
    }
    h = (e - b + 1) * 10;
    i = (g - d + 1) * 10;
    c = {
        id: f,
        size: c.size,
        row: b,
        col: d,
        north: b,
        south: e,
        west: d,
        east: g,
        height: h,
        width: i,
        door: {
            north: [],
            south: [],
            west: [],
            east: []
        }
    };
    if (h = dungeon.room[f])
        if (h.complex) h.complex.push(c);
        else {
            complex = {
                complex: [h, c]
            };
            dungeon.room[f] = complex
        }
    else dungeon.room[f] = c;
    for (h = b - 1; h <= e + 1; h++) {
        dungeon.cell[h][d - 1] & (ROOM | ENTRANCE) || (dungeon.cell[h][d - 1] |= PERIMETER);
        dungeon.cell[h][g + 1] & (ROOM | ENTRANCE) || (dungeon.cell[h][g + 1] |= PERIMETER)
    }
    for (i = d - 1; i <=
        g + 1; i++) {
        dungeon.cell[b - 1][i] & (ROOM | ENTRANCE) || (dungeon.cell[b - 1][i] |= PERIMETER);
        dungeon.cell[e + 1][i] & (ROOM | ENTRANCE) || (dungeon.cell[e + 1][i] |= PERIMETER)
    }
    return dungeon
}

function set_room(dungeon, b) {
    b.size || (b.size = dungeon.room_size);
    var c = dungeon_options.room_size[b.size],
        d = c.size || 2;
    c = c.radix || 5;
    if (!("height" in b))
        if ("i" in b) {
            var e = dungeon.n_i - d - b.i;
            if (e < 0) e = 0;
            e = e < c ? e : c;
            b.height = random(e) + d
        } else b.height = random(c) + d;
    if (!("width" in b))
        if ("j" in b) {
            e = dungeon.n_j - d - b.j;
            if (e < 0) e = 0;
            e = e < c ? e : c;
            b.width = random(e) + d
        } else b.width = random(c) + d;
    "i" in b || (b.i = random(dungeon.n_i - b.height));
    "j" in b || (b.j = random(dungeon.n_j - b.width));
    return b
}

function sound_room(dungeon, b, c, d, e) {
    var g = {};
    for (b = b; b <= d; b++) {
        var f;
        for (f = c; f <= e; f++) {
            if (dungeon.cell[b][f] & BLOCKED) return {
                blocked: 1
            };
            if (dungeon.cell[b][f] & ROOM) {
                var h = (dungeon.cell[b][f] & ROOM_ID) >> 6;
                g[h] += 1
            }
        }
    }
    return g
}
var connect = {};

function open_rooms(dungeon) {
    connect = {};
    var room;
    for (room = 1; room <= dungeon.n_rooms; room++) dungeon = open_room(dungeon, dungeon.room[room]);
    return dungeon
}

function open_room(dungeon, b) {
    var c = door_sills(dungeon, b);
    if (!c.length) return dungeon;
    var d = alloc_opens(dungeon, b),
        e;
    for (e = 0; e < d; e++) {
        var g = c.splice(random(c.length), 1).shift();
        if (!g) break;
        var f = g.door_r,
            h = g.door_c;
        f = dungeon.cell[f][h];
        if (!(f & DOORSPACE))
            if (f = g.out_id) {
                f = [b.id, f].sort(cmp_int).join(",");
                if (!connect[f]) {
                    dungeon = open_door(dungeon, b, g);
                    connect[f] = 1
                }
            } else dungeon = open_door(dungeon, b, g)
    }
    return dungeon
}

function cmp_int(a, b) {
    return a - b
}

function door_sills(a, b) {
    var c = a.cell,
        d, e = [];
    if (b.complex) b.complex.each(function(k) {
        k = door_sills(a, k);
        if (k.length) e = e.concat(k)
    });
    else {
        var g = b.north,
            f = b.south,
            h = b.west,
            i = b.east;
        if (g >= 3) {
            var j;
            for (j = h; j <= i; j += 2)
                if (d = check_sill(c, b, g, j, "north")) e.push(d)
        }
        if (f <= a.n_rows - 3)
            for (j = h; j <= i; j += 2)
                if (d = check_sill(c, b, f, j, "south")) e.push(d);
        if (h >= 3)
            for (j = g; j <= f; j += 2)
                if (d = check_sill(c, b, j, h, "west")) e.push(d);
        if (i <= a.n_cols - 3)
            for (j = g; j <= f; j += 2)
                if (d = check_sill(c, b, j, i, "east")) e.push(d)
    }
    return e
}

function check_sill(a, b, c, d, e) {
    var g = c + di[e],
        f = d + dj[e],
        h = a[g][f];
    if (!(h & PERIMETER)) return false;
    if (h & BLOCK_DOOR) return false;
    h = g + di[e];
    var i = f + dj[e];
    a = a[h][i];
    if (a & BLOCKED) return false;
    a = (a & ROOM_ID) >> 6;
    if (a == b.id) return false;
    return b = {
        sill_r: c,
        sill_c: d,
        dir: e,
        door_r: g,
        door_c: f,
        out_id: a
    }
}

function alloc_opens(a, b) {
    a = (b.south - b.north) / 2 + 1;
    b = (b.east - b.west) / 2 + 1;
    b = Math.floor(Math.sqrt(b * a));
    return b = b + random(b)
}
dungeon_options.doors.none.table = {
    "01-15": ARCH
};
dungeon_options.doors.basic.table = {
    "01-15": ARCH,
    "16-60": DOOR
};
dungeon_options.doors.secure.table = {
    "01-15": ARCH,
    "16-60": DOOR,
    "61-75": LOCKED
};
dungeon_options.doors.standard.table = {
    "01-15": ARCH,
    "16-60": DOOR,
    "61-75": LOCKED,
    "76-90": TRAPPED,
    "91-100": SECRET,
    "101-110": PORTC
};
dungeon_options.doors.deathtrap.table = {
    "01-15": ARCH,
    "16-30": TRAPPED,
    "31-40": SECRET
};

function open_door(a, b, c) {
    var d = get_dungeon_configuration("doors", a),
        e = d.table;
    d = c.door_r;
    var g = c.door_c,
        f = c.sill_r,
        h = c.sill_c,
        i = c.dir;
    c = c.out_id;
    var j;
    for (j = 0; j < 3; j++) {
        var k = f + di[i] * j,
            l = h + dj[i] * j;
        a.cell[k][l] &= ~PERIMETER;
        a.cell[k][l] |= ENTRANCE
    }
    e = select_from_table(e);
    f = {
        row: d,
        col: g
    };
    if (e == ARCH) {
        a.cell[d][g] |= ARCH;
        f.key = "arch";
        f.type = "Archway"
    } else if (e == DOOR) {
        a.cell[d][g] |= DOOR;
        f.key = "open";
        f.type = "Unlocked Door"
    } else if (e == LOCKED) {
        a.cell[d][g] |= LOCKED;
        f.key = "lock";
        f.type = "Locked Door"
    } else if (e == TRAPPED) {
        a.cell[d][g] |=
            TRAPPED;
        f.key = "trap";
        f.type = "Trapped Door"
    } else if (e == SECRET) {
        a.cell[d][g] |= SECRET;
        f.key = "secret";
        f.type = "Secret Door"
    } else if (e == PORTC) {
        a.cell[d][g] |= PORTC;
        f.key = "portc";
        f.type = "Portcullis"
    }
    if (c) f.out_id = c;
    b.door[i].push(f);
    b.last_door = f;
    return a
}

function label_rooms(dungeonOBJ) {
    var roomIDX;
    for (roomIDX = 1; roomIDX <= dungeonOBJ.n_rooms; roomIDX++) {
        var c = dungeonOBJ.room[roomIDX],
            d = c.id.toString(),
            e = d.length,
            g = Math.floor((c.north + c.south) / 2);
        c = Math.floor((c.west + c.east - e) / 2) + 1;
        var f;
        for (f = 0; f < e; f++) dungeonOBJ.cell[g][c + f] |= d.charCodeAt(f) << 24
    }
    return dungeonOBJ
}

function corridors(a) {
    var b = get_dungeon_configuration("corridor_layout", a);
    a.straight_pct = b.pct;
    for (b = 1; b < a.n_i; b++) {
        var c = b * 2 + 1,
            d;
        for (d = 1; d < a.n_j; d++) {
            var e = d * 2 + 1;
            a.cell[c][e] & CORRIDOR || (a = tunnel(a, b, d))
        }
    }
    return a
}

function tunnel(a, b, c, d) {
    d = tunnel_dirs(a, d);
    d.each(function(e) {
        if (open_tunnel(a, b, c, e)) {
            var g = b + di[e],
                f = c + dj[e];
            a = tunnel(a, g, f, e)
        }
    });
    return a
}

function tunnel_dirs(a, b) {
    var c = shuffle(dj_dirs);
    b && a.straight_pct && random(100) < a.straight_pct && c.unshift(b);
    return c
}

function shuffle(a) {
    a = a.concat();
    var b;
    for (b = a.length - 1; b > 0; b--) {
        var c = random(b + 1),
            d = a[b];
        a[b] = a[c];
        a[c] = d
    }
    return a
}

function open_tunnel(a, b, c, d) {
    var e = b * 2 + 1,
        g = c * 2 + 1;
    b = (b + di[d]) * 2 + 1;
    c = (c + dj[d]) * 2 + 1;
    d = (e + b) / 2;
    var f = (g + c) / 2;
    return sound_tunnel(a, d, f, b, c) ? delve_tunnel(a, e, g, b, c) : false
}

function sound_tunnel(a, b, c, d, e) {
    if (d < 0 || d > a.n_rows) return false;
    if (e < 0 || e > a.n_cols) return false;
    b = [b, d].sort(cmp_int);
    c = [c, e].sort(cmp_int);
    for (e = b[0]; e <= b[1]; e++)
        for (d = c[0]; d <= c[1]; d++)
            if (a.cell[e][d] & BLOCK_CORR) return false;
    return true
}

function delve_tunnel(a, b, c, d, e) {
    b = [b, d].sort(cmp_int);
    c = [c, e].sort(cmp_int);
    for (e = b[0]; e <= b[1]; e++)
        for (d = c[0]; d <= c[1]; d++) {
            a.cell[e][d] &= ~ENTRANCE;
            a.cell[e][d] |= CORRIDOR
        }
    return true
}

function emplace_stairs(a) {
    var b = stair_ends(a);
    if (!b.length) return a;
    var c = alloc_stairs(a);
    if (c == 0) return a;
    var d = [],
        e;
    for (e = 0; e < c; e++) {
        var g = b.splice(random(b.length), 1).shift();
        if (!g) break;
        var f = g.row,
            h = g.col,
            i = e < 2 ? e : random(2);
        if (i == 0) {
            a.cell[f][h] |= STAIR_DN;
            g.key = "down"
        } else {
            a.cell[f][h] |= STAIR_UP;
            g.key = "up"
        }
        d.push(g)
    }
    a.stair = d;
    return a
}

function stair_ends(a) {
    var b = a.cell,
        c = [],
        d;
    for (d = 0; d < a.n_i; d++) {
        var e = d * 2 + 1,
            g;
        for (g = 0; g < a.n_j; g++) {
            var f = g * 2 + 1;
            if (a.cell[e][f] == CORRIDOR) a.cell[e][f] & STAIRS || $H(stair_end).keys().each(function(h) {
                if (check_tunnel(b, e, f, stair_end[h])) {
                    var i = {
                        row: e,
                        col: f,
                        dir: h
                    };
                    h = stair_end[h].next;
                    i.next_row = i.row + h[0];
                    i.next_col = i.col + h[1];
                    c.push(i)
                }
            })
        }
    }
    return c
}
var stair_end = {
    north: {
        walled: [
            [1, -1],
            [0, -1],
            [-1, -1],
            [-1, 0],
            [-1, 1],
            [0, 1],
            [1, 1]
        ],
        corridor: [
            [0, 0],
            [1, 0],
            [2, 0]
        ],
        stair: [0, 0],
        next: [1, 0]
    },
    south: {
        walled: [
            [-1, -1],
            [0, -1],
            [1, -1],
            [1, 0],
            [1, 1],
            [0, 1],
            [-1, 1]
        ],
        corridor: [
            [0, 0],
            [-1, 0],
            [-2, 0]
        ],
        stair: [0, 0],
        next: [-1, 0]
    },
    west: {
        walled: [
            [-1, 1],
            [-1, 0],
            [-1, -1],
            [0, -1],
            [1, -1],
            [1, 0],
            [1, 1]
        ],
        corridor: [
            [0, 0],
            [0, 1],
            [0, 2]
        ],
        stair: [0, 0],
        next: [0, 1]
    },
    east: {
        walled: [
            [-1, -1],
            [-1, 0],
            [-1, 1],
            [0, 1],
            [1, 1],
            [1, 0],
            [1, -1]
        ],
        corridor: [
            [0, 0],
            [0, -1],
            [0, -2]
        ],
        stair: [0, 0],
        next: [0, -1]
    }
};

function check_tunnel(a, b, c, d) {
    var e = true,
        g;
    if (g = d.corridor) {
        g.each(function(f) {
            if (a[b + f[0]])
                if (a[b + f[0]][c + f[1]] != CORRIDOR) e = false
        });
        if (!e) return false
    }
    if (d = d.walled) {
        d.each(function(f) {
            if (a[b + f[0]])
                if (a[b + f[0]][c + f[1]] & OPENSPACE) e = false
        });
        if (!e) return false
    }
    return true
}

function alloc_stairs(dungeonOBJ) {
    var b = 0;
    if (dungeonOBJ.add_stairs == "many") {
        dungeonOBJ = dungeonOBJ.n_cols * dungeonOBJ.n_rows;
        b = 3 + random(Math.floor(dungeonOBJ / 1E3))
    } else if (dungeonOBJ.add_stairs == "yes") b = 2;
    return b
}

function peripheral_egress(a) {
    return a
}

function gelatinous_cube(dungeonOBJ) {
    if (dungeonOBJ.remove_deadends) dungeonOBJ = remove_deadends(dungeonOBJ);
    if (dungeonOBJ.remove_deadends)
        if (dungeonOBJ.corridor_layout == "errant") dungeonOBJ.close_arcs = dungeonOBJ.remove_pct;
        else if (dungeonOBJ.corridor_layout == "straight") dungeonOBJ.close_arcs = dungeonOBJ.remove_pct;
    if (dungeonOBJ.close_arcs) dungeonOBJ = close_arcs(dungeonOBJ);
    dungeonOBJ = fix_doors(dungeonOBJ);
    return dungeonOBJ = empty_blocks(dungeonOBJ)
}

function remove_deadends(dungeonOBJ) {
    var remove_pct = get_dungeon_configuration("remove_deadends", dungeonOBJ);
    dungeonOBJ.remove_pct = remove_pct.pct;
    remove_pct = dungeonOBJ.remove_pct;
    return collapse_tunnels(dungeonOBJ, remove_pct, close_end)
}
var close_end = {
    north: {
        walled: [
            [0, -1],
            [1, -1],
            [1, 0],
            [1, 1],
            [0, 1]
        ],
        close: [
            [0, 0]
        ],
        recurse: [-1, 0]
    },
    south: {
        walled: [
            [0, -1],
            [-1, -1],
            [-1, 0],
            [-1, 1],
            [0, 1]
        ],
        close: [
            [0, 0]
        ],
        recurse: [1, 0]
    },
    west: {
        walled: [
            [-1, 0],
            [-1, 1],
            [0, 1],
            [1, 1],
            [1, 0]
        ],
        close: [
            [0, 0]
        ],
        recurse: [0, -1]
    },
    east: {
        walled: [
            [-1, 0],
            [-1, -1],
            [0, -1],
            [1, -1],
            [1, 0]
        ],
        close: [
            [0, 0]
        ],
        recurse: [0, 1]
    }
};

function close_arcs(a) {
    var b = a.close_arcs;
    return collapse_tunnels(a, b, close_arcs)
}
var close_arc = {
    "north-west": {
        corridor: [
            [0, 0],
            [-1, 0],
            [-2, 0],
            [-2, -1],
            [-2, -2],
            [-1, -2],
            [0, -2]
        ],
        walled: [
            [-1, 1],
            [-2, 1],
            [-3, 1],
            [-3, 0],
            [-3, -1],
            [-3, -2],
            [-3, -3],
            [-2, -3],
            [-1, -3],
            [0, -1],
            [-1, -1]
        ],
        close: [
            [-1, 0],
            [-2, 0],
            [-2, -1],
            [-2, -2],
            [-1, -2]
        ],
        open: [0, -1],
        recurse: [2, 0]
    },
    "north-east": {
        corridor: [
            [0, 0],
            [-1, 0],
            [-2, 0],
            [-2, 1],
            [-2, 2],
            [-1, 2],
            [0, 2]
        ],
        walled: [
            [-1, -1],
            [-2, -1],
            [-3, -1],
            [-3, 0],
            [-3, 1],
            [-3, 2],
            [-3, 3],
            [-2, 3],
            [-1, 3],
            [0, 1],
            [-1, 1]
        ],
        close: [
            [-1, 0],
            [-2, 0],
            [-2, 1],
            [-2, 2],
            [-1, 2]
        ],
        open: [0, 1],
        recurse: [2, 0]
    },
    "south-west": {
        corridor: [
            [0,
                0
            ],
            [1, 0],
            [2, 0],
            [2, -1],
            [2, -2],
            [1, -2],
            [0, -2]
        ],
        walled: [
            [1, 1],
            [2, 1],
            [3, 1],
            [3, 0],
            [3, -1],
            [3, -2],
            [3, -3],
            [2, -3],
            [1, -3],
            [0, -1],
            [1, -1]
        ],
        close: [
            [1, 0],
            [2, 0],
            [2, -1],
            [2, -2],
            [1, -2]
        ],
        open: [0, -1],
        recurse: [-2, 0]
    },
    "south-east": {
        corridor: [
            [0, 0],
            [1, 0],
            [2, 0],
            [2, 1],
            [2, 2],
            [1, 2],
            [0, 2]
        ],
        walled: [
            [1, -1],
            [2, -1],
            [3, -1],
            [3, 0],
            [3, 1],
            [3, 2],
            [3, 3],
            [2, 3],
            [1, 3],
            [0, 1],
            [1, 1]
        ],
        close: [
            [1, 0],
            [2, 0],
            [2, 1],
            [2, 2],
            [1, 2]
        ],
        open: [0, 1],
        recurse: [-2, 0]
    },
    "west-north": {
        corridor: [
            [0, 0],
            [0, -1],
            [0, -2],
            [-1, -2],
            [-2, -2],
            [-2, -1],
            [-2, 0]
        ],
        walled: [
            [1, -1],
            [1, -2],
            [1, -3],
            [0, -3],
            [-1, -3],
            [-2, -3],
            [-3, -3],
            [-3, -2],
            [-3, -1],
            [-1, 0],
            [-1, -1]
        ],
        close: [
            [0, -1],
            [0, -2],
            [-1, -2],
            [-2, -2],
            [-2, -1]
        ],
        open: [-1, 0],
        recurse: [0, 2]
    },
    "west-south": {
        corridor: [
            [0, 0],
            [0, -1],
            [0, -2],
            [1, -2],
            [2, -2],
            [2, -1],
            [2, 0]
        ],
        walled: [
            [-1, -1],
            [-1, -2],
            [-1, -3],
            [0, -3],
            [1, -3],
            [2, -3],
            [3, -3],
            [3, -2],
            [3, -1],
            [1, 0],
            [1, -1]
        ],
        close: [
            [0, -1],
            [0, -2],
            [1, -2],
            [2, -2],
            [2, -1]
        ],
        open: [1, 0],
        recurse: [0, 2]
    },
    "east-north": {
        corridor: [
            [0, 0],
            [0, 1],
            [0, 2],
            [-1, 2],
            [-2, 2],
            [-2, 1],
            [-2, 0]
        ],
        walled: [
            [1, 1],
            [1, 2],
            [1, 3],
            [0, 3],
            [-1, 3],
            [-2, 3],
            [-3, 3],
            [-3, 2],
            [-3, 1],
            [-1, 0],
            [-1, 1]
        ],
        close: [
            [0, 1],
            [0, 2],
            [-1, 2],
            [-2, 2],
            [-2, 1]
        ],
        open: [-1, 0],
        recurse: [0, -2]
    },
    "east-south": {
        corridor: [
            [0, 0],
            [0, 1],
            [0, 2],
            [1, 2],
            [2, 2],
            [2, 1],
            [2, 0]
        ],
        walled: [
            [-1, 1],
            [-1, 2],
            [-1, 3],
            [0, 3],
            [1, 3],
            [2, 3],
            [3, 3],
            [3, 2],
            [3, 1],
            [1, 0],
            [1, 1]
        ],
        close: [
            [0, 1],
            [0, 2],
            [1, 2],
            [2, 2],
            [2, 1]
        ],
        open: [1, 0],
        recurse: [0, -2]
    }
};


/**
 * 
 * @param {any} dungeonOBJ
 * @param {number} remove_pct
 * @param {any} close_end
 */
function collapse_tunnels(dungeonOBJ, remove_pct, close_end) {
    var everything = remove_pct == 100,
        cell;
    for (cell = 0; cell < dungeonOBJ.n_i; cell++) {
        var x = cell * 2 + 1,
            f;
        for (f = 0; f < dungeonOBJ.n_j; f++) {
            var y = f * 2 + 1;
            if (dungeonOBJ.cell[x][y] & OPENSPACE &&
                !(dungeonOBJ.cell[x][y] & STAIRS))
                    if (everything || random(100) < remove_pct) dungeonOBJ = collapse(dungeonOBJ, x, y, close_end)
        }
    }
    return dungeonOBJ
}

function collapse(a, b, c, d) {
    var e = a.cell;
    if (!(a.cell[b][c] & OPENSPACE)) return a;
    $H(d).keys().each(function(g) {
        if (check_tunnel(e, b, c, d[g])) {
            var f;
            if (f = d[g].close) f.each(function(h) {
                e[b + h[0]][c + h[1]] = NOTHING
            });
            if (f = d[g].open) e[b + f[0]][c + f[1]] |= CORRIDOR;
            if (g = d[g].recurse) a = collapse(a, b + g[0], c + g[1], d)
        }
    });
    a.cell = e;
    return a
}

function fix_doors(a) {
    var b = {},
        c = [];
    a.room.each(function(d) {
        var e = d.id;
        $H(d.door).keys().each(function(g) {
            var f = [];
            d.door[g].each(function(h) {
                var i = h.row,
                    j = h.col,
                    k = a.cell[i][j];
                if (k & OPENSPACE) {
                    i = [i, j].join(",");
                    if (b[i]) f.push(h);
                    else {
                        if (j = h.out_id) {
                            k = a.room[j];
                            var l = opposite[g];
                            h.out_id = {};
                            h.out_id[e] = j;
                            h.out_id[j] = e;
                            k.door[l].push(h)
                        }
                        f.push(h);
                        b[i] = true
                    }
                }
            });
            if (f.length) {
                d.door[g] = f;
                c = c.concat(f)
            } else d.door[g] = []
        })
    });
    a.door = c;
    return a
}

function empty_blocks(a) {
    var b = a.cell,
        c;
    for (c = 0; c <= a.n_rows; c++) {
        var d;
        for (d = 0; d <= a.n_cols; d++)
            if (b[c][d] & BLOCKED) b[c][d] = NOTHING
    }
    a.cell = b;
    return a
}
var palette = {
        standard: {
            colors: {
                fill: "#000000",
                open: "#ffffff",
                open_grid: "#cccccc"
            }
    },
    ink_miser: {
        colors: {
            fill: "#ffffff",
            open: "#ffffff",
            open_grid: "#cccccc",
            wall: "#666666",
            door: "#333333",
            label: "#333333",
            tag: "#666666"
        }
    },
        classic: {
            colors: {
                fill: "#3399cc",
                open: "#ffffff",
                open_grid: "#3399cc",
                hover: "#b6def2"
            }
        },
        graph: {
            colors: {
                fill: "#ffffff",
                open: "#ffffff",
                grid: "#c9ebf5",
                wall: "#666666",
                wall_shading: "#666666",
                door: "#333333",
                label: "#333333",
                tag: "#666666"
            }
        }
    },
    color_chain = {
        door: "fill",
        label: "fill",
        stair: "wall",
        wall: "fill",
        fill: "black",
        tag: "white"
    };

function image_dungeon_setup(dungeon) {
    var map_details = scale_dungeon(dungeon),
        dungeon_image = new_image(map_details.width, map_details.height),
        palette = get_palette(map_details);
    dungeon['map_details'] = map_details;
    dungeon['dungeon_image'] = dungeon_image;
    dungeon['map_details'].palette = get_palette(dungeon['map_details']);
    dungeon['map_details'].base_layer = base_layer(dungeon, dungeon['map_details'], dungeon['dungeon_image']);
    fill_image(dungeon, dungeon['map_details'], dungeon['dungeon_image']);
    open_cells(dungeon, dungeon['map_details'], dungeon['dungeon_image']);
    image_walls(dungeon, dungeon['map_details'], dungeon['dungeon_image']);
    dungeon['dungeon_base_image'] = dungeon_image;
}

function image_dungeon_player(dungeon) {
    image_dungeon_setup(dungeon)

    if (dungeon.door) image_doors(dungeon, dungeon['map_details'], dungeon['dungeon_image']);
    image_labels(dungeon, dungeon['map_details'], dungeon['dungeon_image']);
    if (dungeon.stair) image_stairs(dungeon, dungeon['map_details'], dungeon['dungeon_image'])
}

function image_dungeon_gm(dungeon) {
    image_dungeon_setup(dungeon)

    if (dungeon.door) image_doors(dungeon, dungeon['map_details'], dungeon['dungeon_image']);
    image_labels(dungeon, dungeon['map_details'], dungeon['dungeon_image']);
    if (dungeon.stair) image_stairs(dungeon, dungeon['map_details'], dungeon['dungeon_image'])
}

/**
 * Sets the width and height of the canvas
 * @param {number} width
 * @param {number} height
 */
function new_image(width, height) {
    var canvas = $("map");
    canvas.width = width;
    canvas.height = height;
    return canvas.getContext("2d")
}

function scale_dungeon(dungeon) {
    var b = {
        map_style: dungeon.map_style,
        grid: dungeon.grid,
        cell_size: dungeon.cell_size,
        width: 0,
        height: 0,
        max_x: 0,
        max_y: 0,
        font: 12
    };
    b.width = (dungeon.n_cols + 1) * b.cell_size + 1;
    b.height = (dungeon.n_rows + 1) * b.cell_size + 1;
    b.max_x = b.width - 1;
    b.max_y = b.height - 1;
    var font_size = Math.floor(b.cell_size * 0.75);
    b.font = font_size.toString() + "px sans-serif";
    return b
}

function get_palette(dungeonOBJ) {
    var b;
    b = dungeonOBJ.palette ? dungeonOBJ.palette : (style = dungeonOBJ.map_style) ? palette[style] ? palette[style] : palette.standard : palette.standard;
    var c;
    if (c = b.colors) $H(c).keys().each(function(d) {
        b[d] = c[d]
    });
    b.black || (b.black = "#000000");
    b.white || (b.white = "#ffffff");
    return b
}

function get_color(a, b) {
    for (; b;) {
        if (a[b]) return a[b];
        b = color_chain[b]
    }
    return "#000000"
}

function base_layer(dungeon, map_details, dungeon_image) {
    var canvas = new Element("canvas");
    canvas.width = map_details.width;
    canvas.height = map_details.height;
    var draw_context = canvas.getContext("2d"),
        e = map_details.max_x,
        g = map_details.max_y,
        palette = map_details.palette,
        gridyness;
    (gridyness = palette.open) ? fill_rect(draw_context, 0, 0, e, g, gridyness): fill_rect(draw_context, 0, 0, e, g, palette.white);
    if (gridyness = palette.open_grid) image_grid(dungeon, map_details, gridyness, draw_context);
    else if (gridyness = palette.grid) image_grid(dungeon, map_details, gridyness, draw_context);
    return canvas
}

function image_grid(dungeon, map_details, gridyness, draw_context) {
    if (dungeon.grid != "none")
        if (dungeon.grid == "hex") hex_grid(dungeon, map_details, gridyness, draw_context);
        else dungeon.grid == "vex" ? vex_grid(dungeon, map_details, gridyness, draw_context) : square_grid(dungeon, map_details, gridyness, draw_context);
    return true
}

function square_grid(dungeon, map_details, gridyness, draw_context) {
    var cell_size = map_details.cell_size * hex_scale;
    var e;
    for (e = 0; e <= map_details.max_x; e += cell_size) draw_line(draw_context, e, 0, e, map_details.max_y, gridyness);
    for (e = 0; e <= map_details.max_y; e += cell_size) draw_line(draw_context, 0, e, map_details.max_x, e, gridyness);
    return true
}

function hex_grid(dungeon, map_details, gridyness, draw_context) {
    // cell size is 10 yards
    var cell_size = map_details.cell_size * hex_scale;
    var width_ratio = cell_size / 3.4641016151;
    cell_size = cell_size / 2;
    var g = map_details.width / (3 * width_ratio);
    map_details = map_details.height / cell_size;
    var f;
    for (f = 0; f < g; f++) {
        var h = f * 3 * width_ratio,
            i = h + width_ratio,
            j = h + 3 * width_ratio,
            k;
        for (k = 0; k < map_details; k++) {
            var l = k * cell_size,
                o = l + cell_size;
            if ((f + k) % 2 != 0) {
                draw_line(draw_context, h, l, i, o, gridyness);
                draw_line(draw_context, i, o, j, o, gridyness)
            } else draw_line(draw_context, i, l, h, o, gridyness)
        }
    }
    return true
}

function vex_grid(a, b, c, d) {
    var e = b.cell_size * hex_scale;
    a = e / 2;
    e = e / 3.4641016151;
    var g = b.width / a;
    b = b.height / (3 * e);
    var f;
    for (f = 0; f < b; f++) {
        var h = f * 3 * e,
            i = h + e,
            j = h + 3 * e,
            k;
        for (k = 0; k < g; k++) {
            var l = k * a,
                o = l + a;
            if ((f + k) % 2 != 0) {
                draw_line(d, l, h, o, i, c);
                draw_line(d, o, i, o, j, c)
            } else draw_line(d, l, i, o, h, c)
        }
    }
    return true
}

function fill_image(image, b, c) {
    var d = b.max_x,
        e = b.max_y,
        palette = b.palette,
        f;
    (f = palette.fill) ? fill_rect(c, 0, 0, d, e, f): fill_rect(c, 0, 0, d, e, palette.black);
    if (f = palette.fill) fill_rect(c, 0, 0, d, e, f);
    if (f = palette.fill_grid) image_grid(image, b, f, c);
    else if (f = palette.grid) image_grid(image, b, f, c);
    return true
}

function open_cells(dungeon, map_details, image) {
    var cell_size = map_details.cell_size;
    map_details = map_details.base_layer;
    var y;
    for (y = 0; y <= dungeon.n_rows; y++) {
        var ypos = y * cell_size,
            x;
        for (x = 0; x <= dungeon.n_cols; x++)
            if (dungeon.cell[y][x] & OPENSPACE) {
                var xpos = x * cell_size;
                image.drawImage(map_details, xpos, ypos, cell_size, cell_size, xpos, ypos, cell_size, cell_size)
            }
    }
    return true
}

function image_walls(image, b, c) {
    var d = b.cell_size,
        e = Math.floor(d / 4);
    if (e < 3) e = 3;
    b = b.palette;
    var g;
    cache_pixels(true);
    var f;
    for (f = 0; f <= image.n_rows; f++) {
        var h = f * d,
            i = h + d,
            j;
        for (j = 0; j <= image.n_cols; j++)
            if (image.cell[f][j] & OPENSPACE) {
                var k = j * d,
                    l = k + d;
                if (g = b.bevel_nw) {
                    image.cell[f][j - 1] & OPENSPACE || draw_line(c, k - 1, h, k - 1, i, g);
                    image.cell[f - 1][j] & OPENSPACE || draw_line(c, k, h - 1, l, h - 1, g);
                    if (g = b.bevel_se) {
                        image.cell[f][j + 1] & OPENSPACE || draw_line(c, l + 1, h + 1, l + 1, i, g);
                        image.cell[f + 1][j] & OPENSPACE || draw_line(c, k + 1, i + 1, l, i + 1, g)
                    }
                } else if (g = b.wall_shading) {
                    image.cell[f -
                        1][j - 1] & OPENSPACE || wall_shading(c, k - e, h - e, k - 1, h - 1, g);
                    image.cell[f - 1][j] & OPENSPACE || wall_shading(c, k, h - e, l, h - 1, g);
                    image.cell[f - 1][j + 1] & OPENSPACE || wall_shading(c, l + 1, h - e, l + e, h - 1, g);
                    image.cell[f][j - 1] & OPENSPACE || wall_shading(c, k - e, h, k - 1, i, g);
                    image.cell[f][j + 1] & OPENSPACE || wall_shading(c, l + 1, h, l + e, i, g);
                    image.cell[f + 1][j - 1] & OPENSPACE || wall_shading(c, k - e, i + 1, k - 1, i + e, g);
                    image.cell[f + 1][j] & OPENSPACE || wall_shading(c, k, i + 1, l, i + e, g);
                    image.cell[f + 1][j + 1] & OPENSPACE || wall_shading(c, l + 1, i + 1, l + e, i + e, g)
                }
                if (g = b.wall) {
                    image.cell[f - 1][j] & OPENSPACE ||
                        draw_line(c, k, h, l, h, g);
                    image.cell[f][j - 1] & OPENSPACE || draw_line(c, k, h, k, i, g);
                    image.cell[f][j + 1] & OPENSPACE || draw_line(c, l, h, l, i, g);
                    image.cell[f + 1][j] & OPENSPACE || draw_line(c, k, i, l, i, g)
                }
            }
    }
    dump_pixels(c);
    return true
}

function wall_shading(a, b, c, d, e, g) {
    for (b = b; b <= d; b++) {
        var f;
        for (f = c; f <= e; f++)(b + f) % 2 != 0 && set_pixel(a, b, f, g)
    }
    return true
}

function image_doors(image, b, c) {
    var d = image.door,
        e = b.cell_size,
        g = Math.floor(e / 6),
        f = Math.floor(e / 4),
        h = Math.floor(e / 3);
    b = b.palette;
    var i = get_color(b, "wall"),
        j = get_color(b, "door");
    d.each(function (k) {
        var l = k.row,
            o = l * e,
            p = k.col,
            q = p * e;
        k = door_attr(k);
        var r = image.cell[l][p - 1] & OPENSPACE;
        l = o + e;
        p = q + e;
        var m = Math.floor((o + l) / 2),
            n = Math.floor((q + p) / 2);
        if (k.wall) r ? draw_line(c, n, o, n, l, i) : draw_line(c, q, m, p, m, i);
        if (k.arch)
            if (r) {
                fill_rect(c, n - 1, o, n + 1, o + g, i);
                fill_rect(c, n - 1, l - g, n + 1, l, i)
            } else {
                fill_rect(c, q, m - 1, q + g, m + 1, i);
                fill_rect(c,
                    p - g, m - 1, p, m + 1, i)
            }
        if (k.door) r ? stroke_rect(c, n - f, o + g + 1, n + f, l - g - 1, j) : stroke_rect(c, q + g + 1, m - f, p - g - 1, m + f, j);
        if (k.lock) r ? draw_line(c, n, o + g + 1, n, l - g - 1, j) : draw_line(c, q + g + 1, m, p - g - 1, m, j);
        if (k.trap) r ? draw_line(c, n - h, m, n + h, m, j) : draw_line(c, n, m - h, n, m + h, j);
        if (k.secret)
            if (r) {
                draw_line(c, n - 1, m - f, n + 2, m - f, j);
                draw_line(c, n - 2, m - f + 1, n - 2, m - 1, j);
                draw_line(c, n - 1, m, n + 1, m, j);
                draw_line(c, n + 2, m + 1, n + 2, m + f - 1, j);
                draw_line(c, n - 2, m + f, n + 1, m + f, j)
            } else {
                draw_line(c, n - f, m - 2, n - f, m + 1, j);
                draw_line(c, n - f + 1, m + 2, n - 1, m + 2, j);
                draw_line(c, n, m -
                    1, n, m + 1, j);
                draw_line(c, n + 1, m - 2, n + f - 1, m - 2, j);
                draw_line(c, n + f, m - 1, n + f, m + 2, j)
            }
        if (k.portc)
            if (r)
                for (o = o + g + 2; o < l - g; o += 2) set_pixel(c, n, o, j);
            else
                for (o = q + g + 2; o < p - g; o += 2) set_pixel(c, o, m, j)
    });
    return true
}


function door_attr(a) {
    var b;
    if (a.key == "arch") b = {
        arch: 1
    };
    else if (a.key == "open") b = {
        arch: 1,
        door: 1
    };
    else if (a.key == "lock") b = {
        arch: 1,
        door: 1,
        lock: 1
    };
    else if (a.key == "trap") {
        b = {
            arch: 1,
            door: 1,
            trap: 1
        };
        if (/Lock/.test(a.desc)) b.lock = 1
    } else if (a.key == "secret") b = {
        wall: 1,
        arch: 1,
        secret: 1
    };
    else if (a.key == "portc") b = {
        arch: 1,
        portc: 1
    };
    return b
}

function image_labels(a, b, c) {
    var d = b.cell_size,
        e = Math.floor(d / 2),
        g = b.palette;
    b = b.font;
    g = get_color(g, "label");
    var f;
    for (f = 0; f <= a.n_rows; f++) {
        var h;
        for (h = 0; h <= a.n_cols; h++)
            if (a.cell[f][h] & OPENSPACE) {
                var i = cell_label(a.cell[f][h]);
                if (i) {
                    var j = f * d + e + 1,
                        k = h * d + e;
                    draw_string(c, i, k, j, b, g)
                }
            }
    }
    return true
}

function cell_label(a) {
    a = a >> 24 & 255;
    if (a == 0) return false;
    a = String.fromCharCode(a);
    if (!/^\w/.test(a)) return false;
    if (/[hjkl]/.test(a)) return false;
    return a
}

function image_stairs(a, b, c) {
    a = a.stair;
    var d = scale_stairs(b.cell_size);
    b = b.palette;
    var e = get_color(b, "stair");
    a.each(function(g) {
        var f = stair_dim(g, d);
        g.key == "up" ? image_ascend(f, e, c) : image_descend(f, e, c)
    });
    return true
}

function scale_stairs(a) {
    a = {
        cell: a,
        len: a * 2,
        side: Math.floor(a / 2),
        tread: Math.floor(a / 20) + 2,
        down: {}
    };
    var b;
    for (b = 0; b < a.len; b += a.tread) a.down[b] = Math.floor(b / a.len * a.side);
    return a
}

function stair_dim(a, b) {
    if (a.next_row != a.row) {
        var c = Math.floor((a.col + 0.5) * b.cell);
        a = tread_list(a.row, a.next_row, b);
        var d = a.shift();
        a = {
            xc: c,
            y1: d,
            list: a
        }
    } else {
        c = Math.floor((a.row + 0.5) * b.cell);
        a = tread_list(a.col, a.next_col, b);
        d = a.shift();
        a = {
            yc: c,
            x1: d,
            list: a
        }
    }
    a.side = b.side;
    a.down = b.down;
    return a
}

function tread_list(a, b, c) {
    var d = [];
    if (b > a) {
        a = a * c.cell;
        d.push(a);
        b = (b + 1) * c.cell;
        for (a = a; a < b; a += c.tread) d.push(a)
    } else if (b < a) {
        a = (a + 1) * c.cell;
        d.push(a);
        b = b * c.cell;
        for (a = a; a > b; a -= c.tread) d.push(a)
    }
    return d
}

function image_ascend(a, b, c) {
    if (a.xc) {
        var d = a.xc - a.side,
            e = a.xc + a.side;
        a.list.each(function(h) {
            draw_line(c, d, h, e, h, b)
        })
    } else {
        var g = a.yc - a.side,
            f = a.yc + a.side;
        a.list.each(function(h) {
            draw_line(c, h, g, h, f, b)
        })
    }
    return true
}

function image_descend(a, b, c) {
    if (a.xc) {
        var d = a.xc;
        a.list.each(function(g) {
            var f = a.down[Math.abs(g - a.y1)];
            draw_line(c, d - f, g, d + f, g, b)
        })
    } else {
        var e = a.yc;
        a.list.each(function(g) {
            var f = a.down[Math.abs(g - a.x1)];
            draw_line(c, g, e - f, g, e + f, b)
        })
    }
    return true
}

function save_map() {
    save_canvas($("map"), $("dungeon_name").getValue() + ".png")
}
document.observe("dom:loaded", init_form);