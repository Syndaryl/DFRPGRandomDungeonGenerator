/*eslint eqeqeq: ["warn", "smart"]*/
/*eslint no-extra-parens: ["warn", "all" ]*/
/*eslint valid-jsdoc: "warn"*/
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
    $("generosity").observe("change", new_dungeon);
    $("travel_distance").observe("change", new_dungeon);
    $("challenge").observe("change", new_dungeon);
    $("Resolution").observe("change", resolution_change);
    $("remote_treasure").observe("change", new_dungeon);

    // go through the various dropdowns and populate them from the lists in this file
    // and then observe them
    $H(dungeon_options).keys().each(function(key_primus) {
        $H(dungeon_options[key_primus]).keys().each(function(key_secondus) {
            var option_text = dungeon_options[key_primus][key_secondus].title;
            $(key_primus).insert(create_option(key_secondus, option_text));
        });
        $(key_primus).observe("change", new_dungeon);
        $(key_primus).observe("change", save_dungeon_configuration);
    });

    // set defaults
    var query_keys = $H(default_query).keys();
    query_keys.each(set_default);
    if (default_query["seed"] && default_query["seed"] != "")
        $("dungeon_name").setValue(default_query["seed"]);
    else
        new_name();
    if (urlParams.resolution)
        $("Resolution").setValue(urlParams.resolution);
    
    dungeon_options.cer = $("cer").getValue();
    name_reaction();
}

function set_default(drop_down) {
    var q = default_query[drop_down];
    if ($(drop_down) != null) {
        $(drop_down).setValue(q);
    }
}

/**
 * URI encode the paramaters of an object and concatenate them appropriately so they can be sent as a GET request
 * @param {*} obj 
 */
function GET_serialize (obj) {
    var str = [];
    for (var p in obj)
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    return str.join("&");
}

/**
 * Update the link to this dungeon to be current
 */
function update_self_link() {

    var options = {};
    $H(dungeon_options).keys().each(function (field) {
        if ( $(field) != null) {
            var value = $(field).getValue();
            options[field] = value;
        }
    }
    );
    options['seed'] = $("dungeon_name").getValue();
    options['resolution'] = $("Resolution").getValue() || 25;
    var serial = GET_serialize(options);
    const newLocal = window.location.href;
    

    document.getElementById("self_link").setAttribute("href", newLocal.split('?')[0] + '?' + serial);

}

/**
 * Creates a JSON object  with the specified name and value.
 * @param {string} name
 * @param {any} value
 */
function create_option(name, value) {
    return new_option({
        value: name
    }).update(value);

}

/**
 * Creates a new key-value pair with the name "option" and the value from @{value}
 * @param {any} value
 */
function new_option(value) {
    return build_tag("option", value);
}

/**
 * Creates a new key-value pair
 * @param {string} key
 * @param {any} value
 * @returns {Element}
 */
function build_tag(key, value) {
    return new Element(key, value);
}

/**
 * Event to handle changes to dungeon name. Triggers a new dungeon.
 */
function name_reaction() {
    $("dungeon_title").update($("dungeon_name").getValue());

    new_dungeon();
}

/**
 * Generates a new dungeon name, assigns it internally, and triggers the name_reaction() event.
 */
function new_name() {
    $("dungeon_name").setValue(generate_text("Dungeon Name"), gen_data);
    cer_reaction();
}

/**
 * Event to handle changes to a dungeons cer level. Triggers a new dungeon.
 */
function cer_reaction() {
    new_dungeon();
}

/**
 * Save dungeon configuration in localStorage.
 * @param {string} set_item_key - Key to setItem in localStorage. Default: 'last_saved_query'
 */
function save_dungeon_configuration(set_item_key) {
    var dungeon_options_to_save = {};
    $H(dungeon_options).keys().each(function(key_primus) {
        dungeon_options_to_save[key_primus] = $(key_primus).getValue();
    });
	if (supports_local_storage())
		localStorage.setItem('last_saved_query', JSON.stringify(dungeon_options_to_save));
}

/**
 * Event to handle changes to the print resolution. Should not trigger a new dungeon generation, should re-draw the map.
 */
function resolution_change() {
    console.log("Resolution change to " + $("Resolution").getValue());
    Global_Dungeon.cell_size =  parseInt($("Resolution").getValue());
    image_dungeon_gm(Global_Dungeon);
}

/**
 * Create a new dungeon, generate an image for the new dungeon.
 * 
 * Also saves current configuration to localStorage under the key 'last_saved_query'
 * Also updates the link to this dungeon
 */
function new_dungeon() {
    var dungeonOBJ = create_dungeon();
    dungeonOBJ.challenge = 'average';
    image_dungeon_gm(dungeonOBJ);
    html_dungeon_details(dungeonOBJ);
    html_room_details(dungeonOBJ);
    update_self_link(dungeon_options);
    Global_Dungeon = dungeonOBJ;
}


function html_dungeon_details(dungeonOBJ){
    var dungeonDiv = document.createElement('div');
    dungeonDiv.id = 'dungeon';
    dungeonDiv.className = 'dungeon';
    var dungeon_key = document.getElementById('dungeon_key');
    var dungeon_debug = document.getElementById('debug');
    while (dungeon_key.firstChild) {
        dungeon_key.removeChild(dungeon_key.firstChild);
    }
    dungeon_key.appendChild(dungeonDiv);
    
    html_light(dungeonDiv, dungeonOBJ['dungeon_overall']);
    html_mana(dungeonDiv, dungeonOBJ['dungeon_overall']);
    html_sanctity(dungeonDiv, dungeonOBJ['dungeon_overall']);
    html_ceilings(dungeonDiv, dungeonOBJ['dungeon_overall']);
    html_travel_time(dungeon_key, dungeonOBJ.dungeon_overall.travel_distance);
    html_wandering_monsters(dungeon_key, dungeonOBJ['wandering_monsters'], parseInt(dungeonOBJ.cer));

    //var tree = document.getElementById('mynetwork');
    //build_tree(dungeonOBJ, tree);
    //html_debug_dump(dungeon_debug, dungeonOBJ.cell);

    //debug_dump_room_centers(dungeonOBJ, dungeon_debug);
}

/**
 * 
 * @param {HTMLDivElement} element
 * @param {any} data
 */
function html_debug_dump(element, data) {
    var pre = document.createElement('pre');

    pre.innerText = JSON.stringify(data);

    element.appendChild(pre);
}

/**
 * 
 * @param {Dungeon} dungeonOBJ
 * @param {HTMLDivElement} element
 */
function debug_dump_room_centers(dungeonOBJ, element) {
    var data = build_rooms_for_tree(dungeonOBJ);

    html_debug_dump(element, data);
}

/**
 * 
 * @param {Dungeon} dungeonOBJ
 */
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
        html_light(div, room);
        html_mana(div, room);
        html_sanctity(div, room);
        html_room_decoration(div, room);
        html_room_water(div, room);

        html_room_features(div, room);
        html_room_treasures_prepare(div, room);

        html_room_monsters(div, room);
        html_room_traps(div, room);
        room_key.appendChild(div);

        // generally done async
        room = treasure_room(room, dungeonOBJ.cer, div, dungeonOBJ.generosity, dungeonOBJ.dungeon_overall.travel_distance);
    }
}
/**
 * 
 * @param {HTMLDivElement} element 
 * @param {number} number 
 */
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
/**
 * 
 * @param {HTMLDivElement} element 
 * @param {object} room
 * @returns {null}   nothing.
 */
function html_room_doors(element, room) {
    var div = document.createElement('div');
    div.setAttribute('id','doors');
    var doors = room.door;

    //var doors = new Array(rooms.door["north"], rooms.door["east"], rooms.door["south"], rooms.door["west"]).reduce((acc, cur) => acc.concat(cur));
    var doorIDX = 0;
    for(var d = 0; d < 4; d++){
        var dir = cardinal_dirs_enum_invert[d];
        const doors_this_wall = doors[dir] || [];
        var door_count = doors_this_wall.length || 0;
        if (door_count > 0) {

            for (var i = 0; i < door_count; i++) {
                var description = document.createElement('p');
                var door_name, door_desc;
                door_name = title_case_sentance(dir + ' ' + 'door ') + String.fromCharCode('a'.charCodeAt(0) + doorIDX++) + ': ';
                door_desc = inform_door(doors_this_wall[i].mask, doors_this_wall[i].penalty !== undefined ? doors_this_wall[i].penalty : 0);
                add_labeled_text(description, door_name, door_desc);
                div.appendChild(description);
            }
        }
    }

    element.appendChild(div);
}

/**
 * Looks up the kind of doorway and returns an appropriate description (pulling from a random table where necessary).
 * @param {string} mask 
  * @param {number} penalty lockpicking penalty (if appropriate) 
 * @returns {string} A text description of the door and its game statistics.
 */
function inform_door (mask, penalty){
    var door_text = '';
    if (mask & DOOR) 
        {door_text = door_text + select_from_weighted_table(doorsList).Description;}
    else if (mask & PORTC) 
        {door_text = door_text + select_from_weighted_table(portcullisesList).Description;}
    else if (mask & ARCH) 
        {door_text = door_text + select_from_weighted_table(archesList).Description;}
    
    if (mask & LOCKED)
    {
        door_text = door_text + '; ' + 'it is locked, ';
        if (penalty === 0)
            door_text += 'no penalty';
        else if ( penalty > 0 )
            door_text += 'a +' + penalty + ' bonus';
        else
            door_text += 'a ' + penalty + ' penalty';

        door_text += ' to pick the lock';
    }
    else
        {
            if ( mask & ARCH)
                'do nothing';
            else
                door_text = door_text + '; ' + 'it is unlocked';
        }

    if (mask & STUCK)
        {door_text = door_text + '; ' + select_from_weighted_table(stuckDoors).Description;}

    if (mask & TRAPPED)
        {door_text = door_text + '; ' + 'it is trapped'+ '; ' + select_from_weighted_table_tagged(traps, "Door").Description;}
    
    if (mask & SECRET)
    { door_text = door_text + '; ' + select_from_weighted_table(concealment).Description; }

    if (mask & OPEN_DOOR && !(mask & PORTC) && !(mask & ARCH)) {
        door_text = door_text + '; ' + select_from_weighted_table(open_door_list).Description;
    }
    if (mask & OPEN_DOOR && (mask & PORTC)) {
        door_text = door_text + '; ' + select_from_weighted_table(open_portc_list).Description;
    }

    door_text += '.';

    return door_text;
}

/**
 * 
 * @param {HTMLDivElement} element  HTML element to add the decoration information to
 * @param {object} room     Room object to scrape decoration info from
 * @returns {null}   nothing.
 */
function html_room_decoration(element, room) {
    var description = document.createElement('p');
    add_labeled_text(description, 'Description: ',
        'This room is ' + grid_to_yards(room.width) + ' yards wide and ' + grid_to_yards(room.height) + ' yards long. ' +
        room['description'].join('. ') + '.');

    element.appendChild(description);
}

/**
 * 
 * @param {HTMLDivElement} element 
 * @param {object} room
 * @returns {null}   nothing.
 */
function html_room_water(element, room) {
    if (room['water'].length > 0) {
        var container = document.createElement('div');
        container.id = 'water';
        element.appendChild(container);

        var contents = document.createElement('p');
        var water = [];
        for (var i = 0; i < room['water'].length; i++) {
            /* var source = "";
            if (room['water'][i].Book != "") source += room['water'][i].Book + " p" + room['water'][i].Page
            traps.push(room['water'][i].Description + " (" + source + ")");
            */
           water.push(room['water'][i].Description);
        }
        add_labeled_list(contents, 'Terrain Feature: ', water);
        container.appendChild(contents);
    }
}

/**
 * 
 * @param {HTMLDivElement} element 
 * @param {object} room
 * @returns {null}   nothing.
 */
function html_room_features(element, room) {
    var contents = document.createElement('p');
    add_labeled_list(contents, 'Contents: ', room['contents']);
    element.appendChild(contents);
}

/**
 * 
 * @param {HTMLDivElement} element 
 * @param {object} room
 * @returns {null}   nothing.
 */
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

/**
 * 
 * @param {HTMLDivElement} element 
 * @param {object} room
 * @returns {null}   nothing.
 */
function html_light(element, room){
    var contents = document.createElement('p');
    if (room['light'] == undefined){
        add_labeled_text(contents, 'Light: ', 'Light generation error');
    }
    else {
        //var contents = document.createElement('p');
        room['light'].forEach(lt => {
            var lightDesc = lt.Description;
            if (lt.Penalty != 0) lightDesc +=  ' (' + lt.Penalty + ' light penalty)';
            add_labeled_text(contents, 'Light: ', lightDesc);
        });
    }
    element.appendChild(contents);
}

