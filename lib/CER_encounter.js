// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// CER_encounter.js // version 1.0
//
// written by Emily Smirle <emily.smirle@gmail.com>
// http://creativecommons.org/licenses/by-nc/3.0/

// the purpose of this library is to create an encounter of monsters appropriate for 
// a given DF party CER (See Pyramid vol. 3 #77, "It's a Threat" by Christopher Rice)

/**
 * What proportion of encounters should allow solo monsters.
 */
var solo_or_group = [
    new weighted_table_entry(2, "Solo"),
    new weighted_table_entry(5, "Group")
];

var lowest_cer_available = monsters.reduce(lowest_cer).CER;
var highest_cer_available = monsters.reduce(highest_cer).CER;

var encounter_max = 0;
var encounter_min = 0;

/**
 *
 * @param {dungeon_configuration} dungeonOBJ
 * @param {number} roomIDX
 */
function monster_room(dungeonOBJ, roomIDX, threat_table, clear = true) {
    /* var roomIDX;
    for (roomIDX = 1; roomIDX <= dungeonOBJ.n_rooms; roomIDX++) {
    
    } */
    if (clear)
        dungeonOBJ.room[roomIDX].monsters = [];

    var has_monster = false;
    if (dungeonOBJ.room[roomIDX].feature.Tables != undefined) has_monster = dungeonOBJ.room[roomIDX].feature.Tables.includes('monsters');
    if (has_monster) {

        var target_cer = dungeonOBJ.cer; // base cer
        target_cer *= rand_between(0.33, 3);
        
        dungeonOBJ.room[roomIDX] = add_monster(roomIDX, threat_table, target_cer, dungeonOBJ.room[roomIDX]);
    }
    return dungeonOBJ.room[roomIDX]
}

function add_monster(roomIDX, threat_table, target_cer, room) {
    var n = 1;
    var room_area = room.width * room.height; // units: feet, square feet


    var largest_SM = get_happy_sm(room_area); // largest SM that wants to live in this room

    var qualifying_monsters_table = monsters.filter(function (monster) {
        return (monster.CER <= target_cer && monster.CER >= (target_cer / 20));
    });

    if (qualifying_monsters_table == undefined || qualifying_monsters_table.length == 0) {
        console.log("qualifying_monsters_table came up undefined or empty ater filtering for CER");
        console.trace();
        room.monsters.push(dummy_monster(target_cer));
        return room;
    }

    qualifying_monsters_table = qualifying_monsters_table.filter(function (monster) {
        return monster.SM <= largest_SM;
    });

    if (qualifying_monsters_table == undefined || qualifying_monsters_table.length == 0) {
        console.log("qualifying_monsters_table came up undefined or empty after clamping size");
        console.trace();
        room.monsters.push(dummy_monster(target_cer));
        return room;
    }

    var encounter_monster = select_from_weighted_table(qualifying_monsters_table);

    if (encounter_monster == undefined || encounter_monster == {}) {
        console.log("encounter_monster came up undefined or empty");
        console.trace();
        room.monsters.push(dummy_monster(target_cer));
        return room;
    }

    var quantity = 
    quantity = Math.max( // at least one
        1, Math.round(target_cer / encounter_monster.CER)
    );;

    var pick_n_mix = random(100) < 30;

    if (pick_n_mix){
        quantity = Math.max(Math.round( rand_between(1, Math.max(quantity-1, 1))),1);
        if((target_cer - encounter_monster.CER) >= lowest_cer_available) {
            console.log("PickNMix!");
            room = add_monster(roomIDX, threat_table, (target_cer - encounter_monster.CER), room);
        }
    } else {
    }

    //console.log(
    //    "This is Room " + roomIDX + "; it is " + room['width'] + " x " + room['height'] + " feet (" + room_area + " sq. ft.) The largest SM that wants to live here is " + largest_SM + "\n" +
    //    //"This is a " + threat["Description"] +  " encounter. \n" +
    //    "The target CER is " + target_cer + "\n" +
    //    "The selected monster is " + encounter_monster.Description + " (CER " + encounter_monster.CER + ", SM " + encounter_monster.SM + ")" + "\n" +
    //    "There are " + quantity + " of them. Total CER is " + (encounter_monster.CER * quantity) + ".\n"
    //);

    // console.log(JSON.stringify(qualifying_monsters_table,null,3));


    room.monsters.push({
        monster: encounter_monster,
        cer: encounter_monster.CER,
        quantity: quantity
        //threat: threat["Description"]
    });

    return room;
}

/**
 * 
 * @param {number} area
*  @returns {number}
 */
function get_happy_sm(area)
{
    var sizeObjectsFiltered = SizeArea.filter(function (x) { return x.Area <= area });
    var sizeList = sizeObjectsFiltered.map(a => a.Size);
    return Math.max.apply(Math.max, sizeList);
}

function dummy_monster(target_cer) {
    return {
        monster: {
            Description: "No Qualifying Monsters"
        },
        cer: target_cer,
        quantity: 1,
        "Source1": "Oops",
        "Page1": 00
    };
}

function get_cer_range(target_cer, n_range, lowest_cer_available, highest_cer_available) {
    var min_cer;
    var max_cer;
    
    if (n_range.min != undefined && n_range.max != undefined) { // min and max defined
        min_cer = target_cer / n_range.max;
        max_cer = target_cer / n_range.min;
    } else if (n_range.min == undefined && n_range.max != undefined) {
        min_cer = lowest_cer_available; 
        max_cer = target_cer /  n_range.min;
    } else if (n_range.min != undefined && n_range.max == undefined) { // no maximum - get the smallest CER off the chart and calculate N from that to find the maximum
        min_cer = target_cer /  n_range.max;
        max_cer = highest_cer_available;
    } else { // everthing undefined, aaaaaa
        min_cer = lowest_cer_available;
        max_cer = highest_cer_available;
    }
    
    return {
        min: Math.max(1,min_cer),
        max: Math.max(2, max_cer)
    };
}

function highest_cer(last, current) {
    if (last["CER"] > current["CER"]) return last;
    return current;
}

function lowest_cer(last, current) {
    if (last["CER"] < current["CER"]) return last;
    return current;
}