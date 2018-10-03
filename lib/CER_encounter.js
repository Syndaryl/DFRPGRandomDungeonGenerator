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
    var loc_challenge = threat_distribution[dungeonOBJ.challenge];
    var NStats = threats.sort( 
        function(a,b){
            if (a.NgtX > b.NgtX) return -1;
            if (a.NgtX < b.NgtX) return 1;
            return 0;
        }
     );
    /* var roomIDX;
    for (roomIDX = 1; roomIDX <= dungeonOBJ.n_rooms; roomIDX++) {
    
    } */
    if (clear) {
        dungeonOBJ.room[roomIDX].monsters = [];
        dungeonOBJ.room[roomIDX].cer_total = 0;
    }
    dungeonOBJ.room[roomIDX].cer_total |= 0;

    var has_monster = false;
    if (dungeonOBJ.room[roomIDX].feature.Tables != undefined) has_monster = dungeonOBJ.room[roomIDX].feature.Tables.includes('monsters');
    if (has_monster) {
        var encounter_scale = scale_CER(threat_distribution[dungeonOBJ.challenge], dungeonOBJ.cer);
        
        dungeonOBJ.room[roomIDX] = add_monster(roomIDX, threat_table, encounter_scale.cer, dungeonOBJ.room[roomIDX]);
        var N = dungeonOBJ.cer / dungeonOBJ.room[roomIDX].cer_total;
        var encounter_N = threats.findIndex(element => N > element.NgtX);
        if (encounter_N > -1 )
        {
            console.log(JSON.stringify( {
                "room_cer": dungeonOBJ.room[roomIDX].cer_total, 
                "N": N, 
                "Encounter_N": threats[encounter_N].Name
            } ));
            dungeonOBJ.room[roomIDX].challenge = threats[encounter_N].Name;
        }
    }
    return dungeonOBJ.room[roomIDX]

    /**
     * Challenge
     * @param {obj} challenge  - Lookup as key on the threat_distribution table to find what  distribution to use.
     */
    function scale_CER(challenge, cer) {
        var target_cer = cer;
        var target_challenge = select_from_weighted_table(challenge);
        // console.log("Challenge: " + JSON.stringify( challenge));
        console.log("Target challenge: "+ JSON.stringify( target_challenge ));

        // var cer_scale = (rand_between(0.11, 1) + rand_between(0.11, 1) + rand_between(0.11, 1));
        var cer_scale = 1;
        var idx = threatIndex[target_challenge["Description"]];
        console.log("threat level: " + threats[idx].Name);

        if (idx === threatIndex.length - 1){
            cer_scale = rand_between(1/threats[idx-1].NgtX, 1/(threats[idx-1].NgtX / 5) );
            console.log("Epic: " + cer_scale);
        } else if (idx === 0) {
            cer_scale = rand_between(0.1, 1/threats[idx].NgtX );
            console.log("Loser: " + cer_scale);
        } else {
            cer_scale = rand_between(1/threats[idx-1].NgtX, 1/threats[idx].NgtX ) + rand_between(1/threats[idx-1].NgtX, 1/threats[idx].NgtX );
            cer_scale = cer_scale / 2;
            console.log("Other: " + cer_scale);
        }

        target_cer = cer * cer_scale;
        console.log("target_cer: " + target_cer);
        return {"challenge": target_challenge["Description"], "cer": target_cer};
    }
}

