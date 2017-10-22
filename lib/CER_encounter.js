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
        var threat = select_from_weighted_table(threat_table);
        if (threat == {}) return room;
        var solo = select_from_weighted_table(solo_or_group).Description == "Solo";
        console.log("This is a " + threat["Description"] + " "+ (solo? "solo" : "group") +" encounter. ");
        var target_cer = dungeonOBJ.cer;

        var n = 1;
        var tiny_cer_monster = monsters.reduce(lowest_cer);
        var huge_cer_monster = monsters.reduce(highest_cer);
        if (threat.N.min != undefined && threat.N.max != undefined) { // min and max defined
            n = rand_between(threat.N.min, threat.N.max);
        } else if (threat.N.min == undefined && threat.N.max != undefined) { // no minimum - defaults to 0
            n = rand_between(0, threat.N.max);
        } else if (threat.N.min != undefined && threat.N.max == undefined) { // no maximum - get the smallest CER off the chart and calculate N from that to find the maximum
            
            n = rand_between(threat.N.min, target_cer / tiny_cer_monster.CER);
        }
        var max_cer = target_cer / (n * (solo? 1: 2));
        var min_cer = solo ? target_cer / (n * 2) : 0;

        var qualifying_monsters_table = monsters.filter(function (monster, max_cer) {
            return monster.CER <= max_cer;
        });

        monster = select_from_weighted_table(qualifying_monsters_table);

        var quantity = Math.ceil( monster.CER / rand_between(min_cer, max_cer));

        if (monster == {}) return room;
        dungeonOBJ.room[roomIDX].monsters.push({
            monster: monster,
            cer: monster.cer,
            quantity: quantity
        });
    }
    return room
}
function highest_cer(last, current) {
    if (last["CER"] > current["CER"]) return last;
    return current;
}

function lowest_cer(last, current) {
    if (last["CER"] < current["CER"]) return last;
    return current;
}