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
    $("Resolution").observe("change", new_dungeon);
    $("remote_treasure").observe("change", new_dungeon);
    // go through the various dropdowns and populate them from the lists in this file
    // and then observe them
    $H(dungeon_options).keys().each(function(key_primus) {
        $H(dungeon_options[key_primus]).keys().each(function(key_secondus) {
            var option_text = dungeon_options[key_primus][key_secondus].title;
            $(key_primus).insert(create_option(key_secondus, option_text))
        });
        $(key_primus).observe("change", new_dungeon)
        $(key_primus).observe("change", save_dungeon_configuration)
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
 * Save dungeon configuration in localStorage.
 * @param {string} set_item_key - Key to setItem in localStorage. Default: 'last_saved_query'
 */
function save_dungeon_configuration(set_item_key) {
    if(typeof(set_item_key) == 'undefined') {
        set_item_key = 'last_saved_query';
    }

    var dungeon_options_to_save = {};
    $H(dungeon_options).keys().each(function(key_primus) {
        dungeon_options_to_save[key_primus] = $(key_primus).getValue();
    });
	if (supports_local_storage())
    	localStorage.setItem(set_item_key, JSON.stringify(dungeon_options_to_save));
}

/**
 * Create a new dungeon, generate an image for the new dungeon.
 * 
 * Also saves current configuration to localStorage under the key 'last_saved_query'
 */
function new_dungeon() {
    var dungeonOBJ = create_dungeon();
    dungeonOBJ.challenge = 'average';
    image_dungeon_player(dungeonOBJ);
    html_dungeon_details(dungeonOBJ);
    html_room_details(dungeonOBJ);
}

function html_dungeon_details(dungeonOBJ){
    var dungeonDiv = document.createElement('div');
    dungeonDiv.id = 'dungeon';
    dungeonDiv.className = 'dungeon';
    
    html_light(dungeonDiv, dungeonOBJ['dungeon_overall']);
    var dungeon_key = document.getElementById('dungeon_key');
    while (dungeon_key.firstChild) {
        dungeon_key.removeChild(dungeon_key.firstChild);
    }
    dungeon_key.appendChild(dungeonDiv);
}

function html_room_details(dungeonOBJ) {
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

        html_room_title(div, room['id']);
        html_room_doors(div, room);
        html_light(div, room)
        html_room_decoration(div, room);

        html_room_features(div, room);
        html_room_treasures_prepare(div, room);

        html_room_monsters(div, room);
        html_room_traps(div, room);
        room_key.appendChild(div);

        // generally done async
        room = treasure_room(room, dungeonOBJ.cer, div);
    }
}

function html_room_title(element, number) {

    var title = document.createElement('h2');
    title.innerText = 'Room ' + number;
    element.appendChild(title);

}

/*
door : east : Array(1)
  0 : {row: 35, col: 8, key: "open", type: "Unlocked Door"}
length : 1
north : Array(0)
length : 0
south : Array(1)
  0 : {row: 36, col: 1, key: "open", type: "Unlocked Door"}
*/
function html_room_doors(element, room) {
    var div = document.createElement('div');
    div.setAttribute('id','doors');
    // add_labeled_text(description, 'Doors: ',
    //     'This room has doors.');
    var doors = room.door;
    for(var d = 0; d < 4; d++){
        var dir = Object.keys(doors)[d];
        var door_count = doors[dir].length;
        for (var i = 0; i < door_count; i++)
        {
            var description = document.createElement('p');
            var door_name, door_desc;
            door_name = title_case_sentance(dir+ ' ' + 'door')  + (door_count > 1 ?' #' + ( i + 1 ):'') + ': ';
            door_desc = inform_door(doors[dir][i].key) ;
            add_labeled_text(description, door_name, door_desc);
            div.appendChild(description);
        }
    }

    element.appendChild(div);
}

/**
 * Looks up the kind of doorway and returns an appropriate description (pulling from a random table where necessary).
 * @param {string} door_type 
 * @returns {string}
 */
function inform_door (door_type){
    var door_object = getPropertyBySubPropertyValue(door_types, 'key', door_type);
    var door_text = door_object.type;

    if (door_object.mask & DOORTABLE)
        door_text = door_text + '; ' + select_from_weighted_table(doorsList).Description;
    else if (door_object.mask & PORTC)
        door_text = door_text + '; ' + select_from_weighted_table(portcullisesList).Description;
    /*
    if (door_object.mask | LOCKED)

    if (door_object.mask | TRAPPED)
    */

    if (door_object.mask & SECRET)
        door_text = door_text + '; ' + select_from_weighted_table(concealment).Description;
    door_text += '.';

    return door_text;
}

function html_room_decoration(element, room) {
    var description = document.createElement('p');
    add_labeled_text(description, 'Description: ',
        'This room is ' + room['width'] + ' feet wide and ' + room['height'] + ' feet long. ' +
        room['description'].join('. ') + '.');

    element.appendChild(description);
}

function html_room_features(element, room) {
    var contents = document.createElement('p');
    add_labeled_list(contents, 'Contents: ', room['contents']);
    element.appendChild(contents);
}

function html_room_treasures_prepare(element, room) {
    // Creates an empty node.
    // Node is populated later due to asynchronous treasure fetching.
    room.treasure_node = document.createElement('div');
    room.treasure_node.id = 'treasure';
    element.appendChild(room.treasure_node);

    room.container_node = document.createElement('div');
    room.container_node.id = 'container';
    element.appendChild(room.container_node);
}

function html_light(element, room){
    var contents = document.createElement('p');
    if (room['light'] == undefined){
        add_labeled_text(contents, 'Light: ', 'Light generation error');
    }
    else {
        var contents = document.createElement('p');
        room['light'].forEach(lt => {
            var lightDesc = lt.Description;
            if (lt.Penalty != 0) lightDesc +=  ' (' + lt.Penalty + ' light penalty)';
            add_labeled_text(contents, 'Light: ', lightDesc);
        });
    }
    element.appendChild(contents);
}

function html_room_monsters(element, room) {
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
        add_labeled_list(contents, (room['monsters'].length>1) ?
            'Monsters (Total CER '+ room['cer_total'] + '): ' :
            'Monsters: '
            , mons);
        container.appendChild(contents);
    }
}

