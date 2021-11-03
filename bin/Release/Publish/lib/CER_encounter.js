/*eslint eqeqeq: ["warn", "smart"]*/
/*eslint no-extra-parens: ["warn", "all" ]*/
/*eslint valid-jsdoc: "warn"*/
/*eslint no-cond-assign: "warn"*/
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
 * @param {dungeon_configuration} dungeonOBJ The dungeon object
 * @param {number} roomIDX The index of the room in the dungeon object
 * @param {object} threat_table table of threat distributions to use for this dungeon
 * @param {boolean} clear whether to reset the monster list before adding monsters
 * @returns {number} Returns the room after it has been monstered
 */
function monster_room(dungeonOBJ, roomIDX, threat_table, clear = true) {
    console.log("========================================================");
    console.log("monster_room (" + "roomIDX: " + roomIDX + ", clear: " + clear + ")");
    var loc_challenge = threat_distribution[dungeonOBJ.challenge];
    var NStats = threats.sort(
        function (a, b) {
            if (a.NgtX > b.NgtX) return -1;
            if (a.NgtX < b.NgtX) return 1;
            return 0;
        }
    );

    if (clear) {
        dungeonOBJ.room[roomIDX].monsters = [];
        dungeonOBJ.room[roomIDX].cer_total = 0;
    }
    dungeonOBJ.room[roomIDX].cer_total |= 0;

    var has_monster = false;
    if (dungeonOBJ.room[roomIDX].feature.Tables != undefined) has_monster = dungeonOBJ.room[roomIDX].feature.Tables.includes('monsters');
    if (has_monster) {
        var encounter_scale = scale_CER(threat_distribution[dungeonOBJ.challenge], dungeonOBJ.cer);
        console.log("dungeonOBJ.cer: " + dungeonOBJ.cer + ", room CER total: " + dungeonOBJ.room[roomIDX].cer_total + ", encounter_scale: " + JSON.stringify( encounter_scale));

        dungeonOBJ.room[roomIDX] = add_monster(roomIDX, threat_table, encounter_scale.cer, dungeonOBJ.room[roomIDX]);
        var N = dungeonOBJ.cer / dungeonOBJ.room[roomIDX].cer_total;
        var encounter_N = threats.findIndex(element => N > element.NgtX);
        if (encounter_N > -1) {
            //console.log(JSON.stringify({
            //    "room_cer": dungeonOBJ.room[roomIDX].cer_total,
            //    "N": N,
            //    "Encounter_N": threats[encounter_N].Name
            //}));
            dungeonOBJ.room[roomIDX].challenge = threats[encounter_N].Name;
        }
    }
    console.log("final chosen monsters for room " + roomIDX + ": " + JSON.stringify(
        //dungeonOBJ.room[roomIDX].monsters
        dungeonOBJ.room[roomIDX].monsters.map(x => x.monster.Description + " x " + x.quantity)
        ));
    return dungeonOBJ.room[roomIDX];
}
    /**
     * Challenge
     * @param {obj} challenge  - Lookup as key on the threat_distribution table to find what challenge distribution to use.
     * @param {number} cer - target Combat Effectiveness Rating for the encounter - cross referenced with the challenge table.
     * @returns {object} an object with the challenge key as a string description and a CER key with the integer value
     */
    function scale_CER(challenge, cer) {
        var target_cer = cer;
        var target_challenge = select_from_weighted_table(challenge);
        // console.log("Challenge: " + JSON.stringify( challenge));
        //console.log("Target challenge: "+ JSON.stringify( target_challenge ));

        // var cer_scale = (rand_between(0.11, 1) + rand_between(0.11, 1) + rand_between(0.11, 1));
        var cer_scale = 1;
        var idx = threatIndex[target_challenge["Description"]];
        //console.log("threat level: " + threats[idx].Name);

        if (idx == threatIndex.length - 1){
            cer_scale = rand_between(1/threats[idx-1].NgtX, 1/(threats[idx-1].NgtX / 5) );
            //console.log("Epic: " + cer_scale);
        } else if (idx == 0) {
            cer_scale = rand_between(0.1, 1/threats[idx].NgtX );
            //console.log("Loser: " + cer_scale);
        } else {
            cer_scale = rand_between(1/threats[idx-1].NgtX, 1/threats[idx].NgtX ) + rand_between(1/threats[idx-1].NgtX, 1/threats[idx].NgtX );
            cer_scale = cer_scale / 2;
            //console.log("Other: " + cer_scale);
        }

        target_cer = cer * cer_scale;
        //console.log("target_cer: " + target_cer);
        return {"challenge": target_challenge["Description"], "cer": target_cer};
    }

/**
 * Adds monsters to the provided room
 * @param {number} roomIDX
 * @param {Array} threat_table
 * @param {number} original_target_cer
 * @param {Room} room
 * @param {Array} monster_table
 * @returns {Room} - modified room object with monsters
 */
