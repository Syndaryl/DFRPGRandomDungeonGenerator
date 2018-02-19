﻿// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// dungeon.js // version 1.0.3
//
// written by drow <drow@bin.sh>
// http://creativecommons.org/licenses/by-nc/3.0/

var pixels = 18;

/**
 * space content "Enum" values
 */
var
    NOTHING     = 0,
    BLOCKED     = 1,        // 0000 0000 0000 0000 0000 0000 0000 0001
    ROOM        = 2,        // 0000 0000 0000 0000 0000 0000 0000 0010
    CORRIDOR    = 4,        // 0000 0000 0000 0000 0000 0000 0000 0100
    // 8 reserved
    PERIMETER   = 16,       // 0000 0000 0000 0000 0000 0000 0001 0000
    ENTRANCE    = 32,       // 0000 0000 0000 0000 0000 0000 0010 0000
    // 64 reserved
    // 128 reserved
    ROOM_ID     = 256,      // 0000 0000 0000 0000 0000 0001 0000 0000
    LABEL       = 512,      // ‭0000 0000 0000 0000 0000 0010 0000 0000‬
    // 1024 reserved
    // 2048 reserved
    STAIR_DN    = 4096,     // 0000 0000 0000 0000 0001 0000 0000 0000
    STAIR_UP    = 8192,     // 0000 0000 0000 0000 0010 0000 0000 0000
    // ‭16384‬ reserved
    // ‭32768‬ reserved
    ARCH        = 65536,    // 0000 0000 0000 0001 0000 0000 0000 0000
    DOOR        = 131072,   // 0000 0000 0000 0010 0000 0000 0000 0000
    LOCKED      = 262144,   // 0000 0000 0000 0100 0000 0000 0000 0000
    TRAPPED     = 524288,   // 0000 0000 0000 1000 0000 0000 0000 0000
    SECRET      = 1048576,  // 0000 0000 0001 0000 0000 0000 0000 0000
    PORTC       = 2097152,  // 0000 0000 0010 0000 0000 0000 0000 0000
    STUCK       = 4194304,  // 0000 0000 0100 0000 0000 0000 0000 0000
    OPENSPACE   = ROOM | CORRIDOR,
    DOORSPACE   = ARCH | DOOR | LOCKED | TRAPPED | SECRET | PORTC,
    DOORTABLE   = DOOR | LOCKED | TRAPPED | SECRET,
    PLAYERWALL  = NOTHING | SECRET,
    PLAYERDOOR  = DOOR | TRAPPED | LOCKED,
    ESPACE      = ENTRANCE | DOORSPACE | LABEL,
    STAIRS      = STAIR_DN | STAIR_UP,
    BLOCK_ROOM  = BLOCKED | ROOM,
    BLOCK_CORR  = BLOCKED | PERIMETER | CORRIDOR,
    BLOCK_DOOR  = BLOCKED | DOORSPACE;

/**
 * Directions north-south
 */
var di = {
    north: -1,
    south: 1,
    west: 0,
    east: 0
};
/**
 * directions east-west
 */
var dj = {
    north: 0,
    south: 0,
    west: -1,
    east: 1
};
var dj_dirs = $H(dj).keys().sort();
/**
 * Find opposite of the given direction
 */
var opposite = {
    north: "south",
    south: "north",
    west: "east",
    east: "west"
};

var door_types = {
    ARCH: {
        mask: ARCH,
        key: "arch",
        type: "Archway"
    },
    DOOR: {
        mask: DOOR,
        key: "open",
        type: "Unlocked Door"
    },
    LOCKED: {
        mask: LOCKED,
        key: "lock",
        type: "Locked Door"
    },
    STUCK: {
        mask: STUCK,
        key: "lock",
        type: "Stuck Door"
    },
    TRAPPED: {
        mask: TRAPPED,
        key: "trap",
        type: "Trapped Door"
    },
    SECRET: {
        mask: SECRET,
        key: "secret",
        type: "Secret Door"
    },
    PORTC: {
        mask: PORTC,
        key: "portc",
        type: "Portcullis"
    }
};