function html_treasures(element, room) {
    if (room['treasure'].length > 0){
        add_labeled_list(room.treasure_node, 'Treasures: ', room['treasure']);
    }
}

function html_container(element, room) {
    console.log("Container for room "+ room.id + " being sent to HTML");
    if (room['container'].length > 0){
        add_labeled_list(room.container_node, 'Containers: ', room['container']);
    }
}

function html_room_traps(element, room) {
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
        /* var text_node = document.createElement('span');
        text_node.className  = 'text';
        text_node.innerText = list[i];
        node.appendChild(text_node); */
        add_text(node, list[i]);

        var br = document.createElement('br');
        node.appendChild(br);
    }
}

function add_labeled_text(node, label, text) {
    var label_node = document.createElement('span');
    label_node.className  = 'label';
    label_node.innerText = label;

    node.appendChild(label_node);

    add_text(node, text);
}

function add_text(node, text) {
    var text_node = document.createElement('span');
    text_node.className  = 'text';
    text_node.innerText = text;
    node.appendChild(text_node);
}


/**
 * 
 * @param {dungeon_configuration} dungeonOBJ
 */
function populate_rooms(dungeonOBJ) {
    var roomIDX;
    for (roomIDX = 1; roomIDX <= dungeonOBJ.n_rooms; roomIDX++) {
        dungeonOBJ.room[roomIDX] = flavor_text_room(dungeonOBJ.room[roomIDX]);
        dungeonOBJ.room[roomIDX] = feature_room(dungeonOBJ.room[roomIDX]);
        dungeonOBJ.room[roomIDX] = light_room(dungeonOBJ.dungeon_overall.light, dungeonOBJ.room[roomIDX]);
        dungeonOBJ.room[roomIDX] = monster_room(dungeonOBJ, roomIDX, threat_distribution[dungeonOBJ.challenge]);
        dungeonOBJ.room[roomIDX] = trap_room(dungeonOBJ.room[roomIDX], dungeonOBJ.cer);
        // room = treasure_room(dungeonOBJ.room[roomIDX], dungeonOBJ.cer);
        // This had to be moved out as it has the async call to the remote treasure service going on, 
        // and needs to know what node to return to.
    }
    return dungeonOBJ
}
function light_room(default_light, room){
    if( random(100) < 75 )
    {
        room.light = default_light;
        return room;
    }
    var light = select_from_weighted_table(roomLighting);
    if (light == {}) return room;
    if (room.light == undefined)
        room.light = [];
    room.light.push(light);
    return room;
}