/**
 * 
 * @param {HTMLDivElement} element 
 * @param {object} room
 * @returns {null}   nothing.
 */
function html_mana(element, room) {
    var contents = document.createElement('p');
    if (room['mana'] == undefined) {
        add_labeled_text(contents, 'Mana: ', 'Mana generation error');
    }
    else {
        //var contents = document.createElement('p');
        room['mana'].forEach(mana => {
            var manaDesc = mana.Description;
            if (mana.Penalty != 0) manaDesc += ' (' + mana.Penalty + ')';
            add_labeled_text(contents, 'Mana: ', manaDesc);
        });
    }
    element.appendChild(contents);
}

/**
 * 
 * @param {HTMLDivElement} element 
 * @param {object} room
 * @returns {null}   nothing.
 */
function html_sanctity(element, room) {
    var contents = document.createElement('p');
    if (room['sanctity'] == undefined) {
        add_labeled_text(contents, 'Sanctity: ', 'Sanctity generation error');
    }
    else {
        //var contents = document.createElement('p');
        room['sanctity'].forEach(mana => {
            var manaDesc = mana.Description;
            if (mana.Penalty != 0) manaDesc += ' (' + mana.Penalty + ')';
            add_labeled_text(contents, 'Sanctity: ', manaDesc);
        });
    }
    element.appendChild(contents);
}
/**
 * 
 * @param {HTMLDivElement} element 
 * @param {object} room
 * @returns {null}   nothing.
 */
function html_ceilings(element, room){
    var contents = document.createElement('p');
    if (room['ceiling_height'] == undefined){
        add_labeled_text(contents, 'Ceiling Heights: ', 'Ceiling generation error');
    }
    else {
        //var contents = document.createElement('p');
        room['ceiling_height'].forEach(ceil => {
            var ceilHeight = ceil.Description;
            if (ceil.Height != 0) ceilHeight +=  ' (' + ceil.Height + ' feet high)';
            add_labeled_text(contents, 'Ceiling Heights: ', ceilHeight);
        });
    }
    element.appendChild(contents);
}

/**
 * 
 * @param {object} element 
 * @param {object} travel_distance
 * @returns {null}   nothing.
 */
function html_travel_time(element, travel_distance){
    var container = document.createElement('div');
    container.id = 'travel_times';
    container.setAttribute('class', 'travel');
    element.appendChild(container);
    
    var title = document.createElement('h3');
    title.innerText = 'Travel Time';
    container.appendChild(title);
    travel_distance.forEach(travelElement => {

        var travel = dungeon_options['travel_distance'][travelElement['travel']];
        var time = Math.max(0, roll_dice(travel.Time));
        var travelText =  'This dungeon is ' + (
            (time == 0) ? 'right under town! ' :
                (time + ' day' + ((time > 1) ? 's' : '') + ' of travel away, through ' + travelElement['biome'] +'. ')
        )
            + travel.Notes;

        add_labeled_text(container, travel.title + ': ', travelText);
        
    });
    
}

/**
 * 
 * @param {HTMLDivElement} element 
 * @param {object} room
 * @returns {null}   nothing.
 */
function html_room_monsters(element, room) {
    JSON.stringify(room['monsters']);
    if (room['monsters'].length > 0) {
        var container = document.createElement('div');
        container.id = 'monsters';
        element.appendChild(container);

        var contents = document.createElement('p');
        var mons = [];
        for (var i = 0; i < room['monsters'].length; i++) {
            var source = "";
            var options = {};
            var source1 = room['monsters'][i].monster.Source1;
            var source2 = room['monsters'][i].monster.Source2;
            if (source1 != null && source1 != "") source += linkifyStr(source1, options);
            if (source1 != null && source1 != "" && room['monsters'][i].monster.Page1 != "") source += " p" + room['monsters'][i].monster.Page1;
            if (source1 != null && source1 != "" && source2 != "") source += ", ";
            if (source2 != null && source2 != "") source += linkifyStr(source2, options);
            if (source2 != null && source2 != "" && room['monsters'][i].monster.Page2 != "") source += " p" + room['monsters'][i].monster.Page2;
            mons.push("CER: " + (room['monsters'][i].quantity * room['monsters'][i].cer)+ "; " + room['monsters'][i].quantity + " x " + room['monsters'][i].monster.Description + " (" + source + ")");
        }
        add_labeled_list(contents, 
            'Monsters: '
            , mons);
        container.appendChild(contents);

        contents = document.createElement('p');
        add_labeled_text(contents, 'Monster Challenge: ', room.challenge);
        var br = document.createElement('br');
        contents.appendChild(br);
        add_labeled_text(contents, 'Total CER: ', room.cer_total);
        container.appendChild(contents);
    }
}

/**
 * @param {HTMLDivElement} element  DOM element to append the wandering monsters to
 * @param {Array} wandering_monsters    the wandering monster table
 * @param {number} target_cer   the target CER
 * @returns {null}   nothing.
 */
function html_wandering_monsters(element, wandering_monsters, target_cer){
    if (wandering_monsters.length == 0)
        return;

    var list = Array.from(wandering_monsters, x => x[0]);
    list.sort((a,b) => a.Description > b.Description );
    fisherYatesShuffle(list);
    list = list.slice(0,12);
    list.sort((a,b) => a.CER > b.CER );
    var sum = list.reduce(function ( previous, current, idx, array){
        return previous + parseInt(current.Weight);
    }, 0 );

    var accumulate = 1;
    var i = 0;
    var final_list = [];
    // first pass - make sure we cap at a max weight of 100.
    while (accumulate <= 100 )
    {
        var percent = Math.max(1, Math.floor( list[i].Weight / sum * 100 ));
        if (Math.min(100,accumulate+percent) == accumulate)
            list[i].Range = Math.min(100,accumulate+percent);
        else
            list[i].Range = accumulate + '-' + Math.min(100,accumulate+percent);

        var this_target_cer = Math.round( target_cer * rand_between( 0.5, 1.33 ) );
        var quantity = Math.max( // at least one
            1, Math.round(this_target_cer / list[i].CER)
        );
        if (quantity > 4)
        {
            quantity = lowChanceDiceFromInteger(quantity);
        } else if (quantity === 4)
        { quantity = '1d6-2 (min 1)'; }
        else if (quantity === 3)
        { quantity = '1-3'; }
        else if (quantity === 2)
        { quantity = '1-2'; }
        list[i].Quantity = quantity;
        final_list.push(list[i]);
        accumulate = Math.min(100,accumulate+percent) +1;
        i++;
    }

    var container = document.createElement('div');
    container.id = 'wandering_monsters';
    container.setAttribute('class', 'dungeon');
    element.appendChild(container);
    
    var title = document.createElement('h3');
    title.innerText = 'Wandering Monsters';
    container.appendChild(title);
    
    var description = document.createElement('p');
    description.innerText = 'Check for wandering monsters hourly when exploring the dungeon, every time doors are bashed, and at other times indicated on page 85 of Exploits. On a 9 or less roll on the following table:';
    container.appendChild(description);

    var table = document.createElement('table');
    table.id = 'wandering_monsters';
    container.appendChild(table);
    
    var head = document.createElement('tr');
    head.setAttribute('class', 'thead');
    head.id = 'header';
    table.appendChild(head);
    add_head(head, 'd100');
    add_head(head, '#');
    add_head(head, 'Monster');
    add_head(head, 'CER *');

    // second pass - do HTML
    final_list.forEach(monster => {
        var row = document.createElement('tr');
        table.appendChild(row);
        add_cell(row, monster.Range);
        add_cell(row, monster.Quantity);
        add_cell(row, monster.Description);
        add_cell(row, monster.CER);
    });
    
    var footer = document.createElement('tr');
    footer.id = 'footer';
    table.appendChild(footer);
    var footer_cell = document.createElement('td');
    footer_cell.setAttribute('colspan', 4);
    footer.appendChild (footer_cell);
    var footer_span = document.createElement('span');
    footer_span.innerText = "* CER is per monster, multiply by quantity";
    footer_cell.appendChild (footer_span);

    return;

    function diceFromInteger(quantity) {
        var dice = Math.round(quantity / 3.5);
        var remain = Math.round(quantity % 3.5) - 1;
        quantity = dice + 'd6' + (remain > 0 ? '+' + remain :
            (remain < 0 ? remain :
                ''));
        return quantity;
    }

    function lowChanceDiceFromInteger(quantity) {
        quantity = quantity - 6;
        return '1d6' + (quantity == 0? '' : (quantity < 0 ? '-' : '+' ) + quantity );
    }

    function add_cell(row, text)
    {
        var cell = document.createElement('td');
        row.appendChild (cell);
        var par = document.createElement('span');
        cell.appendChild(par);
        par.innerText = text;
    }
    function add_head(row, text)
    {
        var cell = document.createElement('td');
        row.appendChild (cell);
        var par = document.createElement('span');
        cell.appendChild(par);
        par.innerText = text;
    }
}

/**
 * 
 * @param {HTMLDivElement} element 
 * @param {object} room
 * @returns {null}   nothing.
 */
function html_treasures(element, room) {
    if (room['treasure'].length == 0)
        return;

    add_labeled_list(room.treasure_node, 'Treasures: ', room['treasure']);
    
}

/**
 * 
 * @param {HTMLDivElement} element 
 * @param {object} room
 * @returns {null}   nothing.
 */
function html_container(element, room) {
    console.log("Container for room "+ room.id + " being sent to HTML");
    if (room['container'].length > 0){
        add_labeled_list(room.container_node, 'Containers: ', room['container']);
    }
}

/**
 * 
 * @param {HTMLDivElement} element 
 * @param {object} room
 * @returns {null}   nothing.
 */
function html_room_traps(element, room) {
    if (room['traps'].length > 0) {
        var container = document.createElement('div');
        container.id = 'traps';
        element.appendChild(container);

        var contents = document.createElement('p');
        var traps = [];
        for (var i = 0; i < room['traps'].length; i++) {
            var source = "";
            if (room['traps'][i].Book != "") source += room['traps'][i].Book + " p" + room['traps'][i].Page;
            traps.push(room['traps'][i].Description + " (" + source + ")");
        }
        add_labeled_list(contents, 'Traps: ', traps);
        container.appendChild(contents);
    }
}

/**
 * 
 * @param {HTMLParagraphElement} node 
 * @param {string} label 
 * @param {Array} list
 * @returns {null}   nothing.
 */
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

/**
 * 
 * @param {HTMLParagraphElement} node 
 * @param {string} label 
 * @param {string} text
 * @returns {null}   nothing.
 */
function add_labeled_text(node, label, text) {
    var label_node = document.createElement('span');
    label_node.className  = 'label';
    label_node.innerText = label;

    node.appendChild(label_node);

    add_text(node, text);
}

/**
 * 
 * @param {HTMLParagraphElement} node 
 * @param {string} text
 * @returns {null}   nothing.
 */
function add_text(node, text) {
    var text_node = document.createElement('span');
    text_node.className  = 'text';
    text_node.innerText = text;
    node.appendChild(text_node);
}


/**
 * 
 * @param {dungeon_configuration} dungeonOBJ The object with all the dungeon settings, with generated rooms
 * @returns {dungeon_configuration} Returns the dungeonOBJ with flavor text, features, light, mana, sanctity, hydration, monsters, and traps.
 */
function populate_rooms(dungeonOBJ) {
    var roomIDX;
    for (roomIDX = 1; roomIDX <= dungeonOBJ.n_rooms; roomIDX++) {
        dungeonOBJ.room[roomIDX] = flavor_text_room(dungeonOBJ.room[roomIDX]);
        dungeonOBJ.room[roomIDX] = feature_room(dungeonOBJ.room[roomIDX]);
        dungeonOBJ.room[roomIDX] = light_room(dungeonOBJ.dungeon_overall.light, dungeonOBJ.room[roomIDX]);
        dungeonOBJ.room[roomIDX] = mana_room(dungeonOBJ.dungeon_overall.mana, dungeonOBJ.room[roomIDX]);
        dungeonOBJ.room[roomIDX] = sanctity_room(dungeonOBJ.dungeon_overall.sanctity, dungeonOBJ.room[roomIDX]);
        dungeonOBJ.room[roomIDX] = hydrate_room(dungeonOBJ.room[roomIDX]);
        dungeonOBJ.room[roomIDX] = monster_room(dungeonOBJ, roomIDX, threat_distribution[dungeonOBJ.challenge]);
        dungeonOBJ.room[roomIDX] = trap_room(dungeonOBJ.room[roomIDX], dungeonOBJ.cer);
        // room = treasure_room(dungeonOBJ.room[roomIDX], dungeonOBJ.cer);
        // This had to be moved out as it has the async call to the remote treasure service going on, 
        // and needs to know what node to return to.
    }
    return dungeonOBJ;
}