/**
 * Dungeon data set JSON construct
 */
var dungeon_options = {
    map_style: {
        standard: {
            title: "Standard"
        },
        ink_miser: {
            title: "Ink Miser"
        },
        classic: {
            title: "Classic"
        },
        graph: {
            title: "GraphPaper"
        }
    },
    grid: {
        none: {
            title: "None"
        },
        square: {
            title: "Square"
        },
        hex: {
            title: "Hex"
        },
        vex: {
            title: "VertHex"
        }
    },
    dungeon_layout: {
        square: {
            title: "Square",
            aspect: 1
        },
        rectangle: {
            title: "Rectangle",
            aspect: 1.3
        },
        box: {
            title: "Box",
            aspect: 1,
            mask: [
                [1, 1, 1],
                [1, 0, 1],
                [1, 1, 1]
            ]
        },
        cross: {
            title: "Cross",
            aspect: 1,
            mask: [
                [0, 1, 0],
                [1, 1, 1],
                [0, 1, 0]
            ]
        },
        box: {
            title: "L",
            aspect: 2,
            mask: [
                [1, 0],
                [1, 0],
                [1, 1],
                [1, 1]
            ]
        },
        dagger: {
            title: "Dagger",
            aspect: 1.3,
            mask: [
                [0, 1, 0],
                [1, 1, 1],
                [0, 1, 0],
                [0, 1, 0]
            ]
        },
        saltire: {
            title: "Saltire",
            aspect: 1
        },
        triangle: {
            title: "Triangle",
            aspect: 1,
            mask: [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
                [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
                [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
                [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
                [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
                [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
                [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],

            ]
        },
        pyramid: {
            title: "Pyramid",
            aspect: 1,
            mask: [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
                [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
                [0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0],
                [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
                [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
                [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
                [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ]
        },
        keep: {
            title: "Keep",
            aspect: 1,
            mask: [
                [1, 1, 0, 0, 1, 1],
                [1, 1, 1, 1, 1, 1],
                [0, 1, 1, 1, 1, 0],
                [0, 1, 1, 1, 1, 0],
                [1, 1, 1, 1, 1, 1],
                [1, 1, 0, 0, 1, 1]
            ]
        },
        hexagon: {
            title: "Hexagon",
            aspect: 0.9
        },
        round: {
            title: "Round",
            aspect: 1
        }
    },
    dungeon_size: {
        fine: {
            title: "Fine",
            size: 200,
            cell: pixels
        },
        dimin: {
            title: "Diminiutive",
            size: 252,
            cell: pixels
        },
        tiny: {
            title: "Tiny",
            size: 318,
            cell: pixels
        },
        small: {
            title: "Small",
            size: 400,
            cell: pixels
        },
        medium: {
            title: "Medium",
            size: 504,
            cell: pixels
        },
        large: {
            title: "Large",
            size: 635,
            cell: pixels
        },
        huge: {
            title: "Huge",
            size: 800,
            cell: pixels
        },
        gargant: {
            title: "Gargantuan",
            size: 1008,
            cell: pixels
        },
        colossal: {
            title: "Colossal",
            size: 1270,
            cell: pixels
        }
    },
    add_stairs: {
        no: {
            title: "No"
        },
        yes: {
            title: "Yes"
        },
        many: {
            title: "Many"
        }
    },
    room_layout: {
        sparse: {
            title: "Sparse"
        },
        scattered: {
            title: "Scattered"
        },
        tight: {
            title: "Tight"
        },
        dense: {
            title: "Dense"
        }
    },
    room_size: {
        tiny: {
            index: 0,
            title: "Tiny",
            size: 2,
            radix: 1
        },
        small: {
            index: 1,
            title: "Small",
            size: 2,
            radix: 2
        },
        medium: {
            index: 2,
            title: "Medium",
            size: 2,
            radix: 5
        },
        large: {
            index: 3,
            title: "Large",
            size: 5,
            radix: 2
        },
        huge: {
            index: 4,
            title: "Huge",
            size: 5,
            radix: 5,
            huge: 1
        },
        gargant: {
            index: 5,
            title: "Gargantuan",
            size: 8,
            radix: 5,
            huge: 1
        },
        colossal: {
            index: 6,
            title: "Colossal",
            size: 8,
            radix: 8,
            huge: 1
        }
    },
    doors: {
        none: {
            title: "None",
            table: {
                "01-15": ARCH
            },
            locks: {

            }
        },
        basic: {
            title: "Basic",
            table: {
                "01-15": ARCH,
                "16-60": DOOR,
                "61-70": LOCKED,
            },
            locks: {
                
            }
        },
        standard: {
            title: "Standard",
            table: {
                "01-15": ARCH,
                "16-50": DOOR,
                "51-75": LOCKED,
                "76-90": TRAPPED,
                "91-100": SECRET,
                "101-110": PORTC
            },
            locks: {
                
            }
        },
        secure: {
            title: "Secure",
            table: {
                "01-10": ARCH,
                "11-25": DOOR,
                "26-70": LOCKED,
                "71-90": TRAPPED,
                "91-100": SECRET,
                "101-110": PORTC
            },
            locks: {
                
            }
        },
        deathtrap: {
            title: "Deathtrap",
            table: {
                "01-15": LOCKED,
                "16-30": TRAPPED,
                "31-40": SECRET
            },
            locks: {
                
            }
        }
    },
    corridor_layout: {
        labyrinth: {
            title: "Labyrinthian",
            pct: 0
        },
        squiggly: {
            title: "Squiggly",
            pct: 25
        },
        wandering: {
            title: "Wandering",
            pct: 50
        },
        organized: {
            title: "Organized",
            pct: 70
        },
        straight: {
            title: "Straight",
            pct: 100
        }
    },
    remove_deadends: {
        none: {
            title: "None",
            pct: 0
        },
        few: {
            title: "Few",
            pct: 20
        },
        some: {
            title: "Some",
            pct: 50
        },
        most: {
            title: "Most",
            pct: 80
        },
        all: {
            title: "All",
            pct: 100
        }
    }
    /*,
    challenge: {
        cakewalk: {
            title: "Cakewalk",
        },
        easy: {
            title: "Easy",
        },
        average: {
            title: "Average",
        },
        hard: {
            title: "Hard",
        },
        evil: {
            title: "Evil",
        }
    }*/
};

/**
 * 
 * @param {weighted_table_entry[]} decoration
 * @param {weighted_table_entry[]} feature
 * @param {weighted_table_entry[]} decorations
 * @param {weighted_table_entry[]} decorationNumber
 * @param {weighted_table_entry[]} smellsNumber
 * @param {weighted_table_entry[]} smells
 * @param {weighted_table_entry[]} monsters
 * @param {weighted_table_entry[]} treasure
 * @param {weighted_table_entry[]} container
 * @param {weighted_table_entry[]} atmosphere
 * @param {weighted_table_entry[]} concealment
 * @param {weighted_table_entry[]} spring
 */
function tablesIDX(decoration, feature, decorations, decorationNumber, smellsNumber, smells, monsters, treasure, container, atmosphere, concealment, spring, threatDistribution, poison, traps) {
    this.decoration = decoration;
    this.feature = feature;
    this.decorations = decorations;
    this.decorationNumber = decorationNumber;
    this.smellsNumber = smellsNumber;
    this.smells = smells;
    this.monsters = monsters;
    this.treasure = treasure;
    this.container = container;
    this.atmosphere = atmosphere;
    this.concealment = concealment;
    this.spring = spring,
        this.threatDistribution = threatDistribution;
    this.poison = poison;
    this.traps = traps;
}

var tables_index = new tablesIDX(decorations, feature, decorations, decorationNumber, smellsNumber, smells, monsters, treasure, [], atmospheres, concealment, springs, threat_distribution, poison, traps);

/**
 * Configuration settings for the dungeon generator
 * @param {string} style - map style
 * @param {string} gridtype - grid type
 * @param {string} dunlayout - dungeon layout
 * @param {string} dunsize - dungeon size
 * @param {string} stairs - add stairs?
 * @param {string} rmlayout - room layout
 * @param {string} rmsize - room size
 * @param {string} drs - doors
 * @param {string} corlayout - corridor layout
 * @param {string} prunedeads - remove corridor deadends?
 * @param {number} cer - corridor layout
 * @param {string} challenge - general challenge distribution of encounters relative to cer
 */
function dungeon_configuration(style, gridtype, dunlayout, dunsize, stairs, rmlayout, rmsize, drs, corlayout, prunedeads, cer, challenge) {
    this.map_style = style;
    this.grid = gridtype;
    this.dungeon_layout = dunlayout;
    this.dungeon_size = dunsize;
    this.add_stairs = stairs;
    this.room_layout = rmlayout;
    this.room_size = rmsize;
    this.doors = drs;
    this.corridor_layout = corlayout;
    this.remove_deadends = prunedeads;
    this.cer = cer;
    // this.challenge = challenge;
}

/**
 * Last saved query settings for the HTML form
 */
var last_saved_query_json = JSON.parse(localStorage.getItem('last_saved_query'))
if(last_saved_query_json == null) {
    last_saved_query_json = {};
}
var last_saved_query = new dungeon_configuration(
    last_saved_query_json.map_style,
    last_saved_query_json.grid,
    last_saved_query_json.dungeon_layout,
    last_saved_query_json.dungeon_size,
    last_saved_query_json.add_stairs,
    last_saved_query_json.room_layout,
    last_saved_query_json.room_size,
    last_saved_query_json.doors,
    last_saved_query_json.corridor_layout,
    last_saved_query_json.remove_deadends,
    last_saved_query_json.cer
)

/**
 * Default query settings for the HTML form
 */
var default_query = new dungeon_configuration(
    last_saved_query_json.map_style || "ink_miser",
    last_saved_query_json.grid || "hex",
    last_saved_query_json.dungeon_layout || "rectangle",
    last_saved_query_json.dungeon_size || "tiny", 
    last_saved_query_json.add_stairs || "yes",
    last_saved_query_json.room_layout || "scattered",
    last_saved_query_json.room_size || "medium",
    last_saved_query_json.doors || "standard",
    last_saved_query_json.corridor_layout || "organised",
    last_saved_query_json.remove_deadends || "most",
    last_saved_query_json.cer || 125,
    "average" // currently not used
);



/**
 * 
 * @param {number} rm_id
 * @param {Object} rm_size
 * @param {number} rm_row
 * @param {number} rm_col
 * @param {number} rm_north
 * @param {number} rm_south
 * @param {number} rm_west
 * @param {number} rm_east
 * @param {number} rm_height
 * @param {number} rm_width
 * @param {Object} rm_door
 * @param {string[]} rm_description
 */
function room_configuration(rm_id, rm_size, rm_row, rm_col, rm_north, rm_south, rm_west, rm_east, rm_height, rm_width, rm_door, rm_description) {
    this.id = rm_id || 0;
    this.size = rm_size || {
        height: 0,
        width: 0
    };
    this.row = rm_row || 0;
    this.col = rm_col || 0;
    this.north = rm_north || 0;
    this.south = rm_south || 0;
    this.west = rm_west || 0;
    this.east = rm_east || 0;
    this.height = rm_height || 0;
    this.width = rm_width || 0;
    this.door = rm_door || {
        north: [],
        south: [],
        west: [],
        east: []
    };
    this.description = rm_description || "Empty.";
}