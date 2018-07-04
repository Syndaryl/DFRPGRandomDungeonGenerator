var remote_available = false;

remote_reaction();

function remote_reaction() {
    if ($('remote_treasure').checked) {
        var service_available = test_treasure_service_connection();

    } else {
        $('remote_treasure_notice').innerText = 'Remote treasure service disabled';
    }
    //$('remote_treasure').checked
    //$('remote_treasure_notice')
}

function test_treasure_service_connection() {

    var request = new XMLHttpRequest();
    request.open('GET', 'http://df-treasure-generator.herokuapp.com/v1/generate/', false);

    request.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status >= 200 && this.status < 400) {
                // Success!
                remote_available = true;
            } else {
                // We reached our target server, but it returned an error
                remote_available = false;
            }

            if (remote_available) {
                $('remote_treasure_notice').innerText = 'Remote treasure service enabled';
            } else {
                $('remote_treasure_notice').innerText = 'Remote treasure service unavailable; disabled automatically.';
            }
        }
    };

    request.onerror = function () {
        // There was a connection error of some sort
        remote_available = false;
        $('remote_treasure_notice').innerText = 'Remote treasure service unavailable; disabled automatically.';
    };

    request.send();

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

    if (room.container == null) room.container = [];

    request.onreadystatechange = function () {
        console.log("* container readystate: " + this.readyState + " status: " + this.status);
        if (this.readyState == 4) {
            if (this.status >= 200 && this.status < 400) {
                // Success!
                var data = JSON.parse(this.responseText);
                value.current = money_to_number(data['items'][0]['cost_per_item']);
                console.log("* container of value " + value.current + ": " + data.items[0].desc);
                install_container(data, room);
                html_container(element, room);
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
function install_container(json, room) {
    console.log("Container for room "+ room.id + " being installed");
    for (var x = 0; x < json.items.length; x++){
        var item = json.items[x].desc;
        room.container.push(item);
    }
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
                    console.log("done treasure");
                    install_treasure(data, room);
                    html_treasures(element, room);
                    if (has_container) {
                        var horde_weight = 0;
                        fetch_remote_container(room, element, horde_weight, 0, value.min);
                    }
                }
            } else {
                // We reached our target server, but it returned an error
                console.log("Error: Response status " + this.status + ", failing over to manual.");
                if (has_container) manual_container(room);
                manual_treasure(room);
                html_treasures(element, room);
            }
        }
    };

    request.onerror = function () {
        // There was a connection error of some sort
        console.log("Error: Response status " + this.status + ", failing over to manual.");
        manual_treasure(room);
        html_treasures(element, room);
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
    room.container.push('Roll on DF8: Treasure Tables, on the containers table, for an appropriate container.' );
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
 * @param {number} n
 */
function modify_cer_for_treasure(n) {
    for (var i = 0; i < threats.length; i++) {
        if (n > threats[i].NgtX) {
            return threats[i].Treasure;
        }
    }
    return 1;
}

/**
 * 
 * @param {Room} room 
 * @param {number} dungeonCER 
 * @param {HTMLDivElement} element 
 * @param {string} generosity 
 * @param {string} travel_distance 
 */
function treasure_room(room, dungeonCER, element, generosity, travel_distance) {
    /* var roomIDX;
    for (roomIDX = 1; roomIDX <= dungeonOBJ.n_rooms; roomIDX++) {
    
    } */
    room.treasure = [];
    room.container = [];

    var has_treasure = false,
        has_container = false;
    if (room.feature.Tables != undefined) has_treasure = room.feature.Tables.includes('treasure');
    if (room.feature.Tables != undefined) has_container = room.feature.Tables.includes('container');
    var cer = dungeonCER;

    if (room.monsters.length > 0) {
        if (threatIndex[room.challenge] > (threats.length/2)){
            has_treasure = true;
            room.feature.Tables+='; treasure';
        }
    }
    // TODO: check if there is a trap and use encounter cer + ter instead when available.
    // TODO: add ter to the weird atmospheres, as well.
    if (has_treasure) {
        if (room.monsters.length > 0) {
            cer = room.cer_total
        }
        cer *= modify_cer_for_treasure(dungeonCER / cer);
        var horde_min = cer * 5 
            * Number(dungeon_options.generosity[generosity].scale) 
            * Number(dungeon_options.travel_distance[travel_distance[0]['travel']].scale);
        var horde_max = horde_min * (1 + roll_dice('4d6') / 11);

        horde_max = clean_number(horde_max, 2);
        var coin_value = clean_number(horde_min * ((random(10)/20) + 0.15),2);
        if (coin_value > 0){
            var money = cash_value(coin_value); // TODO: treasure types table?
            horde_min -= coin_value;
            horde_max -= coin_value;
            room.treasure.push(money);
        }
        if (remote_available) {
            fetch_remote_treasure(room, element, horde_min, horde_max, has_container)
        }
        else {
            manual_treasure(room, horde_min, horde_max);
            if (has_container) manual_container(room);
            html_treasures(element, room);
            html_container(element, room);
        }
        
    }
    return room
}