/**
 * 
 * @param {any} default_light default light level of the dungoen
 * @param {Room} room to light up
 * @returns {Room} room with lighting inserted
 */
function light_room(default_light, room){
    if( random(100) < 75 )
    {
        room.light = default_light;
        return room;
    }
    var light = select_from_weighted_table(roomLighting);
    if (light === {}) return room;
    if (room.light === undefined)
        room.light = [];
    room.light.push(light);
    return room;
}

function mana_room(default_mana, room) {
    if (random(100) < 75) {
        room.mana = default_mana;
        return room;
    }
    var mana = select_from_weighted_table(manaLevels);
    if (mana == {}) return room;
    if (room.mana == undefined)
        room.mana = [];
    room.mana.push(mana);
    return room;
}

function sanctity_room(default_sanctity, room) {
    if (random(100) < 75) {
        room.sanctity = default_sanctity;
        return room;
    }
    var sanctity = select_from_weighted_table(manaLevels);
    if (sanctity == {}) return room;
    if (room.sanctity == undefined)
        room.sanctity = [];
    room.sanctity.push(sanctity);
    return room;
}

function describe_dungeon_itself(dungeonOBJ){
    dungeonOBJ.dungeon_overall = {};
    dungeonOBJ = travel_distance_dungeon(dungeonOBJ);
    dungeonOBJ = light_dungeon(dungeonOBJ);
    dungeonOBJ = mana_dungeon(dungeonOBJ);
    dungeonOBJ = sanctity_dungeon(dungeonOBJ);
    dungeonOBJ = ceiling_dungeon(dungeonOBJ);

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

function mana_dungeon(dungeonOBJ) {

    var manaLevel = select_from_weighted_table(manaLevels);
    if (manaLevel == {}) return dungeonOBJ;
    if (dungeonOBJ.dungeon_overall.mana == undefined)
        dungeonOBJ.dungeon_overall.mana = [];
    dungeonOBJ.dungeon_overall.mana.push(manaLevel);
    return dungeonOBJ;
}

function sanctity_dungeon(dungeonOBJ) {

    var sanctityLevel = select_from_weighted_table(manaLevels);
    if (sanctityLevel == {}) return dungeonOBJ;
    if (dungeonOBJ.dungeon_overall.sanctity == undefined)
        dungeonOBJ.dungeon_overall.sanctity = [];
    dungeonOBJ.dungeon_overall.sanctity.push(sanctityLevel);
    return dungeonOBJ;
}

function ceiling_dungeon(dungeonOBJ){
    
    var ceiling_height = select_from_weighted_table(ceilings);
    if (ceiling_height == {}) return dungeonOBJ;
    if (dungeonOBJ.dungeon_overall.ceiling_height == undefined)
        dungeonOBJ.dungeon_overall.ceiling_height = [];
    dungeonOBJ.dungeon_overall.ceiling_height.push(ceiling_height);
    return dungeonOBJ;
}

function travel_distance_dungeon(dungeonOBJ) {
    console.log("travel_distance_dungeon is " + dungeonOBJ.travel_distance);
    var travelDistance = {};

    if (dungeon_options['travel_distance'][dungeonOBJ.travel_distance]["random"] == 1)
    {
        console.log("Random distance!");
        travelDistance = select_from_weighted_table(travel_times).Type;
        console.log("Random distance set to " + JSON.stringify(travelDistance));
    }
    else
    {
        console.log("Static distance " + dungeonOBJ.travel_distance + "!");
        travelDistance = dungeonOBJ.travel_distance;
        console.log("Static distance set to " + JSON.stringify(travelDistance));
    }
    console.log("travel distance is using this object " + JSON.stringify(dungeon_options['travel_distance'][dungeonOBJ.travel_distance]));
    if (travelDistance == {}) return dungeonOBJ;

    var travelBiome = select_from_weighted_table(biomes).Description;


    if (dungeonOBJ.dungeon_overall.travel_distance == undefined)
        dungeonOBJ.dungeon_overall.travel_distance = [];
    var travel_biome = {
        "travel": travelDistance,
        "biome": travelBiome
    };
    dungeonOBJ.dungeon_overall.travel_distance.push(travel_biome);
    console.log("dungeonOBJ.dungeon_overall.travel_distance is using this object " + JSON.stringify(dungeonOBJ.dungeon_overall.travel_distance));

    console.log("Travel Distance processed in travel_distance_dungeon() as " + JSON.stringify(travelDistance));
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
    
    room.description.forEach(decoration => {
        decoration.Description = expand_tokens(decoration.Description, new_trace(), decoration_data);
    });

    var smellNum = select_from_weighted_table(smellsNumber);
    if (smellNum == {} || smellNum == undefined) return room;
    for (i = 1;
        i <= smellNum.Description;
        i++) {
        table_rolls_to_property(room, smellNum.Tables, "description");
    }

    return room;
}
/**
 * 
 * @param {Room} room 
 */
function feature_room(room) {
    room.contents = [];
    var feat = select_from_weighted_table(feature);
    if (feat == {}) return room;
    room.contents.push(feat.Description);
    room.feature = feat;
    table_rolls_to_property(room, feat.Tables, "contents", ['water', 'monsters', 'traps', 'treasure','container']);

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

/**
 * Assigns water features to room
 * @param {Room} room 
 */
function hydrate_room (room){
    room.water = [];

    var has_water =  false;
    if (room.feature.Tables != undefined) has_water = room.feature.Tables.includes('water');
    if (has_water) {
        table_rolls_to_property(room, 'water', 'water', [], false, true);
    }

    room.water.forEach(water_feature => {
        water_feature.Description = expand_tokens(water_feature.Description, new_trace(), water_data);
    });

    return room;
}

/**
 * 
 * @param {Room} room 
 * @param {Number} cer 
 */
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
    return room;
}

/**
 * Takes a list of tables and pushes their contents onto the provided room object
 * @param {Room} room 
 * @param {string} table_string  - the list of relevant tables as a semicolon separated string
 * @param {string} targetProperty  - the property on Room to populate this into
 * @param {Array} exemptions  - Array of strings indicating which tables to ignore
 * @param {boolean} invert  - invert the exemption list to a whitelist
 * @param {boolean} push_object  - if true pushes the entire object of the table result, if false pushes just the Description of the table result
 */
function table_rolls_to_property(room, table_string, targetProperty, exemptions, invert, push_object) {
    if (targetProperty === undefined){
        targetProperty = "description";
    }
    if (room[targetProperty] === undefined) {
        room[targetProperty] = [];
    }
    if (exemptions === undefined)
        exemptions = ['monsters', 'treasure'];
    if (invert === undefined)
        invert = false;
    if (push_object === undefined)
        push_object = false;

    var tables = get_tables(table_string, exemptions, invert);

    if (tables.constructor === Array) {
        for (var t = 0; t < tables.length; t++) {
            if (tables[t].constructor === Array) {
                if (tables[t].length > 0) {
                    var deco = select_from_weighted_table(tables[t]);
                    if (deco != {}) room[targetProperty].push(
                        push_object ? deco
                            : (deco.Description === undefined ? deco.Name : deco.Description)
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
    dungeonOBJ = order_rooms(dungeonOBJ);
    dungeonOBJ = label_rooms(dungeonOBJ);
    dungeonOBJ = describe_dungeon_itself(dungeonOBJ);
    dungeonOBJ = populate_rooms(dungeonOBJ);
    dungeonOBJ = wandering_monsters(dungeonOBJ);
    dungeonOBJ = prune_doors(dungeonOBJ);
    dungeonOBJ = corridors(dungeonOBJ);
    if (dungeonOBJ.add_stairs) dungeonOBJ = emplace_stairs(dungeonOBJ);
    return dungeonOBJ = gelatinous_cube(dungeonOBJ);
}

/**
 * @returns {Dungeon}
 */
function init_dungeon() {
    var dungeonOBJ = new Dungeon();
    dungeonOBJ.seed = init_seed($("dungeon_name").getValue());
    $H(dungeon_options).keys().each(function(g) {
        dungeonOBJ[g] = $(g).getValue();
    });
    dungeon_options.cer = $("cer").getValue();
    var b = get_dungeon_configuration("dungeon_size", dungeonOBJ),
        c = get_dungeon_configuration("dungeon_layout", dungeonOBJ),
        d = b.size,
        e = c.aspect,
        cellsize = parseInt($("Resolution").getValue());
        
    //cellsize =  b.cell();
    //b = b.cell;
    dungeonOBJ.n_i = Math.floor(d * e );
    dungeonOBJ.n_j = Math.floor(d);
    dungeonOBJ.cell_size = cellsize;
    dungeonOBJ.n_rows = dungeonOBJ.n_i * 2;
    dungeonOBJ.n_cols = dungeonOBJ.n_j * 2;
    dungeonOBJ.max_row = dungeonOBJ.n_rows - 1;
    dungeonOBJ.max_col = dungeonOBJ.n_cols - 1;
    dungeonOBJ.cell = [];
    for (d = 0; d <= dungeonOBJ.n_rows; d++) {
        dungeonOBJ.cell[d] = [];
        for (e = 0; e <= dungeonOBJ.n_cols; e++) dungeonOBJ.cell[d][e] = NOTHING;
    }
    if ( (c = c.mask) != null ) dungeonOBJ = mask_cells(dungeonOBJ, c);
    else if (dungeonOBJ.dungeon_layout ==
        "saltire") dungeonOBJ = saltire_mask(dungeonOBJ);
    else if (dungeonOBJ.dungeon_layout == "hexagon") dungeonOBJ = hex_mask(dungeonOBJ);
    else if (dungeonOBJ.dungeon_layout == "round") dungeonOBJ = round_mask(dungeonOBJ);
    return dungeonOBJ;
}

function get_dungeon_configuration(key, dungeonOBJ) {
    return dungeon_options[key][dungeonOBJ[key]];
}

function mask_cells(dungeonOBJ, dungeon_layout) {
    var c = dungeon_layout.length / (dungeonOBJ.n_rows + 1),
        d = dungeon_layout[0].length / (dungeonOBJ.n_cols + 1),
        e;
    for (e = 0; e <= dungeonOBJ.n_rows; e++) {
        var g = dungeon_layout[Math.floor(e * c)],
            f;
        for (f = 0; f <= dungeonOBJ.n_cols; f++) g[Math.floor(f * d)] || (dungeonOBJ.cell[e][f] = BLOCKED);
    }
    return dungeonOBJ;
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
            dungeonOBJ.cell[d][dungeonOBJ.n_cols - c] = BLOCKED;
        }
    }
    return dungeonOBJ;
}

function hex_mask(dungeonOBJ) {
    var b = Math.floor(dungeonOBJ.n_rows / 2),
        c;
    for (c = 0; c <= dungeonOBJ.n_rows; c++) {
        var d = Math.floor(Math.abs(c - b) * 0.57735) + 1,
            e = dungeonOBJ.n_cols - d,
            g;
        for (g = 0; g <= dungeonOBJ.n_cols; g++)
            if (g < d || g > e) dungeonOBJ.cell[c][g] = BLOCKED;
    }
    return dungeonOBJ;
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
            if (f > 1) dungeonOBJ.cell[d][g] = BLOCKED;
        }
    }
    return dungeonOBJ;
}

/**
 * Takes the dungeon provided and creates rooms.
 * @param {Dungeon} dungeonOBJ
 */
function emplace_rooms(dungeonOBJ) {
    console.log("emplace_rooms");
    var room_size = get_dungeon_configuration("room_size", dungeonOBJ),
        room_layout = get_dungeon_configuration("room_layout", dungeonOBJ);
    dungeonOBJ.huge_rooms = room_size.huge;
    dungeonOBJ.complex_rooms = room_layout.complex;
    dungeonOBJ.n_rooms = 0;
    dungeonOBJ.room = [];
    switch (dungeonOBJ.room_layout){
        case "dense":
            return dense_rooms(dungeonOBJ);
        case "tight":
            return tight_rooms(dungeonOBJ, 5);
        case "scatter":
            return scatter_rooms(dungeonOBJ, 9);
        case "sparse":
            return scatter_rooms(dungeonOBJ, 15);
        case "experimental":
            return experimental_rooms(dungeonOBJ);
        default:
            return scatter_rooms(dungeonOBJ);
    }
}

/**
 * This dungeon layout lays down a set of 3 wide "main hallways" before putting down the rooms. 
 * This is to make the dungeon feel more "sensible", and also to add variety of hallway widths before my players start a riot about the tightness.
 * @param {Dungeon} dungeonOBJ
 * @returns {null} no return - modifies the dungeon directly
 */
function experimental_rooms(dungeonOBJ, pack_factor) {
    pack_factor = pack_factor || 9;
    dungeonOBJ = main_hallways(dungeonOBJ);
    var roomMax = alloc_rooms(dungeonOBJ, null, pack_factor),
        idx;
    for (idx = 0; idx < roomMax; idx++)
        dungeonOBJ = emplace_room(dungeonOBJ);
    //dungeonOBJ = tight_rooms(dungeonOBJ, 9);
    return dungeonOBJ;
}

/**
 * 
 * @param {Dungeon} dungeonOBJ
 * @returns {Dungeon} no return - modifies the dungeon directly
 */
function main_hallways(dungeonOBJ) {
    var midX = Math.round( (dungeonOBJ.max_col / 2));
    var midY = Math.round((dungeonOBJ.max_row / 2));
    for (var shifts = 0; shifts < get_dungeon_configuration("dungeon_size", dungeonOBJ).size/4; shifts++) {
        midX += rand() > 0.5 ? 2: -2;
        midY += rand() > 0.5 ? 2 : -2;
    }

    delve_tunnel(dungeonOBJ, 
        1,                  midX - 1,
        dungeonOBJ.max_row, midX - 1);
    delve_tunnel(dungeonOBJ,
        1,                  midX,
        dungeonOBJ.max_row, midX);
    delve_tunnel(dungeonOBJ,
        1,                  midX + 1,
        dungeonOBJ.max_row, midX + 1);

    delve_tunnel(dungeonOBJ,
        midY - 1,           1,
        midY - 1,           dungeonOBJ.max_col);
    delve_tunnel(dungeonOBJ,
        midY,               1, 
        midY,               dungeonOBJ.max_col);
    delve_tunnel(dungeonOBJ,
        midY + 1,           1,
        midY + 1,           dungeonOBJ.max_col);
    return dungeonOBJ;
}


/**
 * Aggressively place rooms in a very tight pattern, with minimal room for hallways as rooms will be practically 
 * touching. Most connections between rooms will be directly from room to room.
 * @param {Dungeon} dungeonOBJ
 * @param {number} pack_factor the "packing" factor. The higher the pack_factor, the more "empty space"; defaults to 5.
 * @returns {null} no return - modifies the dungeon directly
 */
function tight_rooms(dungeonOBJ, pack_factor) {
    pack_factor = pack_factor || 9;
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

    roomMax = index.findIndex(function (i) { return i['key'] == dungeonOBJ.room_size; });
    for (var roomSizeCurrent = roomMax; roomSizeCurrent >= 0; roomSizeCurrent--) { // for each room size
        const room_count_suggestion = alloc_rooms(dungeonOBJ, dungeon_options.room_size[index[roomSizeCurrent]], pack_factor);
        roomCount = Math.max(1, room_count_suggestion - 2); // tweak
        for (roomIDX = 0; roomIDX < roomCount; roomIDX++) { // put the rooms in
            var room = {
                size: index[roomSizeCurrent]['key']
            };
            //room = new Room(dungeonOBJ.room.length, index[roomSizeCurrent]['key']);
            dungeonOBJ = emplace_room(dungeonOBJ, room);
        }
    }
    return dungeonOBJ;
}

function scatter_rooms(dungeon, pack_factor) {
    pack_factor = pack_factor || 9;
    var b = alloc_rooms(dungeon, null, pack_factor),
        c;
    for (c = 0; c < b; c++) dungeon = emplace_room(dungeon);
    if (dungeon.huge_rooms) { // alocate some medium rooms to squeeze in amongst the huge ones
        b = alloc_rooms(dungeon, "medium");
        for (c = 0; c < b; c++) {
            var d = {
                size: "medium"
            };
            dungeon = emplace_room(dungeon, d);
        }
    }
    return dungeon;
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
            dungeonOBJ = emplace_room(dungeonOBJ, d);
        }
    }
    return dungeonOBJ;
}

