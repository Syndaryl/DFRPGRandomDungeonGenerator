// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// dungeon/gen_data.js
//
// written by drow <drow@bin.sh>
// http://creativecommons.org/licenses/by-nc/3.0/
var gen_data = {
    "Dungeon Name": ["The ${ Dungeon Type } of ${ Dire Horror } ${ Dungeon Horror }", "The ${ Lost Dungeon } ${ Dungeon Type } of ${ Dungeon Horror }", "The ${ Dungeon Type } of ${ lt The Darklord }", "The ${ Lost Dungeon } ${ Dungeon Type } of ${ lt The Darklord }"],
    "Lost Dungeon": ["Black", "Dark", "Dread", "Forsaken", "Lost", "Secret", "Cryptic", "Rumoured", "Mythical"],
    "Dungeon Type": ["Barrow", "Catacombs", "Caverns", "Chambers", "Crypts", "Cyst", "Delve", "Dungeon", "Gauntlet", "Halls", "Hive", "Labyrinth", "Lair", "Pit", "Prison", "Sanctum",
        "Sepulcher", "Shrine", "Temple", "Tomb", "Tunnels", "Undercrypt", "Vaults", "Warrens"
    ],
    "Dire Horror": ["${ Bloody Epithet }", "${ Dark Epithet }", "${ Dire Epithet }", "${ Eldritch Epithet }", "${ Fiendish Epithet }", "${ Mighty Epithet }"],
    "Bloody Epithet": ["Bloody", "Crimson", "Ghastly", "Gruesome","Blood-Spattered","Bone-Crunching"],
    "Dark Epithet": ["Aphotic", "Black", "Dark", "Dismal", "Gloomy", "Tenebrous", "Shadowy", "Sunless"],
    "Dire Epithet": ["Baleful", "Cruel", "Dire", "Grim", "Horrendous", "Merciless", "Poisonous", "Sinister", "Treacherous", "Unspeakable",
        "Woeful"
    ],
    "Eldritch Epithet": ["Arcane", "Demonic", "Eldritch", "Elemental", "Fiendish", "Infernal", "Unearthly"],
    "Fiendish Epithet": ["Abyssal", "Accursed", "Baatorian", "Black", "Corrupt", "Damned", "Demonic", "Fallen", "Fell", "Fiendish", "Hellish", "Malefic", "Malevolent", "Malign", "Profane", "Vile", "Wicked"],
    "Mighty Epithet": ["Adamant", "Awesome", "Indomitable", "Mighty", "Terrible"],
    "Dungeon Horror": ["Ages", "Annihilation", "Chaos", "Death", "Devastation", "Doom", "Evil", "Hell", "Horror", "Madness", "Malice", "Necromancy", "Nightmares", 
        "Ruin", "Secrets", "Sorrows", "Souls", "Terror", "The Abyss", "Things Mortals Were Not Meant To Know", "Woe", "Worms"
    ],
    "The Darklord": ["${ Named Darklord }", "${ Darklord Name }", "${ Darklord Name } the ${ Darklord Epithet }", "${ Darklord Name } the ${ Darklord Epithet } ${ Noble Title }","The ${ Monster Epithet } ${ Noble Title }", "${ Darklord Name } the ${ Monster Epithet } ${ Noble Title }"],
    "Named Darklord": ["Emirkol the Chaotic", "Gothmog of Udun", "Kas the Bloody", "Kas the Betrayer", "Lord Greywulf", "Marceline the Vampire Queen", "Shiva the Destroyer", "The Goblin King", "Ulfang the Black", "Zeiram the Lich"],
    "Darklord Name": ["${ gen_name Draconic }", "${ gen_name Gothic }", "${ gen_name Fiendish }", "${ gen_name Latin }", "${ gen_name Elvish }", "${ gen_name Aztec }"],
    "Darklord Epithet": ["${ Bloody Epithet }", "${ Dire Epithet }", "${ Eldritch Epithet }", "${ Fiendish Epithet }", "${ Insane Epithet }", "${ Mighty Epithet }", "${ Darkmage }"],
    "Insane Epithet": ["Deranged", "Insane", "Lunatic", "Mad", "Possessed"],
    Darkmage: ["Archmage", "Enchantress", "Necromancer", "Pontifex", "Sorceror", "Warlock", "Witch"],
    "Monster Epithet": ["Demon", "Dragon", "Gargoyle", "Lich", "Shadow", "Vampire", "Wraith", "Wyrm"],
    "Noble Title": ["Baron", "Count", "Duke", "Knight", "Lord", "Warlord", "Baroness", "Countess", "Duchess",
        "Knight", "Emperor", "King", "Prince", "Tyrant", "Empress", "Princess", "Queen"
    ]
};