function add_monster(roomIDX, threat_table, original_target_cer, room, monster_table) {
    var target_cer = original_target_cer;
    if (typeof (monster_table) == "undefined") {
        monster_table = monsters;
    }
    var n = 1;
    var room_area = grid_to_yards(room.width) * grid_to_yards(room.height); // units: feet, square feet

    var largest_SM = get_happy_sm(room_area); // largest SM that wants to live in this room

    //console.log(
    //    "This is Room " + roomIDX + "; it is " + (grid_to_yards(room.width)) + " x " + (grid_to_yards(room.height)) + " feet (" + room_area + " sq. ft.) The largest SM that wants to live here is " + largest_SM + "\n" +
    //    //"This is a " + threat["Description"] +  " encounter. \n" +
    //    "The target CER is " + target_cer + "\n" 
    //);
    var encounter_monster = get_monster(largest_SM, target_cer, (target_cer / 8) > highest_cer_available ? (highest_cer_available / 2) : (target_cer / 10) , monster_table);
    if (encounter_monster !== null) {
        var quantity = Math.round(target_cer / encounter_monster.CER);

        quantity = (isFinite(quantity) && quantity > 0) ? quantity : 1;


        var pick_n_mix = random(100) < 30;
        if (!pick_n_mix) {
            add_monster_without_duplication(room, encounter_monster, quantity);
        } else {
            quantity = Math.max(Math.round(rand_between(1, Math.max(quantity - 1, 1))), 1);
            console.log(encounter_monster.Description + " quantity adjusted down to " + quantity + " to make room for pick 'n mix monsters");

            if ((target_cer - encounter_monster.CER) >= lowest_cer_available) {
                room = add_monster(roomIDX, threat_table, (target_cer - encounter_monster.CER), room);
            }

            if (room.monsters.findIndex(mon => mon.Description == encounter_monster.Description) == -1) { // is not a duplicate
                add_monster_without_duplication(room, encounter_monster, quantity);
            }
            else {   // try again
                add_monster(roomIDX, threat_table, original_target_cer, room, monster_table);
            }
        }
    //console.log(roomIDX + ", original_target_cer: " + original_target_cer + ", encounter_monster.CER: " + encounter_monster.CER + ", room.cer_total: " + room.cer_total);
    }
    return room;
}
function add_monster_without_duplication(room, encounter_monster, quantity) {
    var dup_monster = room.monsters.find(obj => obj.monster === encounter_monster);
    if (dup_monster !== undefined) {
        dup_monster.quantity += quantity;
    }
    else {
        room.monsters.push({
            monster: encounter_monster,
            cer: encounter_monster.CER,
            quantity: quantity
        });
    }
    room.cer_total += (encounter_monster.CER * quantity);
}

/**
 * 
 * @param {number} area
 *  @returns {number}
 */
function get_happy_sm(area) {
    var sizeObjectsFiltered = SizeArea.filter(function (x) { return x.Area <= area });
    var sizeList = sizeObjectsFiltered.map(a => a.Size);
    return Math.max.apply(Math.max, sizeList);
}