function dense_rooms(dungeonOBJ) {
    var b;
    for (b = 0; b < dungeonOBJ.n_i; b++) {
        var c = b * 2 + 1,
            d;
        for (d = 0; d < dungeonOBJ.n_j; d++) {
            var e = d * 2 + 1;
            if (!(dungeonOBJ.cell[c][e] & ROOM))
                if (!((b == 0 || d == 0) && random(2) > 0)) {
                    var g = {
                        i: b,
                        j: d
                    };
                    dungeonOBJ = emplace_room(dungeonOBJ, g);
                    if (dungeonOBJ.huge_rooms)
                        if (!(dungeonOBJ.cell[c][e] & ROOM)) {
                            g = {
                                i: b,
                                j: d,
                                size: "medium"
                            };
                            dungeonOBJ = emplace_room(dungeonOBJ, g);
                        }
                }
        }
    }
    return dungeonOBJ;
}

/**
 * Takes the dungeon provided and figures out how many rooms should be allocated to it, given the room size and desired packing.
 * @param {*} dungeonOBJ 
 * @param {*} room_size_name 
 * @param {*} packing 
 */
function alloc_rooms(dungeonOBJ, room_size_name, packing) {
    console.log("Alloc_rooms");
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
    return room_area;
}

/**
 * 
 * @param {Dungeon} dungeonOBJ 
 * @param {Room} room_definition 
 */
function emplace_room(dungeonOBJ, room_definition) {
    console.log("emplace_room");
    dungeonOBJ = dungeonOBJ;
    if (dungeonOBJ.n_rooms >= 999) return dungeonOBJ; // aaaa too many, quit!

    var room = room_definition || {};
    room = set_room(dungeonOBJ, room);
    var top = room.i * 2 + 1;
    var left = room.j * 2 + 1,
        bottom = (room.i + room.height) * 2 - 1,
        right = (room.j + room.width) * 2 - 1;

    // reject rooms that leave the dungeon
    if (top < 1 || bottom > dungeonOBJ.max_row) return dungeonOBJ;
    if (left < 1 || right > dungeonOBJ.max_col) return dungeonOBJ;

    var new_room = {}, counter = 10;
    new_room.blocked = 1;
    while (new_room.blocked && counter > 0) {
        counter--;
        new_room = sound_room(dungeonOBJ, top, left, bottom, right);
    }
    // reject rooms that are blocked (sound.room determines blocked condition)
    if (new_room.blocked) return dungeonOBJ;

    var existing_room = $H(new_room).keys();
    var room_count = 0;
    if (existing_room.length !== 0) {
        if (existing_room.length === 1)
            if (dungeonOBJ.complex_rooms) {
                if (existing_room[0] !== room.complex_id) return dungeonOBJ;
            } else return dungeonOBJ;
        else return dungeonOBJ;
    } else {
        room_count = dungeonOBJ.n_rooms + 1;
        dungeonOBJ.n_rooms = room_count;
    }
    for (var h = top; h <= bottom; h++) {
        var i;
        for (i = left; i <= right; i++) {
            if (dungeonOBJ.cell[h][i] & ENTRANCE) dungeonOBJ.cell[h][i] &=
                ~ESPACE;
            else if (dungeonOBJ.cell[h][i] & PERIMETER) dungeonOBJ.cell[h][i] &= ~PERIMETER;
            dungeonOBJ.cell[h][i] |= ROOM | room_count << 6;
        }
    }
    var rm_height = (bottom - top + 1) * 10;
    var rm_width = (right - left + 1) * 10;
    room = new Room(room_count,room.size,top,left,top,bottom,left,right,rm_height,rm_width,new Doors([],[],[],[]),[]);

     existing_room = dungeonOBJ.room[room_count];
    if (existing_room != undefined)
        // there's already a room for this room ..?
        if (existing_room.complex != undefined) 
            existing_room.complex.push(room);
        else { // this is actually the first room definition for this "room"
            complex = {
                complex: [existing_room, room]
            };
            dungeonOBJ.room[room_count] = complex;
        }
    else dungeonOBJ.room[room_count] = room;
    for (h = top - 1; h <= bottom + 1; h++) {
        dungeonOBJ.cell[h][left - 1] & (ROOM | ENTRANCE) || (dungeonOBJ.cell[h][left - 1] |= PERIMETER);
        dungeonOBJ.cell[h][right + 1] & (ROOM | ENTRANCE) || (dungeonOBJ.cell[h][right + 1] |= PERIMETER);
    }
    for (i = left - 1; i <=
        right + 1; i++) {
        dungeonOBJ.cell[top - 1][i] & (ROOM | ENTRANCE) || (dungeonOBJ.cell[top - 1][i] |= PERIMETER);
        dungeonOBJ.cell[bottom + 1][i] & (ROOM | ENTRANCE) || (dungeonOBJ.cell[bottom + 1][i] |= PERIMETER);
    }
    return dungeonOBJ;
}

function set_room(dungeonOBJ, room) {
    room.size || (room.size = dungeonOBJ.room_size);
    var c = dungeon_options.room_size[room.size],
        d = c.size || 2;
    c = c.radix || 5;
    if (!("height" in room))
        if ("i" in room) {
            var e = dungeonOBJ.n_i - d - room.i;
            if (e < 0) e = 0;
            e = e < c ? e : c;
            room.height = random(e) + d;
        } else room.height = random(c) + d;
    if (!("width" in room))
        if ("j" in room) {
            e = dungeonOBJ.n_j - d - room.j;
            if (e < 0) e = 0;
            e = e < c ? e : c;
            room.width = random(e) + d;
        } else room.width = random(c) + d;
    "i" in room || (room.i = random(dungeonOBJ.n_i - room.height));
    "j" in room || (room.j = random(dungeonOBJ.n_j - room.width));
    return room;
}

function sound_room(dungeonOBJ, top, left, bottom, right) {
    var candidate_status = {};
    for (top = top-1; top <= bottom+1; top++) {
        var f;
        for (f = left - 1; f <= right + 1; f++) {
            // if one of these cells is labeled BLOCKED, abort abort!
            // These are cells masked out in the dungeon layout (e.g. keep, cross, diamond, etc.)
            if (dungeonOBJ.cell[top][f] & BLOCKED) return {
                blocked: 1
            };

            // If one of these cells is labeled a CORRIDOR, abort abort!
            // This is to ensure that rooms and corridors can be placed in any dang order we please
            if (dungeonOBJ.cell[top][f] & CORRIDOR) return {
                blocked: 1
            };

            // if one of these cells is a room, then identify which room
            if (dungeonOBJ.cell[top][f] & ROOM) {
                var h = (dungeonOBJ.cell[top][f] & ROOM_ID) >> 6; // this has to do with complex rooms in some way
                candidate_status[h] += 1;
            }
        }
    }
    return candidate_status;
}
var connect = {};

/**
 * 
 * @param {Dungeon} dungeonOBJ 
 */
function open_rooms(dungeonOBJ) {
    console.log("Open_rooms");
    connect = {};
    var room;
    for (room = 1; room <= dungeonOBJ.n_rooms; room++) 
        dungeonOBJ = open_room(dungeonOBJ, dungeonOBJ.room[room]);
    return dungeonOBJ;
}

/**
 * 
 * @param {Dungeon} dungeonOBJ 
 * @param {Room} room 
 */
function open_room(dungeonOBJ, room) {
    console.log("Opening room for " + room.id);
    var candidates = door_sills(dungeonOBJ, room);
    if (!candidates.length) return dungeonOBJ;
    var max_door_number = alloc_opens(dungeonOBJ, room),
        i;
    console.log("door candidates of "+ max_door_number + ": " + JSON.stringify(candidates));
    for (i = 0; i < max_door_number; i++) {
        var candidate = candidates.splice(random(candidates.length), 1).shift();
        if (!candidate) break;
        var door_row = candidate.door_r,
            door_column = candidate.door_c;
        var door_cell = dungeonOBJ.cell[door_row][door_column];
        if (!(door_cell & BLOCK_DOOR)) {
            if ((door_cell = candidate.out_id) != null) {
                var door_key = room.id + ',' + door_row + ',' + door_column;
                if (!connect[door_key]) {
                    dungeonOBJ = open_door(dungeonOBJ, room, candidate);
                    connect[door_key] = 1;
                }
            } else dungeonOBJ = open_door(dungeonOBJ, room, candidate);
        }
    }
    dungeonOBJ = order_doors(dungeonOBJ, room);
    return dungeonOBJ;
}

