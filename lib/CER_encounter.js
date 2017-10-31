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
function monster_room(dungeonOBJ, roomIDX, threat_table) {
    /* var roomIDX;
    for (roomIDX = 1; roomIDX <= dungeonOBJ.n_rooms; roomIDX++) {
    
    } */
    dungeonOBJ.room[roomIDX].monsters = [];

    var has_monster = false;
    if (dungeonOBJ.room[roomIDX].feature.Tables != undefined) has_monster = dungeonOBJ.room[roomIDX].feature.Tables.includes('monsters');
    if (has_monster) {
        var n = 1;

        var target_cer = dungeonOBJ.cer; // base cer
        var threat = select_from_weighted_table(threat_table); // is this a worthy or boss level encounter (including *all* combatants)
        
        if (threat == {}) return room;

        // var is_solo = select_from_weighted_table(solo_or_group).Description == "Solo";

        // calculate the actual working CER for the entire encounter based on threat of the encounter

        var cer_range = get_cer_range(target_cer, threat.N, lowest_cer_available, highest_cer_available);
        //encounter_max = cer_range.max / (is_solo ? 1 : 2);
        //encounter_min = cer_range.min / (is_solo ? 2 : 1);
        encounter_max = cer_range.max;
        encounter_min = cer_range.min;

        // max_cer = target_cer / (n * (is_solo? 1: 2));
        // min_cer = is_solo ? target_cer / (n * 2) : 0;

        var qualifying_monsters_table = monsters.filter(function (monster) {
            return monster.CER >= encounter_min && monster.CER <= encounter_max;
        });

        if (qualifying_monsters_table == undefined || qualifying_monsters_table.length == 0)
        {
            console.log("qualifying_monsters_table came up undefined or empty");
            console.trace();
            dungeonOBJ.room[roomIDX].monsters.push(dummy_monster());
            return room;
        }

        var encounter_monster = select_from_weighted_table(qualifying_monsters_table);

        if (encounter_monster == undefined || encounter_monster == {})
        {
            console.log("encounter_monster came up undefined or empty");
            console.trace();
            dungeonOBJ.room[roomIDX].monsters.push(dummy_monster());
            return room;
        }

        //var quantity = Math.min(1, Math.round(rand_between(min_cer, max_cer) / encounter_monster.CER)); // at least one
        var quantity = Math.max( // at least one
            1, Math.round(rand_between(encounter_monster.CER, target_cer) / encounter_monster.CER)
        ); 

        console.log(
            "This is Room "+ roomIDX + " \n" +
            "This is a " + threat["Description"] +  " encounter. \n" +
            // "This is a " + threat["Description"] + " " + (is_solo ? "solo" : "group") + " encounter. \n" +
            "The target CER is " + target_cer + "\n" +
            "Our N is " + n + ", the min_cer is " + encounter_min + " and the max_cer is " + encounter_max + "\n" +
            "The selected monster is " + encounter_monster.Description + " (CER " + encounter_monster.CER + ")" + "\n" +
            "There are " + quantity + " of them."
        );
        console.log(JSON.stringify(qualifying_monsters_table,null,3));


        dungeonOBJ.room[roomIDX].monsters.push({
            monster: encounter_monster,
            cer: encounter_monster.CER,
            quantity: quantity,
            threat: threat["Description"]
        });
    }
    return room
}

function dummy_monster() {
    return {
        monster: {
            Description: "No Qualifying Monsters"
        },
        cer: target_cer,
        quantity: 1,
        "Source1": "Oops",
        "Page1": 00,
        threat: threat["Description"]
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