function add_monster(roomIDX, threat_table, original_target_cer, room, monster_table) {
    var target_cer = original_target_cer;
    if (typeof(monster_table) == "undefined" ){
        monster_table = monsters;
    }
    var n = 1;
    var room_area = grid_to_yards(room.width) * grid_to_yards(room.height); // units: feet, square feet

    var largest_SM = get_happy_sm(room_area); // largest SM that wants to live in this room

    var encounter_monster = get_monster(largest_SM, target_cer, (target_cer / 20), monster_table);

    var quantity = Math.max( // at least one
        1, Math.round(target_cer / encounter_monster.CER)
    );

    var pick_n_mix = random(100) < 30;

    if (pick_n_mix){
        quantity = Math.max(Math.round( rand_between(1, Math.max(quantity-1, 1))),1);
        if((target_cer - encounter_monster.CER) >= lowest_cer_available) {
            //console.log("PickNMix!");
            room = add_monster(roomIDX, threat_table, (target_cer - encounter_monster.CER), room);
        }
    } else {
    }

    //console.log(
    //    "This is Room " + roomIDX + "; it is " + (grid_to_yards(room.width)) + " x " + (grid_to_yards(room.height)) + " feet (" + room_area + " sq. ft.) The largest SM that wants to live here is " + largest_SM + "\n" +
    //    //"This is a " + threat["Description"] +  " encounter. \n" +
    //    "The target CER is " + target_cer + "\n" +
    //    "The selected monster is " + encounter_monster.Description + " (CER " + encounter_monster.CER + ", SM " + encounter_monster.SM + ")" + "\n" +
    //    "There are " + quantity + " of them. Total CER is " + (encounter_monster.CER * quantity) + ".\n"
    //);

    // console.log(JSON.stringify(qualifying_monsters_table,null,3));
    if ( room.monsters.findIndex( mon => mon.Description == encounter_monster.Description ) == -1)
    {
        room.monsters.push({
            monster: encounter_monster,
            cer: encounter_monster.CER,
            quantity: quantity
            //threat: threat["Description"]
        });
        room.cer_total += (encounter_monster.CER * quantity);
    }
    else
    {   // try again
        add_monster(roomIDX, threat_table, original_target_cer, room, monster_table);
    }
//    console.log(roomIDX + "," + original_target_cer + "," + encounter_monster.CER + "," + room.cer_total);

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

function alphabetical_description(last, current) {
    return last["Description"].localeCompare(current["Description"]);
}

function findWithAttr(array, attr, value) {
    for(var i = 0; i < array.length; i += 1) {
        if(array[i][attr] === value) {
            return i;
        }
    }
    return -1;
}

function onlyUnique(value, index, array) { 
    return findWithAttr(array, "Description", value["Description"]) === index;
}

// produce a weighted map of monsters extant vs quantity found
function wandering_monsters(dungeonOBJ)
{
    var roomIDX;
    var used_monsters = [];
    dungeonOBJ.wandering_monsters = [];
    // list each monster only once
    var unique_monsters = new Multiset();
    //unique_monsters.add_array(used_monsters);

    // collect all monsters used in the dungeon
    for (roomIDX = 1; roomIDX <= dungeonOBJ.n_rooms; roomIDX++) {
        // push all monsters onto used_monsters, rather than push an array of monsters onto used_monsters
        var mons = dungeonOBJ.room[roomIDX].monsters;
        //used_monsters.push.apply(used_monsters, mons.map(function(m) { return m.monster; }) ); 
        for ( var mon_type = 0; mon_type < mons.length; mon_type++)
                for (var mon_count = 0; mon_count < mons[mon_type].quantity; mon_count++)
                {
                    if ( mons[mon_type].monster.Description != "No Qualifying Monsters" 
                        && mons[mon_type].quantity > 0 )
                        {
                            unique_monsters.add(mons[mon_type].monster);
                            var ct = unique_monsters.get(mons[mon_type].monster);
                            unique_monsters.set(mons[mon_type].monster, ct + mons[mon_type].quantity);
                        }
                }
    }

    //used_monsters.sort(alphabetical_description);
        unique_monsters.forEach( 
            function (value, key, map){
                
                var mon = key;
                if (mon.CER <= dungeonOBJ.cer * 1 && mon.CER >= dungeonOBJ.cer * 0.33 && mon.SM < 3 )
                {
                    mon.Weight = map.get(key);
                    used_monsters.push(mon);
                }
            }
        );

    var breakout = 10; // give up padding the list after 10 attempts
    while (used_monsters.length < 6 && breakout > 0) {
        var extra_mon = get_monster(2, dungeonOBJ.cer*1, dungeonOBJ.cer*0.5);
        extra_mon.Weight = 1;
        // check if it's a duplicate.
        if (used_monsters.findIndex( (mon) => mon.Description == extra_mon.Description ) == -1)
            used_monsters.push(extra_mon)
        breakout--;
    }

    dungeonOBJ.wandering_monsters = used_monsters;
    return dungeonOBJ;

}

/**
 * 
 * @param {Number} largest_SM 
 * @param {Number} max_cer 
 * @param {Number} min_cer 
 * @param {Array} monster_table 
 */
function get_monster (largest_SM, max_cer, min_cer, monster_table)
{
    if (typeof(monster_table) == "undefined" ){
        monster_table = monsters;
    }

    var qualifying_monsters_table = monster_table.filter(function (monster) {
        return (monster.CER <= max_cer && monster.CER >= min_cer);
    });

    if (qualifying_monsters_table == undefined || qualifying_monsters_table.length == 0) {
        console.log("qualifying_monsters_table came up undefined or empty after filtering for CER");
        console.trace();
        return dummy_monster(max_cer);
    }

    qualifying_monsters_table = qualifying_monsters_table.filter(function (monster) {
        return monster.SM <= largest_SM;
    });

    if (qualifying_monsters_table == undefined || qualifying_monsters_table.length == 0) {
        console.log("qualifying_monsters_table came up undefined or empty after clamping size");
        console.trace();
        return dummy_monster(max_cer);
    }

    var encounter_monster = select_from_weighted_table(qualifying_monsters_table);

    if (encounter_monster == undefined || encounter_monster == {}) {
        console.log("encounter_monster came up undefined or empty");
        console.trace();
        return dummy_monster(max_cer);
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
        if (count>1) {
            this.set(elem, count-1);
        } else if (count==1) {
            this.delete(elem);
        } else if (count==0)
            throw `tried to remove element ${elem} of type ${typeof elem} from Multiset, but does not exist in Multiset (count is 0 and cannot go negative)`;
            // alternatively do nothing {}
    }
}

    
function fisherYatesShuffle( array ){
    var count = array.length,
        randomnumber,
        temp;
    while( count ){
     randomnumber = rand() * count-- | 0;
     temp = array[count];
     array[count] = array[randomnumber];
     array[randomnumber] = temp
    }
   }