/**
 * Sort the doors on this room in a clockwise manner.
 * @param {Dungeon} dungeonOBJ 
 * @param {Room} room
 */
function order_doors(dungeonOBJ, room) {
    var i;
    for (i = 0; i < 4; i++) {
        var wall = cardinal_dirs_enum_invert[i];
        var wall_i = opposite[wall];

        if (room.door[wall] != undefined && room.door[wall].length > 0) {
            room.door[wall] = room.door[wall].sort(sort_doors_clockwise);
        }
    }

    return dungeonOBJ;
}

/**
 * Sort doors such that they are ordered clockwise
 * @param {Door} a
 * @param {Door} b
 */
function sort_doors_clockwise(a, b) {
    console.warn(JSON.stringify(['sort_doors_clockwise inputs: ', a, b]));
    var result = 0, factor = 1;
    if (a.col < b.col) result = 1;
    if (a.col > b.col) result = -1;
    // else they are equal, test rows
    if (a.row < b.row) result = -1;
    if (a.row > b.row) result = 1;

    if (di[a.direction] != 0) {
        factor = factor * di[a.direction];
    }
    else if (dj[a.direction] != 0) {
        factor = factor * dj[a.direction];
    }
    console.warn(JSON.stringify({ 'label': 'sort_doors_clockwise results: ', 'result': result, 'factor': factor }));
    return result * factor;
}

/**
 * Walk the dungeon, inspecting walls shared between rooms for doors.
 * Strip out excess doors on shared walls and ensure they are listed on both rooms.
 * TODO: define "excess doors" - only one door per wall between rooms? 
 * Only one door per space = 1/2 * length of shared wall segment?
 * @param {Dungeon} dungeonOBJ 
 * @returns {Dungeon} the modified dungeon object.
 */
function prune_doors(dungeonOBJ) {

    // collect doors (not sure which collection will be useful)
    var master_doors = dungeonOBJ.room.map(
        room => {
            return {
                "room": [room.id],
                "doors": room.door,
                "complex": dungeonOBJ.complex_rooms
            };
        }
    );
    master_doors = master_doors.reduce((acc, val) => acc.concat(val), []);


    var doors = [];
    for (var d = 0; d < master_doors.length; d++) {
        var door_obj = master_doors[d];
        var doors_temp = [door_obj.doors.north.slice(), door_obj.doors.east.slice(), door_obj.doors.south.slice(), door_obj.doors.west.slice()].reduce((acc, cur) => acc.concat(cur));
        doors_temp.forEach(door => door.rooms = door_obj.room.slice());
        doors = doors.concat(doors_temp);
    }
    // do stuff here with doors?

    // search around each door for what's up
    doors.forEach(door => {
        var neighbors = [{
            "x": door.col,
            "y": door.row,
            "cell": dungeonOBJ.cell[door.col][door.row]
        }];
        for (var i = 0; i < dj_dirs.length; i++) {
            for (var j = 0; j < dj_dirs.length; j++) {
                var x = door.col + di[dj_dirs[i]] * 2;
                var y = door.row + dj[dj_dirs[i]] * 2;
                if (neighbors.findIndex(value => value.x === x & value.y === y) === -1)
                    neighbors.push({
                        "x": x,
                        "y": y,
                        "cell": dungeonOBJ.cell[door.col][door.row]
                    });
            }
        }
    });
    return dungeonOBJ;
}

function order_rooms(dungeonOBJ){
    var roomIDX;
    // console.log(dungeonOBJ.room);
    var rooms_ordered = dungeonOBJ.room.splice(1,dungeonOBJ.n_rooms);
    rooms_ordered.sort(compare_room);
    for (roomIDX = 0; roomIDX < dungeonOBJ.n_rooms; roomIDX++) {
        // console.log(JSON.stringify(rooms_ordered[roomIDX]));
        if (rooms_ordered[roomIDX] !== undefined) {
            rooms_ordered[roomIDX].oldID = rooms_ordered[roomIDX].id;
            rooms_ordered[roomIDX].id = roomIDX + 1;
        }
    }
    dungeonOBJ.room = dungeonOBJ.room.concat(rooms_ordered);
    // console.log(dungeonOBJ.room);
    return dungeonOBJ;

    function compare_room(a,b){
        if (a === undefined) return -1;
        if (b === undefined) return 1;
        if (a.row <  b.row) return -1;
        if (a.row > b.row) return 1;
        if (a.row ===  b.row && a.col <  b.col) return -1;
        if (a.row ===  b.row && a.col > b.col) return 1;
        return 0;
    }
}

function cmp_int(a, b) {
    return a - b;
}

/**
 * Test and allocate doors
 * @param {Dungeon} dungeon 
 * @param {Room} room 
 */
function door_sills(dungeon, room) {
    //console.log(JSON.stringify({"room ID": room.id, "complex?": room.complex}));
    var cell = dungeon.cell,
        doors, exits = [];
    if (typeof room.complex == Array) room.complex.each(function(sub_room) {
        var sub_room_exits = door_sills(dungeon, sub_room);
        if (sub_room_exits.length) exits = exits.concat(sub_room_exits);
    });
    else {
        var edgeNorth = room.north,
            edgeSouth = room.south,
            edgeWest = room.west,
            edgeEast = room.east;
        var j=0;
        if (edgeNorth >= 3) {
            for (j = edgeWest; j <= edgeEast; j += 2)
                if (
                    (doors = check_sill(cell, room, edgeNorth, j, "north")) != null
                ) {
                    exits.push(doors);
                    //console.log("found door sills: " + JSON.stringify(doors));
                }
        }
        if (edgeSouth <= dungeon.n_rows - 3)
            for (j = edgeWest; j <= edgeEast; j += 2)
                if ((doors = check_sill(cell, room, edgeSouth, j, "south")) != null) {
                    exits.push(doors);
                    //console.log("found door sills: " + JSON.stringify(doors));

                }
        if (edgeWest >= 3)
            for (j = edgeNorth; j <= edgeSouth; j += 2)
                if ((doors = check_sill(cell, room, j, edgeWest, "west")) != null) {
                    exits.push(doors);
                    //console.log("found door sills: " + JSON.stringify(doors));
                }
        if (edgeEast <= dungeon.n_cols - 3)
            for (j = edgeNorth; j <= edgeSouth; j += 2)
                if ((doors = check_sill(cell, room, j, edgeEast, "east")) != null) {
                    exits.push(doors);
                    //console.log("found door sills: " + JSON.stringify(doors));
                }
    }
    return exits;
}

/**
 * Check if this particular location can be a door
 * @param {Array} cells 
 * @param {Room} room 
 * @param {Number} x 
 * @param {Number} y 
 * @param {String} wall 
 * 
 * @returns {Door} Door object
 */
    function check_sill(cells, room, x, y, wall) {
        
    var out_X = x + di[wall],
        out_Y = y + dj[wall],
        target_cell = cells[out_X][out_Y],
        out_cell = cells[out_X][out_Y];
    //console.log(JSON.stringify({"check_sill": 1,"x": x, "y": y, "wall": wall, "target_cell": target_cell, "out_cell": out_cell}));
    if (!(out_cell & PERIMETER)) return false;
    if (out_cell & DOOR) return false;
    if (target_cell & BLOCKED) return false;
    if (out_cell == room.id) return false;
    var h = out_X + di[wall];
    var i = out_Y + dj[wall];
    var out_ID = (out_cell & ROOM_ID) >> 6;
    return {
        sill_r: x,     // sill_r: 
        sill_c: y,     // sill_c: 
        dir:    wall,  // dir:    
        door_r: out_X, // door_r: 
        door_c: out_Y, // door_c: 
        out_id: out_ID // out_id: 
    };
}

/**
 * Calculate the potential number of openings
 * @param {Dungeon} DungeonOBJ 
 * @param {Room} Room 
 * @returns maximum number of openings for this room
 */
function alloc_opens(DungeonOBJ, Room) {
    var room_height = (Room.south - Room.north) / 2 + 1;
    var room_width = (Room.east - Room.west) / 2 + 1;
    var room_diagonal = Math.floor(Math.sqrt(room_width * room_height));
    return room_diagonal = room_diagonal + random(room_diagonal);
}

function open_door(dungeonOBJ, room, candidate) {
    var doors = get_dungeon_configuration("doors", dungeonOBJ),
        doors_table = doors.table;
    var door_row = candidate.door_r;
    var door_column = candidate.door_c,
        f = candidate.sill_r,
        h = candidate.sill_c,
        i = candidate.dir;
    var door_key = '[' + door_row + ',' + door_column + ']';
    var exits_to = candidate.out_id;
    var j;
    for (j = 0; j < 3; j++) {
        var k = f + di[i] * j,
            l = h + dj[i] * j;
        dungeonOBJ.cell[k][l] &= ~PERIMETER;
        dungeonOBJ.cell[k][l] |= ENTRANCE;
    }
    var mask = select_from_table(doors_table);
    var door_obj = new Door(candidate.sill_r, candidate.sill_c, door_row, door_column, mask);
    door_obj.direction = candidate.dir;

    if (dungeonOBJ.door_registry[door_key])
        door_obj = dungeonOBJ.door_registry[door_key];
    else {

        dungeonOBJ.cell[door_row][door_column] |= mask;

        var doortype = getPropertyBySubPropertyValueBitMask(door_types, 'mask', mask);
        door_obj.key = doortype['key'];
        door_obj.type = doortype['type'];
        door_obj.penalty = Math.floor(Math.min(Math.max(rand_between(-1, 3) + rand_between(-1, 3) - (dungeonOBJ.cer / 75), -6), 5));

        dungeonOBJ.door_registry[door_key] = door_obj;
    }

    if (exits_to) door_obj.out_id = exits_to;
    room.door[i].push(door_obj);
    room.last_door = door_obj;
    return dungeonOBJ;
}

function getPropertyBySubPropertyValueBitMask( dict, key, value ) {
    for( var prop in dict ) {
        if( dict.hasOwnProperty( prop ) ) {
             if( dict[ prop ][ key ] & value )
                 return dict[ prop ];
        }
    }
    return undefined;
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
        // console.log("Labelling " + JSON.stringify(dungeonOBJ.room[roomIDX]));
        var rm = dungeonOBJ.room[roomIDX],
            d = rm.id.toString(),
            e = d.length,
            g = Math.floor((rm.north + rm.south) / 2);
        rm = Math.floor((rm.west + rm.east - e) / 2) + 1;
        var f;
        for (f = 0; f < e; f++) dungeonOBJ.cell[g][rm + f] |= d.charCodeAt(f) << 24;
    }
    return dungeonOBJ;
}

/**
 * @param {Dungeon} dungeonOBJ dungeon to add corridors to
 * @returns {Dungeon} DungeonOBJ with the corridors added
 */
function corridors(dungeonOBJ) {
    if (dungeonOBJ.room_layout === 'experimental') {
        dungeonOBJ = corridors_connector(dungeonOBJ);
        //dungeonOBJ = corridors_random(dungeonOBJ);
    } else {
        dungeonOBJ = corridors_random(dungeonOBJ);
    }
    return dungeonOBJ;
}

/**
 * Uses a graph to organize rooms and choose where to add corridors
 * @param {Dungeon} dungeonOBJ dungeon to add corridors to
 * @returns {Dungeon} DungeonOBJ with the corridors added
 */
function corridors_connector(dungeonOBJ) {

    return corridors_connector1(dungeonOBJ);
}

/**
 * Uses a semi-directed process to dig corridors between rooms
 * @param {Dungeon} dungeonOBJ
 * @returns {Dungeon} DungeonOBJ with the corridors added
 */