function dummy_monster(target_cer) {
    return {
        monster: {
            Description: "No Qualifying Monsters"
        },
        cer: 0,
        quantity: 0,
        "Source1": "Oops",
        "Page1": '00'
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
        min: Math.max(1, min_cer),
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

function alphabetical_description(last, current) {
    return last["Description"].localeCompare(current["Description"]);
}

function findWithAttr(array, attr, value) {
    for (var i = 0; i < array.length; i += 1) {
        if (array[i][attr] === value) {
            return i;
        }
    }
    return -1;
}

function onlyUnique(value, index, array) { 
    return findWithAttr(array, "Description", value["Description"]) === index;
}

// produce a weighted map of monsters extant vs quantity found
    function wandering_monsters(dungeonOBJ, monster_table) {
    var roomIDX;
    var used_monsters = [];
    dungeonOBJ.wandering_monsters = [];
    // list each monster only once
    var unique_monsters = new Multiset();

        if (typeof (monster_table) == "undefined") {
            monster_table = monsters;
        }

        console.log("Searching dungeon for wandering monster candidates");

    // collect all monsters used in the dungeon
    for (roomIDX = 1; roomIDX <= dungeonOBJ.n_rooms; roomIDX++) {
        // push all monsters onto used_monsters, rather than push an array of monsters onto used_monsters
        var mons = dungeonOBJ.room[roomIDX].monsters;
        console.debug("coallating " + mons.length + " monsters from room " + roomIDX);
        for (var mon_type = 0; mon_type < mons.length; mon_type++) {
            console.debug(JSON.stringify(mons[mon_type]));
            if (mons[mon_type] === null) {
                console.error("null monster");
                mons[mon_type].splice(mon_count, 1);
            }
            else {
                for (var mon_count = 0; mon_count < mons[mon_type].quantity; mon_count++) {
                    if (mons[mon_type] != null
                        && mons[mon_type].monster.Description != "No Qualifying Monsters"
                        && mons[mon_type].quantity > 0) {
                        //console.log("Adding monster to candidate list");
                        //console.log(mons[mon_type].monster.Description);
                        unique_monsters.add(mons[mon_type].monster);
                        var ct = unique_monsters.get(mons[mon_type].monster);
                        unique_monsters.set(mons[mon_type].monster, ct + mons[mon_type].quantity);
                    }
                }
            }
        }
        console.debug(JSON.stringify(mons));
    }

        //console.log("filtering wandering monster candidates for suitable size and not-too-excessive CER");
    //used_monsters.sort(alphabetical_description);
        unique_monsters.forEach( 
            function (value, key, map) {
                //console.log("assessing " + JSON.stringify({ 'desc': key.Description, 'SM': key.SM, 'CER:': key.CER } ));
                var mon = key;
                if (mon.CER <= (dungeonOBJ.cer * 1.1) && mon.CER >= (dungeonOBJ.cer / 5) && mon.SM < 3) {
                    mon.Weight = map.get(key);
                    used_monsters.push(mon);
                    //console.log("    accepting " + JSON.stringify({ 'desc': key.Description, 'SM': key.SM, 'CER:': key.CER }));
                }
            }
        );

        //console.log(used_monsters.length + " monsters found suitable.");
        //if (used_monsters.length < 6) console.log("gap-fill wandering monster table with extra monsters");

        var breakout = 30; // give up padding the list after too many attempts
        while (used_monsters.length < 6 && breakout > 0) {
            var extra_mon = get_monster(2, dungeonOBJ.cer * 1, dungeonOBJ.cer * 0.33);
            if (extra_mon !== null) {
                extra_mon.Weight = 1;
                // check if it's a duplicate.
                if (used_monsters.findIndex((mon) => mon.Description == extra_mon.Description) == -1)
                    used_monsters.push(extra_mon);
            }
            breakout--;
        }

        console.log(used_monsters.length + " monsters finally found for the wandering monster table.");

        if (used_monsters.length < 3) {
            console.log("This wandering monster table is super-short and/or nonexistant.");
        }

    dungeonOBJ.wandering_monsters = used_monsters;
    return dungeonOBJ;

}

/**
 * 
 * @param {Number} largest_SM - the largest monster to pick (in order to not squeeze a dragon into a closet)
 * @param {Number} max_cer - highest CER to accept
 * @param {Number} min_cer - lowest CER to accept
 * @param {Array} monster_table - which table to roll on (Defaults to the standard full table)
     * @returns {object} returns a monster structure
 */
function get_monster(largest_SM, max_cer, min_cer, monster_table) {
    console.log("Get_monster(largest_SM: " + largest_SM + ", max_cer: " + max_cer + ", min_cer: " + min_cer + ", monster_table: " + (typeof monster_table == "undefined"? 0: monster_table.length) + " entries" );
    if (typeof(monster_table) == "undefined" ){
        monster_table = monsters;
    }
 
    var qualifying_monsters_table = monsters_in_CER_bracket(monster_table, max_cer, min_cer);

    if (qualifying_monsters_table == undefined || qualifying_monsters_table.length == 0) {
        console.log("qualifying_monsters_table came up undefined or empty after filtering for CER");
        console.trace();
        return null;
    }

    qualifying_monsters_table = qualifying_monsters_table.filter(function (monster) {
        return monster.SM <= largest_SM;
    });

    if (qualifying_monsters_table == undefined || qualifying_monsters_table.length == 0) {
        console.log("qualifying_monsters_table came up undefined or empty after clamping size");
        console.trace();
        return null;
    }

    var encounter_monster = select_from_weighted_table(qualifying_monsters_table);

    if (encounter_monster == undefined || encounter_monster == {}) {
        console.log("encounter_monster came up undefined or empty");
        console.trace();
        return null;
    }
    return encounter_monster;
}

class Multiset extends Map {
    constructor(...args) {
        super(...args);
    }
    add(elem) {
        if (typeof(elem) !== 'undefined')
            if (!this.has(elem))
                this.set(elem, 1);
            else
                this.set(elem, this.get(elem)+1);
    }
    
    /**
     * 
     * @param {Array} arr 
     */
    add_array(arr) {
        arr.forEach(element => {
            this.add(element);
        });
    }
    remove(elem) {
        var count = this.has(elem) ? this.get(elem) : 0;
        if (count > 1) {
            this.set(elem, count - 1);
        } else if (count == 1) {
            this.delete(elem);
        } else if (count == 0)
            throw `tried to remove element ${elem} of type ${typeof elem} from Multiset, but does not exist in Multiset (count is 0 and cannot go negative)`;
            // alternatively do nothing {}
    }
}

    
    function monsters_in_CER_bracket(monster_table, max_cer, min_cer) {
        return monster_table.filter(function (monster) {
            return (monster.CER <= max_cer && monster.CER >= min_cer);
        });
    }
function fisherYatesShuffle(array) {
    var count = array.length,
        randomnumber,
        temp;
    while (count) {
     randomnumber = rand() * count-- | 0;
     temp = array[count];
     array[count] = array[randomnumber];
     array[randomnumber] = temp;
    }
   }