function describe_dungeon_itself(dungeonOBJ){
    dungeonOBJ.dungeon_overall = {};
    dungeonOBJ = light_dungeon(dungeonOBJ);

    return dungeonOBJ;
}

function light_dungeon(dungeonOBJ){
    
    var light = select_from_weighted_table(dungeonLighting);
    if (light == {}) return dungeonOBJ;
    if (dungeonOBJ.dungeon_overall.light == undefined)
        dungeonOBJ.dungeon_overall.light = [];
    dungeonOBJ.dungeon_overall.light.push(light);
    return dungeonOBJ;
}

function flavor_text_room(room) {
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
/**
 * Find the logX of n
 * @param {number} n
 * @param {number} x
 */
function logX(n, x) {
    return Math.log(n) / Math.log(x);
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
    dungeonOBJ = describe_dungeon_itself(dungeonOBJ);
    dungeonOBJ = populate_rooms(dungeonOBJ);
    dungeonOBJ = corridors(dungeonOBJ);
    if (dungeonOBJ.add_stairs) dungeonOBJ = emplace_stairs(dungeonOBJ);
    return dungeonOBJ = gelatinous_cube(dungeonOBJ)
}

function init_dungeon() {
    var seed = {
        seed: init_seed($("dungeon_name").getValue())
    };
    $H(dungeon_options).keys().each(function(g) {
        seed[g] = $(g).getValue()
    });
    dungeon_options.cer = $("cer").getValue();
    var b = get_dungeon_configuration("dungeon_size", seed),
        c = get_dungeon_configuration("dungeon_layout", seed),
        d = b.size,
        e = c.aspect,
        cellsize = $("Resolution").getValue();
    cellsize =  b.cell;
    //b = b.cell;
    seed.n_i = Math.floor(d * e / cellsize);
    seed.n_j = Math.floor(d / cellsize);
    seed.cell_size = cellsize;
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

function saltire_mask(dungeonOBJ) {
    Math.floor(dungeonOBJ.n_rows / 2);
    var b = Math.floor(dungeonOBJ.n_rows / 4),
        c;
    for (c = 0; c < b; c++) {
        var d = b + c,
            e = dungeonOBJ.n_cols - d;
        for (d = d; d <= e; d++) {
            dungeonOBJ.cell[c][d] = BLOCKED;
            dungeonOBJ.cell[dungeonOBJ.n_rows - c][d] = BLOCKED;
            dungeonOBJ.cell[d][c] = BLOCKED;
            dungeonOBJ.cell[d][dungeonOBJ.n_cols - c] = BLOCKED
        }
    }
    return dungeonOBJ
}

function hex_mask(dungeonOBJ) {
    var b = Math.floor(dungeonOBJ.n_rows / 2),
        c;
    for (c = 0; c <= dungeonOBJ.n_rows; c++) {
        var d = Math.floor(Math.abs(c - b) * 0.57735) + 1,
            e = dungeonOBJ.n_cols - d,
            g;
        for (g = 0; g <= dungeonOBJ.n_cols; g++)
            if (g < d || g > e) dungeonOBJ.cell[c][g] = BLOCKED
    }
    return dungeonOBJ
}

function round_mask(dungeonOBJ) {
    var b = dungeonOBJ.n_rows / 2,
        c = dungeonOBJ.n_cols / 2,
        d;
    for (d = 0; d <= dungeonOBJ.n_rows; d++) {
        var e = Math.pow(d / b - 1, 2),
            g;
        for (g = 0; g <= dungeonOBJ.n_cols; g++) {
            var f = Math.sqrt(e + Math.pow(g / c - 1, 2));
            if (f > 1) dungeonOBJ.cell[d][g] = BLOCKED
        }
    }
    return dungeonOBJ
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
    switch (dungeonOBJ.room_layout){
        case "dense":
            return dense_rooms(dungeonOBJ);
            break;
        case "tight":
            return tight_rooms(dungeonOBJ);
            break;
        case "scatter":
            return scatter_rooms(dungeonOBJ);
            break;
        case "sparse":
            return sparse_rooms(dungeonOBJ);
            break;
        default:
            return scatter_rooms(dungeonOBJ);
    }
}

function tight_rooms(dungeon) {
    //var sizes = dungeon_options.room_size.values();
    var index = [], roomMax, roomCount, roomIDX;
    
    // build the index
    for (var x in dungeon_options.room_size) {
       index.push({ 'key': x, 'index': dungeon_options.room_size[x]['index'] });
    }
    
    // sort the index
    index.sort(function (a, b) { 
       var as = a['index'], 
           bs = b['index']; 
       return as == bs ? 0 : (as > bs ? 1 : -1); 
    });

    // TODO: count 'down' from room size given, allocating rooms from largest to smallest.
    roomMax = index.findIndex( function (i){ return i['key'] == dungeon.room_size } );
    for (var roomSizeCurrent = roomMax; roomSizeCurrent >= 0; roomSizeCurrent--){
        roomCount = Math.max(1, alloc_rooms(dungeon,dungeon_options.room_size[index[roomSizeCurrent]], 5)-2);
        for (roomIDX = 0; roomIDX < roomCount; roomIDX++) {
            var d = {
                size: index[roomSizeCurrent]['key']
            };
            dungeon = emplace_room(dungeon, d)
        }
    }
    // roomCount = alloc_rooms(dungeon, "tiny", 5);
    // for (roomIDX = 0; roomIDX < roomCount; roomIDX++) {
    //     var d = {
    //         size: "tiny"
    //     };
    //     dungeon = emplace_room(dungeon, d)
    // }
    return dungeon
}

function scatter_rooms(dungeon) {
    var b = alloc_rooms(dungeon, null, 9),
        c;
    for (c = 0; c < b; c++) dungeon = emplace_room(dungeon);
    if (dungeon.huge_rooms) { // alocate some medium rooms to squeeze in amongst the huge ones
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

function sparse_rooms(dungeonOBJ) {
    var b = alloc_rooms(dungeonOBJ, null, 15),
        c;
    for (c = 0; c < b; c++) dungeonOBJ = emplace_room(dungeonOBJ);
    if (dungeonOBJ.huge_rooms) {
        b = alloc_rooms(dungeonOBJ, "medium");
        for (c = 0; c < b; c++) {
            var d = {
                size: "medium"
            };
            dungeonOBJ = emplace_room(dungeonOBJ, d)
        }
    }
    return dungeonOBJ
}

/**
 * Takes the dungeon provided and figures out how many rooms should be allocated to it, given the room size and desired packing.
 * @param {*} dungeonOBJ 
 * @param {*} room_size_name 
 * @param {*} packing 
 */
function alloc_rooms(dungeonOBJ, room_size_name, packing) {
    var room_area = dungeonOBJ.n_cols * dungeonOBJ.n_rows;
    var size_obj = dungeon_options.room_size[room_size_name || dungeonOBJ.room_size];
    var size_factor = size_obj.size || 2; // default 2
    var size_radix = size_obj.radix || 5; // default 5
    size_factor = size_factor + size_radix + 1;
    size_factor = size_factor * size_factor;
    room_area = Math.floor(room_area / size_factor) * 2;
    room_area /= packing || 9;
    // if (dungeonOBJ.room_layout == "sparse") room_area /= 15; // packing - large denominator = looser packing
    // if (dungeonOBJ.room_layout == "scatter") room_area /= 9;
    // if (dungeonOBJ.room_layout == "tight") room_area /= 5;
    return room_area
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

function open_room(dungeon, room) {
    var candidates = door_sills(dungeon, room);
    if (!candidates.length) return dungeon;
    var door_number = alloc_opens(dungeon, room),
        i;
    for (i = 0; i < door_number; i++) {
        var candidate = candidates.splice(random(candidates.length), 1).shift();
        if (!candidate) break;
        var door_row = candidate.door_r,
            door_column = candidate.door_c;
        var door_cell = dungeon.cell[door_row][door_column];
        if (!(door_cell & DOORSPACE))
            if (door_cell = candidate.out_id) {
                door_cell = [room.id, door_cell].sort(cmp_int).join(",");
                if (!connect[door_cell]) {
                    dungeon = open_door(dungeon, room, candidate);
                    connect[door_cell] = 1
                }
            } else dungeon = open_door(dungeon, room, candidate)
    }
    return dungeon
}

function cmp_int(a, b) {
    return a - b
}

function door_sills(dungeon, room) {
    var cell = dungeon.cell,
        doors, exits = [];
    if (room.complex) room.complex.each(function(k) {
        k = door_sills(dungeon, k);
        if (k.length) exits = exits.concat(k)
    });
    else {
        var edgeNorth = room.north,
            edgeSouth = room.south,
            edgeWest = room.west,
            edgeEast = room.east;
        var j=0;
        if (edgeNorth >= 3) {
            for (j = edgeWest; j <= edgeEast; j += 2)
                if (doors = check_sill(cell, room, edgeNorth, j, "north")) exits.push(doors)
        }
        if (edgeSouth <= dungeon.n_rows - 3)
            for (j = edgeWest; j <= edgeEast; j += 2)
                if (doors = check_sill(cell, room, edgeSouth, j, "south")) exits.push(doors);
        if (edgeWest >= 3)
            for (j = edgeNorth; j <= edgeSouth; j += 2)
                if (doors = check_sill(cell, room, j, edgeWest, "west")) exits.push(doors);
        if (edgeEast <= dungeon.n_cols - 3)
            for (j = edgeNorth; j <= edgeSouth; j += 2)
                if (doors = check_sill(cell, room, j, edgeEast, "east")) exits.push(doors)
    }
    return exits;
}

/**
 * 
 * @param {Object} cell 
 * @param {Object} room 
 * @param {Number} x 
 * @param {Number} y 
 * @param {String} wall 
 * 
 * @returns {Object} Room object
 */
function check_sill(cell, room, x, y, wall) {
    var g = x + di[wall],
        f = y + dj[wall],
        h = cell[g][f];
    if (!(h & PERIMETER)) return false;
    if (h & BLOCK_DOOR) return false;
    h = g + di[wall];
    var i = f + dj[wall];
    cell = cell[h][i];
    if (cell & BLOCKED) return false;
    cell = (cell & ROOM_ID) >> 6;
    if (cell == room.id) return false;
    return room = {
        sill_r: x,
        sill_c: y,
        dir: wall,
        door_r: g,
        door_c: f,
        out_id: cell
    }
}

function alloc_opens(DungeonOBJ, Room) {
    var room_height = (Room.south - Room.north) / 2 + 1;
    var room_width = (Room.east - Room.west) / 2 + 1;
    var room_diagonal = Math.floor(Math.sqrt(room_width * room_height));
    return room_diagonal = room_diagonal + random(room_diagonal)
}

function open_door(dungeonOBJ, room, candidate) {
    var doors = get_dungeon_configuration("doors", dungeonOBJ),
        doors_table = doors.table;
    var door_row = candidate.door_r;
    var door_column = candidate.door_c,
        f = candidate.sill_r,
        h = candidate.sill_c,
        i = candidate.dir;
    var c = candidate.out_id;
    var j;
    for (j = 0; j < 3; j++) {
        var k = f + di[i] * j,
            l = h + dj[i] * j;
        dungeonOBJ.cell[k][l] &= ~PERIMETER;
        dungeonOBJ.cell[k][l] |= ENTRANCE
    }
    var mask = select_from_table(doors_table);
    var door_obj = {
        row: door_row,
        col: door_column
    };
    dungeonOBJ.cell[door_row][door_column] |= mask;

    var doortype = getPropertyBySubPropertyValue(door_types, 'mask', mask);
    door_obj.key = doortype['key'];
    door_obj.type = doortype['type'];
    
    if (c) door_obj.out_id = c;
    room.door[i].push(door_obj);
    room.last_door = door_obj;
    return dungeonOBJ
}

function getPropertyBySubPropertyValue( dict, key, value ) {
    for( var prop in dict ) {
        if( dict.hasOwnProperty( prop ) ) {
             if( dict[ prop ][ key ] === value )
                 return dict[ prop ];
        }
    }
    return undefined;
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

function corridors(dungeonOBJ) {
    var b = get_dungeon_configuration("corridor_layout", dungeonOBJ);
    dungeonOBJ.straight_pct = b.pct;
    for (b = 1; b < dungeonOBJ.n_i; b++) {
        var c = b * 2 + 1,
            d;
        for (d = 1; d < dungeonOBJ.n_j; d++) {
            var e = d * 2 + 1;
            dungeonOBJ.cell[c][e] & CORRIDOR || (dungeonOBJ = tunnel(dungeonOBJ, b, d))
        }
    }
    return dungeonOBJ
}

function tunnel(dungeonOBJ, i, j, in_dir) {
    in_dir = tunnel_dirs(dungeonOBJ, in_dir);
    in_dir.each(function(each_dir) {
        if (open_tunnel(dungeonOBJ, i, j, each_dir)) {
            var x = i + di[each_dir],
                y = j + dj[each_dir];
            dungeonOBJ = tunnel(dungeonOBJ, x, y, each_dir)
        }
    });
    return dungeonOBJ
}

function tunnel_dirs(dungeonOBJ, b) {
    var shuffledDirections = shuffle(dj_dirs);
    b && dungeonOBJ.straight_pct && (random(100) < dungeonOBJ.straight_pct) && shuffledDirections.unshift(b);
    return shuffledDirections
}

/**
 * 
 * @param {Array} deck 
 */
function shuffle(deck) {
    deck = deck.concat();
    var b;
    for (b = deck.length - 1; b > 0; b--) {
        var c = random(b + 1),
            d = deck[b];
        deck[b] = deck[c];
        deck[c] = d
    }
    return deck
}

function open_tunnel(dungeonOBJ, i, j, direction) {
    var e = i * 2 + 1,
        g = j * 2 + 1;
    i = (i + di[direction]) * 2 + 1;
    j = (j + dj[direction]) * 2 + 1;
    direction = (e + i) / 2;
    var f = (g + j) / 2;
    return sound_tunnel(dungeonOBJ, direction, f, i, j) ? delve_tunnel(dungeonOBJ, e, g, i, j) : false
}

function sound_tunnel(dungeonOBJ, direction, c, i, j) {
    if (i < 0 || i > dungeonOBJ.n_rows) return false;
    if (j < 0 || j > dungeonOBJ.n_cols) return false;
    direction = [direction, i].sort(cmp_int);
    c = [c, j].sort(cmp_int);
    for (j = direction[0]; j <= direction[1]; j++)
        for (i = c[0]; i <= c[1]; i++)
            if (dungeonOBJ.cell[j][i] & BLOCK_CORR) return false;
    return true
}

function delve_tunnel(dungeonOBJ, b, c, i, j) {
    b = [b, i].sort(cmp_int);
    c = [c, j].sort(cmp_int);
    for (j = b[0]; j <= b[1]; j++)
        for (i = c[0]; i <= c[1]; i++) {
            dungeonOBJ.cell[j][i] &= ~ENTRANCE;
            dungeonOBJ.cell[j][i] |= CORRIDOR
        }
    return true
}

function emplace_stairs(dungeonOBJ) {
    var b = stair_ends(dungeonOBJ);
    if (!b.length) return dungeonOBJ;
    var c = alloc_stairs(dungeonOBJ);
    if (c == 0) return dungeonOBJ;
    var d = [],
        e;
    for (e = 0; e < c; e++) {
        var g = b.splice(random(b.length), 1).shift();
        if (!g) break;
        var f = g.row,
            h = g.col,
            i = e < 2 ? e : random(2);
        if (i == 0) {
            dungeonOBJ.cell[f][h] |= STAIR_DN;
            g.key = "down"
        } else {
            dungeonOBJ.cell[f][h] |= STAIR_UP;
            g.key = "up"
        }
        d.push(g)
    }
    dungeonOBJ.stair = d;
    return dungeonOBJ
}

function stair_ends(dungeonOBJ) {
    var cell = dungeonOBJ.cell,
        stairs = [],
        d;
    for (d = 0; d < dungeonOBJ.n_i; d++) {
        var y = d * 2 + 1,
            g;
        for (g = 0; g < dungeonOBJ.n_j; g++) {
            var x = g * 2 + 1;
            if (dungeonOBJ.cell[y][x] == CORRIDOR) dungeonOBJ.cell[y][x] & STAIRS || $H(stair_end).keys().each(function(direction) {
                if (check_tunnel(cell, y, x, stair_end[direction])) {
                    var stair = {
                        row: y,
                        col: x,
                        dir: direction
                    };
                    direction = stair_end[direction].next;
                    stair.next_row = stair.row + direction[0];
                    stair.next_col = stair.col + direction[1];
                    stairs.push(stair)
                }
            })
        }
    }
    return stairs
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

/**
 * 
 * @param {Number[][]} cell 
 * @param {Number} y 
 * @param {Number} x 
 * @param {Object} stair_end_dir 
 */
function check_tunnel(cell, y, x, stair_end_dir) {
    var e = true,
        g;
    if (g = stair_end_dir.corridor) {
        g.each(function(f) {
            if (cell[y + f[0]])
                if (cell[y + f[0]][x + f[1]] != CORRIDOR) e = false
        });
        if (!e) return false
    }
    if (stair_end_dir = stair_end_dir.walled) {
        stair_end_dir.each(function(f) {
            if (cell[y + f[0]])
                if (cell[y + f[0]][x + f[1]] & OPENSPACE) e = false
        });
        if (!e) return false
    }
    return true
}

function alloc_stairs(dungeonOBJ) {
    var num_stairs = 0;
    if (dungeonOBJ.add_stairs == "many") {
        dungeonOBJ = dungeonOBJ.n_cols * dungeonOBJ.n_rows;
        num_stairs = 3 + random(Math.floor(dungeonOBJ / 1E3))
    } else if (dungeonOBJ.add_stairs == "yes") num_stairs = 2;
    return num_stairs
}

function peripheral_egress(a) {
    return a
}

/**
 * 
 * @param {*} dungeonOBJ 
 */
function gelatinous_cube(dungeonOBJ) {
    if (dungeonOBJ.remove_deadends) dungeonOBJ = remove_deadends(dungeonOBJ);
    if (dungeonOBJ.remove_deadends)
        if (dungeonOBJ.corridor_layout == "errant") dungeonOBJ.close_arcs = dungeonOBJ.remove_pct;
        else if (dungeonOBJ.corridor_layout == "straight") dungeonOBJ.close_arcs = dungeonOBJ.remove_pct;
    if (dungeonOBJ.close_arcs) dungeonOBJ = close_arcs(dungeonOBJ);
    dungeonOBJ = fix_doors(dungeonOBJ);
    return dungeonOBJ = empty_blocks(dungeonOBJ)
}

/**
 * Derives the remove percentage and adds it to dungeonOBJ, calls collapse_tunnels() to close some deadends.
 * @param {Object} dungeonOBJ 
 */
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

function collapse(dungeonOBJ, x, y, close_end) {
    var e = dungeonOBJ.cell;
    if (!(dungeonOBJ.cell[x][y] & OPENSPACE)) return dungeonOBJ;
    $H(close_end).keys().each(function(g) {
        if (check_tunnel(e, x, y, close_end[g])) {
            var f;
            if (f = close_end[g].close) f.each(function(h) {
                e[x + h[0]][y + h[1]] = NOTHING
            });
            if (f = close_end[g].open) e[x + f[0]][y + f[1]] |= CORRIDOR;
            if (g = close_end[g].recurse) dungeonOBJ = collapse(dungeonOBJ, x + g[0], y + g[1], close_end)
        }
    });
    dungeonOBJ.cell = e;
    return dungeonOBJ
}

function fix_doors(dungeonOBJ) {
    var b = {},
        c = [];
    dungeonOBJ.room.each(function(room) {
        var e = room.id;
        $H(room.door).keys().each(function(direction) {
            var f = [];
            room.door[direction].each(function(door) {
                var i = door.row,
                    j = door.col,
                    fill_type = dungeonOBJ.cell[i][j];
                if (fill_type & OPENSPACE) {
                    i = [i, j].join(",");
                    if (b[i]) f.push(door);
                    else {
                        if (j = door.out_id) {
                            fill_type = dungeonOBJ.room[j];
                            var l = opposite[direction];
                            door.out_id = {};
                            door.out_id[e] = j;
                            door.out_id[j] = e;
                            fill_type.door[l].push(door)
                        }
                        f.push(door);
                        b[i] = true
                    }
                }
            });
            if (f.length) {
                room.door[direction] = f;
                c = c.concat(f)
            } else room.door[direction] = []
        })
    });
    dungeonOBJ.door = c;
    return dungeonOBJ
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

function base_layer(a, b) {
    var c = new Element("canvas");
    c.width = b.width;
    c.height = b.height;
    var d = c.getContext("2d"),
        e = b.max_x,
        g = b.max_y,
        palette = b.palette,
        h;
    (h = palette.open) ? fill_rect(d, 0, 0, e, g, h): fill_rect(d, 0, 0, e, g, palette.white);
    if (h = palette.open_grid) image_grid(a, b, h, d);
    else if (h = palette.grid) image_grid(a, b, h, d);
    return c
}

function image_grid(image, b, c, d) {
    if (image.grid != "none")
        if (image.grid == "hex") hex_grid(image, b, c, d);
        else image.grid == "vex" ? vex_grid(image, b, c, d) : square_grid(image, b, c, d);
    return true
}

function square_grid(a, b, c, d) {
    a = b.cell_size;
    var e;
    for (e = 0; e <= b.max_x; e += a) draw_line(d, e, 0, e, b.max_y, c);
    for (e = 0; e <= b.max_y; e += a) draw_line(d, 0, e, b.max_x, e, c);
    return true
}

function hex_grid(a, b, c, d) {
    var e = b.cell_size;
    a = e / 3.4641016151;
    e = e / 2;
    var g = b.width / (3 * a);
    b = b.height / e;
    var f;
    for (f = 0; f < g; f++) {
        var h = f * 3 * a,
            i = h + a,
            j = h + 3 * a,
            k;
        for (k = 0; k < b; k++) {
            var l = k * e,
                o = l + e;
            if ((f + k) % 2 != 0) {
                draw_line(d, h, l, i, o, c);
                draw_line(d, i, o, j, o, c)
            } else draw_line(d, i, l, h, o, c)
        }
    }
    return true
}

function vex_grid(a, b, c, d) {
    var e = b.cell_size;
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

function open_cells(image, b, c) {
    var d = b.cell_size;
    b = b.base_layer;
    var e;
    for (e = 0; e <= image.n_rows; e++) {
        var g = e * d,
            f;
        for (f = 0; f <= image.n_cols; f++)
            if (image.cell[e][f] & OPENSPACE) {
                var h = f * d;
                c.drawImage(b, h, g, d, d, h, g, d, d)
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
    } else if (a.key == "secret") {
        b = {
            wall: 1,
            arch: 1,
            secret: 1
        }
    } else if (a.key == "portc") {
        b = {
            arch: 1,
            portc: 1
        }
    } else {
        b = {
            arch: 1
        }
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