function corridors_connector1(dungeonOBJ) {
    var corridor_layout = get_dungeon_configuration("corridor_layout", dungeonOBJ);
    console.debug('Connecting corridors using ' + JSON.stringify( corridor_layout ) );
    dungeonOBJ.straight_pct = corridor_layout.pct;
    var unconnected_rooms = dungeonOBJ.room.slice();
    var connected_rooms = [];
    while (unconnected_rooms.length > 0) {
        var orphan = unconnected_rooms.pop();
        if (orphan === undefined) continue;

        var i = Math.floor( rand_between(0, dungeonOBJ.room.length) );
        var connector = dungeonOBJ.room[i];
        if (connector === undefined) continue;

        var orphan_center = orphan.center;
        var connector_center = connector.center;
        var orphan_to_connector = {
            h: Math.sign(orphan_center.h - connector_center.h),
            v: Math.sign(orphan_center.v - connector_center.v)
        };
        console.debug('orphan_to_connector: ' + JSON.stringify(orphan_to_connector));
        var digdirs = shuffle([Object.values(di).indexOf(orphan_to_connector.v), Object.values(dj).indexOf(orphan_to_connector.h)]);
        var dir;
        var result;
        while ((orphan.door[dj_dirs[dir]] || []).length == 0 && digdirs.length > 0) // check for doors on a wall in the "right" direction
            dir = digdirs.pop();
        if ((orphan.door[dj_dirs[dir]] || []).length == 0) {
            digdirs = shuffle(dj_dirs); // clone the full set of directions, shuffled
            while ((orphan.door[dj_dirs[dir]] || []).length == 0 && digdirs.length > 0) // give up, find door on any wall
                dir = digdirs.pop();
        }
        if (orphan.door[dj_dirs[dir]] != undefined) {
            var orphan_doors = shuffle(orphan.door[dj_dirs[dir]]);

            for (i = 0; i < orphan_doors.length; i++) {
                var x = orphan_doors[i].sill_c;
                var y = orphan_doors[i].sill_r;
                dungeonOBJ = tunnel(dungeonOBJ, x, y);
                //if (open_tunnel(dungeonOBJ, orphan_doors[i].sill_c, orphan_doors[i].sill_r, dj_dirs[dir])) {
                //    connected_rooms.push(orphan);
                //    return dungeonOBJ;
                //}
            }

            // all doors on this wall used already... um.
            connected_rooms.push(orphan); // lies and falshood, the doors keep doubling up
        }
        
    }
    return dungeonOBJ;
}

/**
 * @param {Dungeon} DungeonOBJ
 * @returns {Dungeon} DungeonOBJ with the corridors added
 */
function corridors_random(dungeonOBJ){
    var corridor_layout = get_dungeon_configuration("corridor_layout", dungeonOBJ);
    
    dungeonOBJ.straight_pct = corridor_layout.pct;
    for (var x2 = 1; x2 < dungeonOBJ.n_i; x2++) {
        var x = x2 * 2 + 1,
            y2;
        for (y2 = 1; y2 < dungeonOBJ.n_j; y2++) {
            var y = y2 * 2 + 1;
            dungeonOBJ.cell[x][y] & CORRIDOR || (dungeonOBJ = tunnel(dungeonOBJ, x2, y2));
        }
    }
    return dungeonOBJ;
}

/**
 * 
 * @param {Dungeon} dungeonOBJ 
 * @param {number} i 
 * @param {number} j 
 * @param {any[]} in_dir 
 */
function tunnel(dungeonOBJ, i, j, in_dir) {
    in_dir = tunnel_dirs(dungeonOBJ, in_dir);
    in_dir.each(function(each_dir) {
        if (open_tunnel(dungeonOBJ, i, j, each_dir)) {
            var x = i + di[each_dir],
                y = j + dj[each_dir];
            dungeonOBJ = tunnel(dungeonOBJ, x, y, each_dir); // recurse madly off in all directions
        }
    });
    return dungeonOBJ;
}

/**
 * Shuffle cardinal directions 
 * @param {Dungeon} dungeonOBJ 
 * @param {number} b 
 */
function tunnel_dirs(dungeonOBJ, b) {
    var shuffledDirections = shuffle(dj_dirs);
    b && dungeonOBJ.straight_pct && (random(100) < dungeonOBJ.straight_pct) && shuffledDirections.unshift(b);
    return shuffledDirections;
}

/**
 * creates a new array and populates it with the naievely suffled contents of the provided array
 * @param {Array} deck 
 */
function shuffle(deck) {
    deck = deck.concat(); // clone deck
    var b;
    for (b = deck.length - 1; b > 0; b--) {
        var c = random(b + 1),
            d = deck[b];
        deck[b] = deck[c];
        deck[c] = d;
    }
    return deck;
}

/**
 * Open a tunnel segment in the indicated direction if possible. Return success or failure.
 * @param {Dungeon} dungeonOBJ 
 * @param {Number} i - horizontal index of cell to start tunneling from
 * @param {Number} j - vertical index of cell to start tunneling from
 * @param {String} direction the cardinal direction we are going in from this location
 * @returns bool indicating if the tunnel segment was opened
 */
function open_tunnel(dungeonOBJ, i, j, direction) {
    var x = i * 2 + 1,
        y = j * 2 + 1;
    i = (i + di[direction]) * 2 + 1;
    j = (j + dj[direction]) * 2 + 1;
    e = (x + i) / 2,
    f = (y + j) / 2;
    return sound_tunnel(dungeonOBJ, e, f, i, j) ? delve_tunnel(dungeonOBJ, x, y, i, j) : false;
}

/**
 * Test whether this is a valid direction to travel in
 * @param {*} dungeonOBJ 
 * @param {Number} e x index of the cell we start in
 * @param {Number} f y index of the cell we start in
 * @param {Number} i x index of the cell we testing
 * @param {Number} j y index of the cell we testing
 */
function sound_tunnel(dungeonOBJ, e, f, i, j) {
    // is the direction we're going in out of bounds?
    if (i < 0 || i > dungeonOBJ.n_rows) return false;
    if (j < 0 || j > dungeonOBJ.n_cols) return false;

    var x = [e, i].sort(cmp_int), // always go from left to right
        y = [f, j].sort(cmp_int); // always go from top to bottom
    for (j = x[0]; j <= x[1]; j++)
        for (i = y[0]; i <= y[1]; i++)
            if (dungeonOBJ.cell[j][i] & BLOCK_CORR) return false;
    return true;
}

/**
 * Dig from e,f to i,j opening cells as we go
 * @param {Dungeon} dungeonOBJ 
 * @param {Number} e x index of the cell we start in
 * @param {Number} f y index of the cell we start in
 * @param {Number} i x index of the cell we are digging to
 * @param {Number} j y index of the cell we are digging to
 */
function delve_tunnel(dungeonOBJ, e, f, i, j) {
    var x = [e, i].sort(cmp_int); // always go from left to right
        y = [f, j].sort(cmp_int); // always go from top to bottom
    for (j = x[0]; j <= x[1]; j++)
        for (i = y[0]; i <= y[1]; i++) {
            dungeonOBJ.cell[j][i] &= ~ENTRANCE;
            dungeonOBJ.cell[j][i] |= CORRIDOR;
        }
    return true;
}

/**
 * 
 * @param {Dungeon} dungeonOBJ 
 */
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
            g.key = "down";
        } else {
            dungeonOBJ.cell[f][h] |= STAIR_UP;
            g.key = "up";
        }
        d.push(g);
    }
    dungeonOBJ.stair = d;
    return dungeonOBJ;
}

/**
 * 
 * @param {Dungeon} dungeonOBJ 
 */
function stair_ends(dungeonOBJ) {
    var cell = dungeonOBJ.cell,
        stairs = [],
        d;
    for (d = 0; d < dungeonOBJ.n_i; d++) {
        var y = d * 2 + 1,
            g;
        for (g = 0; g < dungeonOBJ.n_j; g++) {
            var x = g * 2 + 1;
            if (dungeonOBJ.cell[y][x] == CORRIDOR) dungeonOBJ.cell[y][x] & STAIRS || $H(stair_end).keys().each(function (direction) {
                if (check_tunnel(cell, y, x, stair_end[direction])) {
                    var stair = {
                        row: y,
                        col: x,
                        dir: direction
                    };
                    direction = stair_end[direction].next;
                    stair.next_row = stair.row + direction[0];
                    stair.next_col = stair.col + direction[1];
                    stairs.push(stair);
                }
            });
        }
    }
    return stairs;
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
    if ((g = stair_end_dir.corridor) != null) {
        g.each(function(f) {
            if (cell[y + f[0]])
                if (cell[y + f[0]][x + f[1]] != CORRIDOR) e = false;
        });
        if (!e) return false;
    }
    if ((stair_end_dir = stair_end_dir.walled) != null) {
        stair_end_dir.each(function(f) {
            if (cell[y + f[0]])
                if (cell[y + f[0]][x + f[1]] & OPENSPACE) e = false;
        });
        if (!e) return false;
    }
    return true;
}

function alloc_stairs(dungeonOBJ) {
    var num_stairs = 0;
    if (dungeonOBJ.add_stairs == "many") {
        dungeonOBJ = dungeonOBJ.n_cols * dungeonOBJ.n_rows;
        num_stairs = 3 + random(Math.floor(dungeonOBJ / 1E3));
    } else if (dungeonOBJ.add_stairs == "yes") num_stairs = 2;
    return num_stairs;
}

function peripheral_egress(a) {
    return a;
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
    return dungeonOBJ = empty_blocks(dungeonOBJ);
}

/**
 * Derives the remove percentage and adds it to dungeonOBJ, calls collapse_tunnels() to close some deadends.
 * @param {Object} dungeonOBJ 
 */
function remove_deadends(dungeonOBJ) {
    var remove_pct = get_dungeon_configuration("remove_deadends", dungeonOBJ);
    dungeonOBJ.remove_pct = remove_pct.pct;
    remove_pct = dungeonOBJ.remove_pct;
    return collapse_tunnels(dungeonOBJ, remove_pct, close_end);
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
    return collapse_tunnels(a, b, close_arcs);
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
                if (everything || random(100) < remove_pct) dungeonOBJ = collapse(dungeonOBJ, x, y, close_end);
        }
    }
    return dungeonOBJ;
}

function collapse(dungeonOBJ, x, y, close_end) {
    var e = dungeonOBJ.cell;
    if (!(dungeonOBJ.cell[x][y] & OPENSPACE)) return dungeonOBJ;
    $H(close_end).keys().each(function(g) {
        if (check_tunnel(e, x, y, close_end[g])) {
            var f;
            if ((f = close_end[g].close) != null) f.each(function(h) {
                e[x + h[0]][y + h[1]] = NOTHING;
            });
            if ((f = close_end[g].open) != null) e[x + f[0]][y + f[1]] |= CORRIDOR;
            if ((g = close_end[g].recurse)!= null ) dungeonOBJ = collapse(dungeonOBJ, x + g[0], y + g[1], close_end);
        }
    });
    dungeonOBJ.cell = e;
    return dungeonOBJ;
}

function fix_doors(dungeonOBJ) {
    var existing_door_coords = {},
        dungeon_doors = [];
    dungeonOBJ.room.each(function(room) {
        var id = room.id;
        $H(room.door).keys().each(function (direction) {
            var overlapping_doors = [];
            room.door[direction].each(function (door) {
                var i = door.row,
                    j = door.col,
                    fill_type = dungeonOBJ.cell[i][j];
                if (fill_type & OPENSPACE) {
                    i = [i, j].join(",");
                    if (existing_door_coords[i] != null ) overlapping_doors.push(door);
                    else {
                        if ((j = door.out_id) != null) {
                            var room = dungeonOBJ.room[j];
                            var l = opposite[direction];
                            door.out_id = {};
                            door.out_id[id] = j;
                            door.out_id[j] = id;
                            room.door[l].push(door);
                        }
                        overlapping_doors.push(door);
                        existing_door_coords[i] = true;
                    }
                }
            });
            if (overlapping_doors.length) {
                room.door[direction] = overlapping_doors;
                dungeon_doors = dungeon_doors.concat(overlapping_doors);
            } else room.door[direction] = [];
        });
    });
    dungeonOBJ.door = dungeon_doors;
    return dungeonOBJ;
}

function empty_blocks(a) {
    var b = a.cell,
        c;
    for (c = 0; c <= a.n_rows; c++) {
        var d;
        for (d = 0; d <= a.n_cols; d++)
            if (b[c][d] & BLOCKED) b[c][d] = NOTHING;
    }
    a.cell = b;
    return a;
}
var palette = {
    standard: {
        colors: {
            fill: "#000000",
            open: "#ffffff",
            open_grid: "#cccccc"
        }
    },
    three_d_se: {
        colors: {
            fill: "#ffffff",
            open: "#ffffff",
            open_grid: "#cccccc",
            wall: "#666666",
            door: "#333333",
            label: "#333333",
            bevel_se: "#666666",
            tag: "#666666"
        }
    },
    three_d_nw: {
        colors: {
            fill: "#ffffff",
            open: "#ffffff",
            open_grid: "#cccccc",
            wall: "#666666",
            door: "#333333",
            label: "#333333",
            bevel_nw: "#666666",
            tag: "#666666"
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
    },
    hatch: {
        colors: {
            fill_hatching: "hatch",
            open: "#ffffff",
            open_grid: "#333333",
            wall: "#666666",
            wall_shading: "#666666",
            hover: "#b6def2",
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

function swap_map() {
    if ($("map").getAttribute("class") == "hidden") {
        $("map").setAttribute("class", "");
        $("playermap").setAttribute("class", "hidden");
    } else {
        $("map").setAttribute("class", "hidden");
        $("playermap").setAttribute("class", "");
    }
}

function image_dungeon_setup(dungeonOBJ) {

    dungeonOBJ['map_details'] = scale_dungeon(dungeonOBJ);
    dungeonOBJ['dungeon_base_image'] = new_image(dungeonOBJ['map_details'].width, dungeonOBJ['map_details'].height, $("playermap"));
    dungeonOBJ['dungeon_image']      = new_image(dungeonOBJ['map_details'].width, dungeonOBJ['map_details'].height, $("map"));
    dungeonOBJ['map_details'].palette = get_palette(dungeonOBJ['map_details']);
    dungeonOBJ['map_details'].base_layer = base_layer(dungeonOBJ, dungeonOBJ['map_details'], dungeonOBJ['dungeon_base_image']);
    fill_image(dungeonOBJ, dungeonOBJ['map_details'], dungeonOBJ['dungeon_image']);
    open_cells(dungeonOBJ, dungeonOBJ['map_details'], dungeonOBJ['dungeon_image']);
    image_walls(dungeonOBJ, dungeonOBJ['map_details'], dungeonOBJ['dungeon_image']);
    fill_image(dungeonOBJ, dungeonOBJ['map_details'], dungeonOBJ['dungeon_base_image']);
    open_cells(dungeonOBJ, dungeonOBJ['map_details'], dungeonOBJ['dungeon_base_image']);
    image_walls(dungeonOBJ, dungeonOBJ['map_details'], dungeonOBJ['dungeon_base_image']);
}

function image_dungeon_player(dungeonOBJ) {
    image_dungeon_setup(dungeonOBJ);
}

function image_dungeon_gm(dungeonOBJ) {
    image_dungeon_player(dungeonOBJ);

    if (dungeonOBJ.door) image_doors(dungeonOBJ, dungeonOBJ['map_details'], dungeonOBJ['dungeon_image']);
    image_room_labels(dungeonOBJ, dungeonOBJ['map_details'], dungeonOBJ['dungeon_image']);
    if (dungeonOBJ.stair) image_stairs(dungeonOBJ, dungeonOBJ['map_details'], dungeonOBJ['dungeon_image']);
}

/**
 * Sets the width and height of the canvas
 * @param {number} width
 * @param {number} height
 * @param {HTMLCanvasElement} canvas
 */
function new_image(width, height, canvas) {
    //var canvas = $("map");
    canvas.width = width;
    canvas.height = height;
    return canvas.getContext("2d");
}

/**
 * 
 * @param {Dungeon} dungeon
 */
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
    //b.width = b.width * 2;
    //b.height = b.height * 2;
    b.max_x = b.width - 1;
    b.max_y = b.height - 1;
    var font_size = Math.floor(b.cell_size * 0.75);
    b.font = font_size.toString() + "px sans-serif";
    return b;
}

function get_palette(dungeonOBJ) {
    var palette_loc;
    if (dungeonOBJ.palette) {
        palette_loc = dungeonOBJ.palette;
    }
    else
    {
        var style = dungeonOBJ.map_style;
        if (style) {
            if (palette[style]) {
                palette_loc = palette[style];
            }
            else
                palette_loc = palette.standard;
        }
        else
            palette_loc = palette.standard;
    }
    // palette = dungeonOBJ.palette ? dungeonOBJ.palette : 
    //     (style = dungeonOBJ.map_style) ?
    //          palette[style] ? palette[style] : palette.standard 
    //     : palette.standard;
    var c;
    if ((c = palette_loc.colors) != null) $H(c).keys().each(function(d) {
        palette_loc[d] = c[d];
    });
    palette_loc.black || (palette_loc.black = "#000000");
    palette_loc.white || (palette_loc.white = "#ffffff");
    return palette_loc;
}

function get_color(a, b) {
    for (; b;) {
        if (a[b]) return a[b];
        b = color_chain[b];
    }
    return "#000000";
}

/**
 * 
 * @param {Object} image
 * @param {any} b
 */
function base_layer(image, b) {
    var canvas = new Element("canvas");
    canvas.width = b.width;
    canvas.height = b.height;
    var context = canvas.getContext("2d"),
        width = b.max_x,
        height = b.max_y,
        palette = b.palette,
        bgColor;
    bgColor = palette.open;
    bgColor != null ? fill_rect(context, 0, 0, width, height, bgColor) : fill_rect(context, 0, 0, width, height, palette.white);
    if ((bgColor = palette.open_grid) != null) image_grid(image, b, bgColor, context);
    else if ((bgColor = palette.grid) != null) image_grid(image, b, bgColor, context);
    return canvas;
}

/**
 * 
 * @param {Object} image
 * @param {any} b
 * @param {any} bgColor
 * @param {CanvasRenderingContext2D} context
 */
function image_grid(image, b, bgColor, context) {
    if (image.grid != "none")
        if (image.grid == "hex") hex_grid(image, b, bgColor, context);
        else image.grid == "vex" ? vex_grid(image, b, bgColor, context) : square_grid(image, b, bgColor, context);
    return true;
}

function square_grid(a, b, c, d) {
    var cellsize = b.cell_size / 2;
    var e;
    for (e = 0; e <= b.max_x; e += cellsize) draw_line(d, e, 0, e, b.max_y, c);
    for (e = 0; e <= b.max_y; e += cellsize) draw_line(d, 0, e, b.max_x, e, c);
    return true;
}

function hex_grid(a, b, c, d) {
    var e = b.cell_size/2;
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
                draw_line(d, i, o, j, o, c);
            } else draw_line(d, i, l, h, o, c);
        }
    }
    return true;
}

function vex_grid(a, b, c, d) {
    var e = b.cell_size/2;
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
                draw_line(d, o, i, o, j, c);
            } else draw_line(d, l, i, o, h, c);
        }
    }
    return true;
}

function fill_image(dungeonOBJ, map_details, dungeon_image) {
    var d = map_details.max_x,
        e = map_details.max_y,
        palette = map_details.palette,
        f;
    if (palette.fill_hatching === "hatch") {
        // load image, tile across dungeon_image
        //fill_rect(dungeon_image, d, e, palette.white); // temporary
        background_image(dungeon_image, 0, 0, d, e, 'hatching');
    } else {
        (f = palette.fill) ? fill_rect(dungeon_image, 0, 0, d, e, f) : fill_rect(dungeon_image, 0, 0, d, e, palette.black);
        if ((f = palette.fill) != null) fill_rect(dungeon_image, 0, 0, d, e, f);
    }
    if ((f = palette.fill_grid) != null) image_grid(dungeonOBJ, map_details, f, dungeon_image);
    else if ((f = palette.grid)!= null ) image_grid(dungeonOBJ, map_details, f, dungeon_image);
    return true;
}

function open_cells(dungeonOBJ, map_details, dungeon_image) {
    var d = map_details.cell_size;
    map_details = map_details.base_layer;
    var e;
    for (e = 0; e <= dungeonOBJ.n_rows; e++) {
        var g = e * d,
            f;
        for (f = 0; f <= dungeonOBJ.n_cols; f++)
            if (dungeonOBJ.cell[e][f] & OPENSPACE) {
                var h = f * d;
                dungeon_image.drawImage(map_details, h, g, d, d, h, g, d, d);
            }
    }
    return true;
}

/**
 * 
 * @param {any} dungeon_image canvas context
 * @param {number} start_x 
 * @param {number} start_y
 * @param {number} width
 * @param {number} height
 * @param {string} fill_image ID of the HTML element containing the hatching image.
 */
function background_image(dungeon_image, start_x, start_y, width, height, fill_image) {
    var hatch = document.getElementById(fill_image);
    var ctx = dungeon_image;
    var pat = ctx.createPattern(hatch, 'repeat');
    ctx.rect(start_x, start_y, width, height);
    ctx.fillStyle = pat;
    ctx.fill();
    return true;
}

function image_walls(dungeonOBJ, map_details, dungeon_image) {
    var rez = map_details.cell_size,
        rez_4th = Math.floor(rez / 4),
        rez_8th = Math.floor(rez / 8);
        
    if (rez_4th < 3) rez_4th = 3;
    if (rez_8th < 2) rez_8th = 2;
    var pal = map_details.palette;
    var color;
    cache_pixels(true);
    var x;
    for (x = 0; x <= dungeonOBJ.n_rows; x++) {
        var x_offset = x * rez,
            x_offset_p = x_offset + rez,
            y;
        for (y = 0; y <= dungeonOBJ.n_cols; y++)
            if (dungeonOBJ.cell[x][y] & OPENSPACE) {
                var y_offset = y * rez,
                    y_offset_p = y_offset + rez;
                if ((color = pal.bevel_nw) ) {
                    dungeonOBJ.cell[x - 1][y - 1] & OPENSPACE || 
                        wall_shading(dungeon_image, y_offset - rez_8th, x_offset - rez_8th, y_offset - 1, x_offset - 1, color);
                    dungeonOBJ.cell[x][y - 1] & OPENSPACE || 
                        wall_shading(dungeon_image, y_offset - rez_8th, x_offset, y_offset - 1, x_offset_p, color);
                    dungeonOBJ.cell[x - 1][y] & OPENSPACE || 
                        wall_shading(dungeon_image, y_offset, x_offset - rez_8th, y_offset_p, x_offset - 1, color);

                } 
                if ((color = pal.bevel_se) ) {
                    dungeonOBJ.cell[x + 1][y + 1] & OPENSPACE || 
                        wall_shading(dungeon_image, y_offset_p + 1, x_offset_p + 1, y_offset_p + rez_8th, x_offset_p + rez_8th, color);
                    dungeonOBJ.cell[x][y + 1] & OPENSPACE || 
                        // draw_line(dungeon_image, y_offset_p + rez_8th, x_offset + rez_8th, y_offset_p + rez_8th, x_offset_p, color);
                        wall_shading(dungeon_image, y_offset_p + 1, x_offset, y_offset_p + rez_8th, x_offset_p, color);
                    dungeonOBJ.cell[x + 1][y] & OPENSPACE || 
                        // draw_line(dungeon_image, y_offset + rez_8th, x_offset_p + rez_8th, y_offset_p, x_offset_p + rez_8th, color);
                        wall_shading(dungeon_image, y_offset, x_offset_p + 1, y_offset_p, x_offset_p + rez_8th, color);
                }
                if ((color = pal.wall_shading) ) {
                    dungeonOBJ.cell[x - 1][y - 1] & OPENSPACE || wall_shading(dungeon_image, y_offset - rez_4th, x_offset - rez_4th, y_offset - 1, x_offset - 1, color);
                    dungeonOBJ.cell[x - 1][y] & OPENSPACE || wall_shading(dungeon_image, y_offset, x_offset - rez_4th, y_offset_p, x_offset - 1, color);
                    dungeonOBJ.cell[x - 1][y + 1] & OPENSPACE || wall_shading(dungeon_image, y_offset_p + 1, x_offset - rez_4th, y_offset_p + rez_4th, x_offset - 1, color);
                    dungeonOBJ.cell[x][y - 1] & OPENSPACE || wall_shading(dungeon_image, y_offset - rez_4th, x_offset, y_offset - 1, x_offset_p, color);
                    dungeonOBJ.cell[x][y + 1] & OPENSPACE || wall_shading(dungeon_image, y_offset_p + 1, x_offset, y_offset_p + rez_4th, x_offset_p, color);
                    dungeonOBJ.cell[x + 1][y - 1] & OPENSPACE || wall_shading(dungeon_image, y_offset - rez_4th, x_offset_p + 1, y_offset - 1, x_offset_p + rez_4th, color);
                    dungeonOBJ.cell[x + 1][y] & OPENSPACE || wall_shading(dungeon_image, y_offset, x_offset_p + 1, y_offset_p, x_offset_p + rez_4th, color);
                    dungeonOBJ.cell[x + 1][y + 1] & OPENSPACE || wall_shading(dungeon_image, y_offset_p + 1, x_offset_p + 1, y_offset_p + rez_4th, x_offset_p + rez_4th, color);
                }
                if ( (color = pal.wall) ) {
                    dungeonOBJ.cell[x - 1][y] & OPENSPACE ||
                        draw_line(dungeon_image, y_offset, x_offset, y_offset_p, x_offset, color);
                    dungeonOBJ.cell[x][y - 1] & OPENSPACE || draw_line(dungeon_image, y_offset, x_offset, y_offset, x_offset_p, color);
                    dungeonOBJ.cell[x][y + 1] & OPENSPACE || draw_line(dungeon_image, y_offset_p, x_offset, y_offset_p, x_offset_p, color);
                    dungeonOBJ.cell[x + 1][y] & OPENSPACE || draw_line(dungeon_image, y_offset, x_offset_p, y_offset_p, x_offset_p, color);
                }
            }
    }
    dump_pixels(dungeon_image);
    return true;
}

function wall_shading(a, b, c, d, e, g) {
    for (b = b; b <= d; b++) {
        var f;
        for (f = c; f <= e; f++)(b + f) % 2 != 0 && set_pixel(a, b, f, g);
    }
    return true;
}

/**
 * Draws the doors on the canvas, based on information from the dungeon and map_details
 * @param {Dungeon} dungeonOBJ
 * @param {any} map_details
 * @param {any} canvas - HTML canvas object
 * @returns {boolean} true/false
 */
function image_doors(dungeonOBJ, map_details, canvas) {
    var rooms = dungeonOBJ.room;
    for (var i = 0; i < rooms.length; i++) {
        if (rooms[i] != undefined) {
            var doors = new Array(rooms[i].door["north"], rooms[i].door["east"], rooms[i].door["south"], rooms[i].door["west"]).reduce((acc, cur) => acc.concat(cur));
            if (doors != undefined && doors.length > 0) {
                for (var j = 0; j < doors.length; j++) {
                    door_object = doors[j];
                    image_text_offset(door_object.sill_r, door_object.sill_c, canvas, String.fromCharCode( 'a'.charCodeAt(0) + j), map_details, door_object.direction, 0.375);
                    draw_door(dungeonOBJ, door_object, map_details, canvas);
                }
            }
        }
    }
    return true;
}

    /**
     * Draws a door using its parameters.
     * @param {Dungeon} dungeonOBJ
     * @param {Door} door_object
     * @param {object} map_details
     * @param {any} canvas - HTML canvas object
     * @returns {null} nothing
     */
    function draw_door(dungeonOBJ, door_object, map_details, canvas) {
        var resolution = map_details.cell_size,
            short = Math.floor(resolution / 6),
            mid = Math.floor(resolution / 4),
            lng = Math.floor(resolution / 3);
        var map_palette = map_details.palette;
        var c_wall = get_color(map_palette, "wall"),
            c_door = get_color(map_palette, "door");
        var y_cell = door_object.row,
            y_pix = y_cell * resolution,
            x_cell = door_object.col,
            x_pix = x_cell * resolution;

        var door_attributes = door_attr(door_object);
        var is_open = dungeonOBJ.cell[y_cell][x_cell - 1] & OPENSPACE;
        y_cell = y_pix + resolution;
        x_cell = x_pix + resolution;
        var y_ = Math.floor((y_pix + y_cell) / 2),
            x_ = Math.floor((x_pix + x_cell) / 2);
        if (door_attributes.wall) is_open ?
            draw_line(canvas, x_, y_pix, x_, y_cell, c_wall) :
            draw_line(canvas, x_pix, y_, x_cell, y_, c_wall);
        if (door_attributes.arch)
            if (is_open) {
                fill_rect(canvas, x_ - 1, y_pix, x_ + 1, y_pix + short, c_wall);
                fill_rect(canvas, x_ - 1, y_cell - short, x_ + 1, y_cell, c_wall);
            } else {
                fill_rect(canvas, x_pix, y_ - 1, x_pix + short, y_ + 1, c_wall);
                fill_rect(canvas,
                    x_cell - short, y_ - 1, x_cell, y_ + 1, c_wall);
            }
        if (door_attributes.door) is_open ?
            stroke_rect(canvas, x_ - mid, y_pix + short + 1, x_ + mid, y_cell - short - 1, c_door) :
            stroke_rect(canvas, x_pix + short + 1, y_ - mid, x_cell - short - 1, y_ + mid, c_door);
        if (door_attributes.lock) is_open ?
            draw_line(canvas, x_, y_pix + short + 1, x_, y_cell - short - 1, c_door) :
            draw_line(canvas, x_pix + short + 1, y_, x_cell - short - 1, y_, c_door);
        if (door_attributes.trap) is_open ?
            draw_line(canvas, x_ - lng, y_, x_ + lng, y_, c_door) :
            draw_line(canvas, x_, y_ - lng, x_, y_ + lng, c_door);
        if (door_attributes.secret)
            if (is_open) {
                draw_line(canvas, x_ - 1, y_ - mid, x_ + 2, y_ - mid, c_door);
                draw_line(canvas, x_ - 2, y_ - mid + 1, x_ - 2, y_ - 1, c_door);
                draw_line(canvas, x_ - 1, y_, x_ + 1, y_, c_door);
                draw_line(canvas, x_ + 2, y_ + 1, x_ + 2, y_ + mid - 1, c_door);
                draw_line(canvas, x_ - 2, y_ + mid, x_ + 1, y_ + mid, c_door);
            } else {
                draw_line(canvas, x_ - mid, y_ - 2, x_ - mid, y_ + 1, c_door);
                draw_line(canvas, x_ - mid + 1, y_ + 2, x_ - 1, y_ + 2, c_door);
                draw_line(canvas, x_, y_ -
                    1, x_, y_ + 1, c_door);
                draw_line(canvas, x_ + 1, y_ - 2, x_ + mid - 1, y_ - 2, c_door);
                draw_line(canvas, x_ + mid, y_ - 1, x_ + mid, y_ + 2, c_door);
            }
        if (door_attributes.portc)
            if (is_open)
                for (y_pix = y_pix + short + 2; y_pix < y_cell - short; y_pix += 2) set_pixel(canvas, x_, y_pix, c_door);
            else
                for (y_pix = x_pix + short + 2; y_pix < x_cell - short; y_pix += 2) set_pixel(canvas, y_pix, y_, c_door);
    }


function door_attr(door) {
    var b = {
        arch: 1
    };
    if (door.mask & OPENSPACE) 
        b.door  = 1;
    if (door.mask & DOOR)
        b.door = 1;
    if (door.mask & STUCK)
        b.stuck = 1;
    if (door.mask & LOCKED)
        b.lock   = 1;
    if (door.mask & TRAPPED)
        b.trap   = 1;
    if (door.mask & SECRET) {
        b.wall   = 1;
        b.secret = 1;
    }
    if (door.mask & PORTC) {
        b.portc = 1;
    }
    return b;
}

function image_room_labels(room, map_details, image) {
    var f;
    for (f = 0; f <= room.n_rows; f++) {
        var h;
        for (h = 0; h <= room.n_cols; h++)
            if (room.cell[f][h] & OPENSPACE) {
                var label = cell_label(room.cell[f][h]);
                if (label) {
                    image_text(f, h, image, label, map_details);
                }
            }
    }
    return true;
}

/**
 * image_text places text with one character per cell, starting at a cell xy coordinate pair.
 * @param {any} cell_x x coordinate to start at
 * @param {any} cell_y y coordinate to start at
 * @param {any} image image object to write on
 * @param {any} text text to write
 * @param {any} map_details map_details object containing information on text style
 */
function image_text(cell_x, cell_y, image, text, map_details) {
    var cell_size = map_details.cell_size,
        map_palette = map_details.palette;
    var font = map_details.font,
        cell_half = Math.floor(cell_size / 2);
    var color = get_color(map_palette, "label");
    var pixel_y = cell_x * cell_size + cell_half + 1,
        pixel_x = cell_y * cell_size + cell_half;
    draw_string(image, text, pixel_x, pixel_y, font, color);
}

/**
 * image_text places text with one character per cell, starting at a cell xy coordinate pair, to be modified by distance
 * @param {any} cell_x x coordinate to start at
 * @param {any} cell_y y coordinate to start at
 * @param {any} image image object to write on
 * @param {any} text text to write
 * @param {any} map_details map_details object containing information on text style
 * @param {number} direction direction to offset the text by
 * @param {number} distance distance to offset the text by (in units of cells) - i.e. 0.5 for half a cell.
 */
function image_text_offset(cell_x, cell_y, image, text, map_details, direction, distance) {
    direction = direction || 0;
    distance = distance || 0;
    var cell_size = map_details.cell_size,
        map_palette = map_details.palette;
    var font = map_details.font,
        cell_half = Math.floor(cell_size / 2),
        cell_nudge = Math.floor(cell_size * distance);
    var color = get_color(map_palette, "label");
    var pixel_y = cell_x * cell_size + cell_half + 1 + (di[direction] * cell_nudge),
        pixel_x = cell_y * cell_size + cell_half + (dj[direction] * cell_nudge);

    draw_string(image, text, pixel_x, pixel_y, font, color);
}

function cell_label(a) {
    a = a >> 24 & 255;
    if (a == 0) return false;
    a = String.fromCharCode(a);
    if (!/^\w/.test(a)) return false;
    if (/[hjkl]/.test(a)) return false;
    return a;
}

function image_stairs(a, b, c) {
    a = a.stair;
    var d = scale_stairs(b.cell_size);
    b = b.palette;
    var e = get_color(b, "stair");
    a.each(function(g) {
        var f = stair_dim(g, d);
        g.key == "up" ? image_ascend(f, e, c) : image_descend(f, e, c);
    });
    return true;
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
    return a;
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
        };
    } else {
        c = Math.floor((a.row + 0.5) * b.cell);
        a = tread_list(a.col, a.next_col, b);
        d = a.shift();
        a = {
            yc: c,
            x1: d,
            list: a
        };
    }
    a.side = b.side;
    a.down = b.down;
    return a;
}

function tread_list(a, b, c) {
    var d = [];
    if (b > a) {
        a = a * c.cell;
        d.push(a);
        b = (b + 1) * c.cell;
        for (a = a; a < b; a += c.tread) d.push(a);
    } else if (b < a) {
        a = (a + 1) * c.cell;
        d.push(a);
        b = b * c.cell;
        for (a = a; a > b; a -= c.tread) d.push(a);
    }
    return d;
}

function image_ascend(a, b, c) {
    if (a.xc) {
        var d = a.xc - a.side,
            e = a.xc + a.side;
        a.list.each(function (h) {
            draw_line(c, d, h, e, h, b);
        });
    } else {
        var g = a.yc - a.side,
            f = a.yc + a.side;
        a.list.each(function (h) {
            draw_line(c, h, g, h, f, b);
        });
    }
    return true;
}

function image_descend(a, b, c) {
    if (a.xc) {
        var d = a.xc;
        a.list.each(function (g) {
            var f = a.down[Math.abs(g - a.y1)];
            draw_line(c, d - f, g, d + f, g, b);
        });
    } else {
        var e = a.yc;
        a.list.each(function (g) {
            var f = a.down[Math.abs(g - a.x1)];
            draw_line(c, g, e - f, g, e + f, b);
        });
    }
    return true;
}

/**
 * Convert from the grid units (10 foot squares) to the GURPS units (3 foot hexes)
 * @param {number} grid 
 */
function grid_to_yards(grid){
    return Math.trunc(grid * 2 / 10);
}

function save_map() {
    save_canvas($("map"), $("dungeon_name").getValue() + ".png");
}

function do_print() {
    var userResolution = $("Resolution").getValue();
    
    var dimensions = {};
    dimensions.width = ( Math.trunc( Global_Dungeon['map_details'].width/userResolution));
    dimensions.height =  ( Math.trunc(Global_Dungeon['map_details'].height/userResolution));
    var printResolution = 
        Math.min( Math.trunc( 1000 / dimensions.width ), Math.trunc(1294 / dimensions.height));
        //Math.min( Math.trunc( 670 / dimensions.width ), Math.trunc(867 / dimensions.height));
    
    console.log("Raw Dimensions: " + JSON.stringify(dimensions));
    console.log("Print Resolution: " + printResolution);
    $("Resolution").setValue( printResolution );
    resolution_change();
    window.print();

    $("Resolution").setValue(userResolution);
    resolution_change();
}

var Global_Dungeon = new dungeon_configuration();

document.observe("dom:loaded", init_form);
