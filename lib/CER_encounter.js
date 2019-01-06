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
var monsters = [
    {
    "Description": "Acid Spider",
    "Class": "Dire Animal",
    "SM": 2,
    "Subclass": "Spider. Acid",
    "Environment": "any",
    "OR": 32,
    "PR": 62,
    "CER": 94,
    "Source1": "Dungeon Fantasy 2: Dungeons",
    "Page1": 21,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 16,
    "Weight": 1
    },
    {
    "Description": "as-Sharak (Agni)",
    "Class": "Demon",
    "SM": 0,
    "Subclass": "Demon. Humanoid. Fire",
    "Environment": "Dungeon",
    "OR": 29.5,
    "PR": 59,
    "CER": 88.5,
    "Source1": "Dungeon Fantasy 2: Dungeons",
    "Page1": 21,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 16,
    "Weight": 1
    },
    {
    "Description": "as-Sharak (Akasha)",
    "Class": "Demon",
    "SM": 0,
    "Subclass": "Demon. Humanoid. Spirit",
    "Environment": "Dungeon",
    "OR": 25,
    "PR": 59,
    "CER": 84,
    "Source1": "Dungeon Fantasy 2: Dungeons",
    "Page1": 21,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 16,
    "Weight": 1
    },
    {
    "Description": "as-Sharak (Jala)",
    "Class": "Demon",
    "SM": 0,
    "Subclass": "Demon. Humanoid. Water",
    "Environment": "Dungeon",
    "OR": 50,
    "PR": 59,
    "CER": 109,
    "Source1": "Dungeon Fantasy 2: Dungeons",
    "Page1": 21,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 16,
    "Weight": 1
    },
    {
    "Description": "as-Sharak (Prithvi)",
    "Class": "Demon",
    "SM": 0,
    "Subclass": "Demon. Humanoid. Earth",
    "Environment": "Dungeon",
    "OR": 32.5,
    "PR": 59,
    "CER": 91.5,
    "Source1": "Dungeon Fantasy 2: Dungeons",
    "Page1": 21,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 16,
    "Weight": 1
    },
    {
    "Description": "as-Sharak (Vayu)",
    "Class": "Demon",
    "SM": 0,
    "Subclass": "Demon. Humanoid. Wind",
    "Environment": "Dungeon",
    "OR": 29.5,
    "PR": 59,
    "CER": 88.5,
    "Source1": "Dungeon Fantasy 2: Dungeons",
    "Page1": 21,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 16,
    "Weight": 1
    },
    {
    "Description": "Crushroom",
    "Class": "Plant",
    "SM": 0,
    "Subclass": "Plant",
    "Environment": "Dungeon",
    "OR": 14,
    "PR": 55,
    "CER": 69,
    "Source1": "Dungeon Fantasy 2: Dungeons",
    "Page1": 22,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 19,
    "Weight": 1
    },
    {
    "Description": "Dire Wolf",
    "Class": "Giant Animal",
    "SM": 1,
    "Subclass": "Mammal",
    "Environment": "Outdoor. cave",
    "OR": 14,
    "PR": 13,
    "CER": 27,
    "Source1": "Dungeon Fantasy 2: Dungeons",
    "Page1": 22,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 19,
    "Weight": 1
    },
    {
    "Description": "Alpha Dire Wolf",
    "Class": "Giant Animal",
    "SM": 1,
    "Subclass": "Mammal. Leader",
    "Environment": "outdoor. cave",
    "OR": 15,
    "PR": 15,
    "CER": 30,
    "Source1": "Dungeon Fantasy 2: Dungeons",
    "Page1": 22,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 21,
    "Weight": 1
    },
    {
    "Description": "Doomchild",
    "Class": "Demon",
    "SM": 0,
    "Subclass": "Demon. Humanoid",
    "Environment": "Dungeon",
    "OR": 34,
    "PR": 16,
    "CER": 50,
    "Source1": "Dungeon Fantasy 2: Dungeons",
    "Page1": 22,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 21,
    "Weight": 1
    },
    {
    "Description": "Erupting Slime",
    "Class": "Slime",
    "SM": 0,
    "Subclass": "Slime",
    "Environment": "Dungeon",
    "OR": 11,
    "PR": 20,
    "CER": 31,
    "Source1": "Dungeon Fantasy 2: Dungeons",
    "Page1": 23,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 26,
    "Weight": 1
    },
    {
    "Description": "Flaming Skull",
    "Class": "Undead",
    "SM": -5,
    "Subclass": "Undead. Skull. Fire. Flying. Aerial",
    "Environment": "Dungeon",
    "OR": 37,
    "PR": 48,
    "CER": 85,
    "Source1": "Dungeon Fantasy 2: Dungeons",
    "Page1": 23,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 27,
    "Weight": 1
    },
    {
    "Description": "Flesh-Eating Ape",
    "Class": "Dire Animal",
    "SM": 1,
    "Subclass": "Mammal. Humanoid",
    "Environment": "outdoor. cave",
    "OR": 16,
    "PR": 14,
    "CER": 30,
    "Source1": "Dungeon Fantasy 2: Dungeons",
    "Page1": 23,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 27,
    "Weight": 1
    },
    {
    "Description": "Foul Bat",
    "Class": "Dire Animal",
    "SM": 0,
    "Subclass": "Mammal. Bat. Flying",
    "Environment": "outdoor. cave",
    "OR": 31,
    "PR": 5,
    "CER": 36,
    "Source1": "Dungeon Fantasy 2: Dungeons",
    "Page1": 23,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 28,
    "Weight": 1
    },
    {
    "Description": "Foul Bat Leader",
    "Class": "Demon",
    "SM": 0,
    "Subclass": "Demon. Leader. Bat. Flying",
    "Environment": "outdoor. cave",
    "OR": 31,
    "PR": 10,
    "CER": 41,
    "Source1": "Dungeon Fantasy 2: Dungeons",
    "Page1": 23,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 28,
    "Weight": 1
    },
    {
    "Description": "Frost Snake",
    "Class": "Dire Animal",
    "SM": 0,
    "Subclass": "Reptile. Cold",
    "Environment": "outdoor. cave. arctic",
    "OR": 28,
    "PR": 22,
    "CER": 50,
    "Source1": "Dungeon Fantasy 2: Dungeons",
    "Page1": 24,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 28,
    "Weight": 1
    },
    {
    "Description": "Giant Rat",
    "Class": "Giant Animal",
    "SM": -1,
    "Subclass": "Mammal. Rat",
    "Environment": "outdoor. cave. sewer",
    "OR": 13,
    "PR": 5,
    "CER": 18,
    "Source1": "Dungeon Fantasy 2: Dungeons",
    "Page1": 24,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 30,
    "Weight": 1
    },
    {
    "Description": "Golem-Armor Swordsman",
    "Class": "Construct",
    "SM": 0,
    "Subclass": "Construct. Humanoid. Metal",
    "Environment": "Dungeon",
    "OR": 19,
    "PR": 33,
    "CER": 52,
    "Source1": "Dungeon Fantasy 2: Dungeons",
    "Page1": 24,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 35,
    "Weight": 1
    },
    {
    "Description": "Horde Zombie",
    "Class": "Undead",
    "SM": null,
    "Subclass": "Undead. Zombie. Humanoid",
    "Environment": "Dungeon",
    "OR": 4,
    "PR": 19,
    "CER": 23,
    "Source1": "Dungeon Fantasy 2: Dungeons",
    "Page1": 24,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 36,
    "Weight": 1
    },
    {
    "Description": "Mindwarper",
    "Class": "Elder Thing",
    "SM": 0,
    "Subclass": "Elder Thing. Humanoid",
    "Environment": "Dungeon",
    "OR": 61,
    "PR": 75,
    "CER": 136,
    "Source1": "Dungeon Fantasy 2: Dungeons",
    "Page1": 25,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 41,
    "Weight": 1
    },
    {
    "Description": "Peshkali",
    "Class": "Demon",
    "SM": 0,
    "Subclass": "Demon. Humanoid",
    "Environment": "Dungeon",
    "OR": 31,
    "PR": 81,
    "CER": 112,
    "Source1": "Dungeon Fantasy 2: Dungeons",
    "Page1": 25,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 45,
    "Weight": 1
    },
    {
    "Description": "Siege Beast",
    "Class": "Mundane",
    "SM": 2,
    "Subclass": "Humanoid",
    "Environment": "Dungeon",
    "OR": 37,
    "PR": 42,
    "CER": 79,
    "Source1": "Dungeon Fantasy 2: Dungeons",
    "Page1": 25,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 47,
    "Weight": 1
    },
    {
    "Description": "Stone Golem",
    "Class": "Construct",
    "SM": 1,
    "Subclass": "Humanoid. Earth",
    "Environment": "Dungeon",
    "OR": 29,
    "PR": 41,
    "CER": 70,
    "Source1": "Dungeon Fantasy 2: Dungeons",
    "Page1": 26,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 54,
    "Weight": 1
    },
    {
    "Description": "Toxifier",
    "Class": "Demon",
    "SM": 1,
    "Subclass": "Demon. Diffuse. Aerial. Flying",
    "Environment": "Dungeon",
    "OR": 12,
    "PR": 35,
    "CER": 47,
    "Source1": "Dungeon Fantasy 2: Dungeons",
    "Page1": 26,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 56,
    "Weight": 1
    },
    {
    "Description": "Triger",
    "Class": "Dire Animal",
    "SM": 1,
    "Subclass": "Mammal. Cat",
    "Environment": "Outdoor. Cave",
    "OR": 32,
    "PR": 16,
    "CER": 48,
    "Source1": "Dungeon Fantasy 2: Dungeons",
    "Page1": 26,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 57,
    "Weight": 1
    },
    {
    "Description": "Bronze Spider",
    "Class": "Construct",
    "SM": 0,
    "Subclass": "Metal. Spider",
    "Environment": "Dungeon",
    "OR": 19,
    "PR": 31,
    "CER": 50,
    "Source1": "Dungeon Fantasy Monsters 1",
    "Page1": 5,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 17,
    "Weight": 1
    },
    {
    "Description": "Bugbear",
    "Class": "Mundane",
    "SM": 0,
    "Subclass": "Humanoid",
    "Environment": "Dungeon. Cave",
    "OR": 16,
    "PR": 10,
    "CER": 26,
    "Source1": "Dungeon Fantasy Monsters 1",
    "Page1": 6,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 17,
    "Weight": 1
    },
    {
    "Description": "Ciuaclá",
    "Class": "Divine Servitor",
    "SM": 0,
    "Subclass": "Humanoid",
    "Environment": "Dungeon",
    "OR": 57,
    "PR": 50,
    "CER": 107,
    "Source1": "Dungeon Fantasy Monsters 1",
    "Page1": 7,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 18,
    "Weight": 1
    },
    {
    "Description": "Corpse Golem",
    "Class": "Construct",
    "SM": 0,
    "Subclass": "Flesh. Humanoid",
    "Environment": "Dungeon",
    "OR": 20,
    "PR": 15,
    "CER": 35,
    "Source1": "Dungeon Fantasy Monsters 1",
    "Page1": 8,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 18,
    "Weight": 1
    },
    {
    "Description": "Demon from Between the Stars",
    "Class": "Elder Thing",
    "SM": 0,
    "Subclass": "Elder Thing. Humanoid",
    "Environment": "Dungeon",
    "OR": 44,
    "PR": 30,
    "CER": 74,
    "Source1": "Dungeon Fantasy Monsters 1",
    "Page1": 9,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 19,
    "Weight": 1
    },
    {
    "Description": "Priest Demon from Between the Stars",
    "Class": "Elder Thing",
    "SM": 0,
    "Subclass": "Elder Thing. Humanoid",
    "Environment": "Dungeon",
    "OR": 56,
    "PR": 30,
    "CER": 86,
    "Source1": "Dungeon Fantasy Monsters 1",
    "Page1": 9,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 19,
    "Weight": 1
    },
    {
    "Description": "Demon of Old",
    "Class": "Demon",
    "SM": 1,
    "Subclass": "Demon",
    "Environment": "Dungeon",
    "OR": 29,
    "PR": 57,
    "CER": 86,
    "Source1": "Dungeon Fantasy Monsters 1",
    "Page1": 10,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 20,
    "Weight": 1
    },
    {
    "Description": "Dinoman",
    "Class": "Mundane",
    "SM": 0,
    "Subclass": "Humanoid. Reptile",
    "Environment": "Dungeon. Cave. Swamp. Desert",
    "OR": 9,
    "PR": 3,
    "CER": 12,
    "Source1": "Dungeon Fantasy Monsters 1",
    "Page1": 11,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 20,
    "Weight": 1
    },
    {
    "Description": "Draug",
    "Class": "Undead",
    "SM": 0,
    "Subclass": "Undead. Intact. Humanoid",
    "Environment": "Dungeon. Cave. ",
    "OR": 31,
    "PR": 25,
    "CER": 56,
    "Source1": "Dungeon Fantasy Monsters 1",
    "Page1": 12,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 23,
    "Weight": 1
    },
    {
    "Description": "Electric Jelly",
    "Class": "Dire Animal",
    "SM": 3,
    "Subclass": "Bug. Lightning. Flying. Aerial. Amphibious",
    "Environment": "",
    "OR": 58,
    "PR": 89,
    "CER": 147,
    "Source1": "Dungeon Fantasy Monsters 1",
    "Page1": 13,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 24,
    "Weight": 1
    },
    {
    "Description": "Eye of Death",
    "Class": "Elder Thing",
    "SM": 0,
    "Subclass": "Elder Thing. Flying. Aerial",
    "Environment": "",
    "OR": 25,
    "PR": 34,
    "CER": 59,
    "Source1": "Dungeon Fantasy Monsters 1",
    "Page1": 14,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 26,
    "Weight": 1
    },
    {
    "Description": "Giant Ape",
    "Class": "Dire Animal",
    "SM": 4,
    "Subclass": "Mammal. Humanoid",
    "Environment": "",
    "OR": 33,
    "PR": 45,
    "CER": 78,
    "Source1": "Dungeon Fantasy Monsters 1",
    "Page1": 16,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 30,
    "Weight": 1
    },
    {
    "Description": "King of the Apes",
    "Class": "Dire Animal",
    "SM": 5,
    "Subclass": "Mammal. Humanoid. Leader",
    "Environment": "",
    "OR": 62,
    "PR": 67,
    "CER": 129,
    "Source1": "Dungeon Fantasy Monsters 1",
    "Page1": 16,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 30,
    "Weight": 1
    },
    {
    "Description": "Gladiator Ape",
    "Class": "Dire Animal",
    "SM": 1,
    "Subclass": "Mammal. Humanoid",
    "Environment": "",
    "OR": 21,
    "PR": 16,
    "CER": 37,
    "Source1": "Dungeon Fantasy Monsters 1",
    "Page1": 17,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 32,
    "Weight": 1
    },
    {
    "Description": "Horde Pygmy",
    "Class": "Mundane",
    "SM": -2,
    "Subclass": "Humanoid",
    "Environment": "",
    "OR": 14,
    "PR": -4,
    "CER": 10,
    "Source1": "Dungeon Fantasy Monsters 1",
    "Page1": 18,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 36,
    "Weight": 1
    },
    {
    "Description": "Horrid Skull",
    "Class": "Undead",
    "SM": -5,
    "Subclass": "Undead. Skull",
    "Environment": "",
    "OR": 49,
    "PR": -22,
    "CER": 27,
    "Source1": "Dungeon Fantasy Monsters 1",
    "Page1": 19,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 37,
    "Weight": 1
    },
    {
    "Description": "Ice Wyrm",
    "Class": "Dire Animal",
    "SM": 5,
    "Subclass": "Reptile. Cold",
    "Environment": "",
    "OR": 55,
    "PR": 77,
    "CER": 132,
    "Source1": "Dungeon Fantasy Monsters 1",
    "Page1": 20,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 38,
    "Weight": 1
    },
    {
    "Description": "Karkadann",
    "Class": "Animal",
    "SM": 1,
    "Subclass": "Mammal",
    "Environment": "",
    "OR": 49,
    "PR": 20,
    "CER": 69,
    "Source1": "Dungeon Fantasy Monsters 1",
    "Page1": 21,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 39,
    "Weight": 1
    },
    {
    "Description": "Leaping Leech",
    "Class": "Animal",
    "SM": -9,
    "Subclass": "Bug. Aquatic",
    "Environment": "",
    "OR": 8,
    "PR": -7,
    "CER": 1,
    "Source1": "Dungeon Fantasy Monsters 1",
    "Page1": 22,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 40,
    "Weight": 1
    },
    {
    "Description": "Lich",
    "Class": "Undead",
    "SM": 0,
    "Subclass": "Undead. Skeleton. Humanoid. Leader",
    "Environment": "",
    "OR": 100,
    "PR": 59,
    "CER": 159,
    "Source1": "Dungeon Fantasy Monsters 1",
    "Page1": 23,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 40,
    "Weight": 1
    },
    {
    "Description": "Obsidian Jaguar",
    "Class": "Construct",
    "SM": 1,
    "Subclass": "Glass. Cat",
    "Environment": "",
    "OR": 29,
    "PR": 45,
    "CER": 74,
    "Source1": "Dungeon Fantasy Monsters 1",
    "Page1": 24,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 43,
    "Weight": 1
    },
    {
    "Description": "Rock Mite",
    "Class": "Mundane",
    "SM": -1,
    "Subclass": "Stone",
    "Environment": "",
    "OR": 13,
    "PR": 53,
    "CER": 66,
    "Source1": "Dungeon Fantasy Monsters 1",
    "Page1": 25,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 47,
    "Weight": 1
    },
    {
    "Description": "Slorn",
    "Class": "Dire Animal",
    "SM": 2,
    "Subclass": "Reptile. Fire",
    "Environment": "",
    "OR": 23,
    "PR": 40,
    "CER": 63,
    "Source1": "Dungeon Fantasy Monsters 1",
    "Page1": 26,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 49,
    "Weight": 1
    },
    {
    "Description": "Slugbeast",
    "Class": "Dire Animal",
    "SM": 2,
    "Subclass": "Bug. Acid",
    "Environment": "",
    "OR": 35,
    "PR": 28,
    "CER": 63,
    "Source1": "Dungeon Fantasy Monsters 1",
    "Page1": 27,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 50,
    "Weight": 1
    },
    {
    "Description": "Sphere of Madness",
    "Class": "Elder Thing",
    "SM": 0,
    "Subclass": "Elder Thing",
    "Environment": "",
    "OR": 30,
    "PR": 40,
    "CER": 70,
    "Source1": "Dungeon Fantasy Monsters 1",
    "Page1": 28,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 51,
    "Weight": 1
    },
    {
    "Description": "Sword Spirit",
    "Class": "Faerie",
    "SM": 0,
    "Subclass": "Humanoid",
    "Environment": "",
    "OR": 41,
    "PR": 27,
    "CER": 68,
    "Source1": "Dungeon Fantasy Monsters 1",
    "Page1": 29,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 55,
    "Weight": 1
    },
    {
    "Description": "Throttler",
    "Class": "Mundane",
    "SM": 1,
    "Subclass": "Humanoid. Spirit",
    "Environment": "",
    "OR": 18,
    "PR": 24,
    "CER": 42,
    "Source1": "Dungeon Fantasy Monsters 1",
    "Page1": 30,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 55,
    "Weight": 1
    },
    {
    "Description": "Troll",
    "Class": "Mundane",
    "SM": 1,
    "Subclass": "Humanoid",
    "Environment": "",
    "OR": 29,
    "PR": 86,
    "CER": 115,
    "Source1": "Dungeon Fantasy Monsters 1",
    "Page1": 31,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 57,
    "Weight": 1
    },
    {
    "Description": "Undead Slime",
    "Class": "Undead",
    "SM": 4,
    "Subclass": "Undead. Slime",
    "Environment": "",
    "OR": 18,
    "PR": 63,
    "CER": 81,
    "Source1": "Dungeon Fantasy Monsters 1",
    "Page1": 32,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 58,
    "Weight": 1
    },
    {
    "Description": "Void Brute",
    "Class": "Mundane",
    "SM": 1,
    "Subclass": "Humanoid. Elder Thing",
    "Environment": "",
    "OR": 19,
    "PR": 35,
    "CER": 54,
    "Source1": "Dungeon Fantasy Monsters 1",
    "Page1": 33,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 59,
    "Weight": 1
    },
    {
    "Description": "Watcher at the Edge of Time",
    "Class": "Elder Thing",
    "SM": 0,
    "Subclass": "Elder Thing. Humanoid",
    "Environment": "",
    "OR": 44,
    "PR": 48,
    "CER": 92,
    "Source1": "Dungeon Fantasy Monsters 1",
    "Page1": 34,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 59,
    "Weight": 1
    },
    
    {
    "Description": "Bear",
    "Class": "Animal",
    "SM": 1,
    "Subclass": "Mammal. Bear",
    "Environment": "",
    "OR": 18.5,
    "PR": 17,
    "CER": 35.5,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 16,
    "Weight": 1
    },
    {
    "Description": "Cave Bear",
    "Class": "Animal",
    "SM": 1,
    "Subclass": "Mammal. Bear",
    "Environment": "",
    "OR": 21.5,
    "PR": 21,
    "CER": 42.5,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 16,
    "Weight": 1
    },
    {
    "Description": "Air Elemental",
    "Class": "Elemental",
    "SM": 1,
    "Subclass": "Elemental. Air. Flying",
    "Environment": "",
    "OR": 51,
    "PR": 33,
    "CER": 84,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 25,
    "Weight": 1
    },
    {
    "Description": "Earth Elemental",
    "Class": "Elemental",
    "SM": 1,
    "Subclass": "Elemental. Earth",
    "Environment": "",
    "OR": 13,
    "PR": 42,
    "CER": 55,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 25,
    "Weight": 1
    },
    {
    "Description": "Fire Elemental",
    "Class": "Elemental",
    "SM": 1,
    "Subclass": "Elemental. Fire",
    "Environment": "",
    "OR": 23,
    "PR": 43,
    "CER": 66,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 25,
    "Weight": 1
    },
    {
    "Description": "Water Elemental",
    "Class": "Elemental",
    "SM": 1,
    "Subclass": "Elemental. Water",
    "Environment": "",
    "OR": 11,
    "PR": 38,
    "CER": 49,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 26,
    "Weight": 1
    },
    {
    "Description": "Dragon, Small acid",
    "Class": "Mundane",
    "SM": 3,
    "Subclass": "Dragon. acid. Flying",
    "Environment": "",
    "OR": 46,
    "PR": 39,
    "CER": 85,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 21,
    "Weight": 1
    },
    {
    "Description": "Dragon, Small cold",
    "Class": "Mundane",
    "SM": 3,
    "Subclass": "Dragon. cold. Flying",
    "Environment": "",
    "OR": 36,
    "PR": 39,
    "CER": 75,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 21,
    "Weight": 1
    },
    {
    "Description": "Dragon, Small fire",
    "Class": "Mundane",
    "SM": 3,
    "Subclass": "Dragon. fire. Flying",
    "Environment": "",
    "OR": 36,
    "PR": 39,
    "CER": 75,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 21,
    "Weight": 1
    },
    {
    "Description": "Dragon, Small poison",
    "Class": "Mundane",
    "SM": 3,
    "Subclass": "Dragon. poison. Flying",
    "Environment": "",
    "OR": 51,
    "PR": 39,
    "CER": 90,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 21,
    "Weight": 1
    },
    {
    "Description": "Dragon, medium acid",
    "Class": "Mundane",
    "SM": 4,
    "Subclass": "Dragon. acid. Flying",
    "Environment": "",
    "OR": 78,
    "PR": 55,
    "CER": 133,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 21,
    "Weight": 1
    },
    {
    "Description": "Dragon, medium cold",
    "Class": "Mundane",
    "SM": 4,
    "Subclass": "Dragon. cold. Flying",
    "Environment": "",
    "OR": 68,
    "PR": 55,
    "CER": 123,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 21,
    "Weight": 1
    },
    {
    "Description": "Dragon, medium fire",
    "Class": "Mundane",
    "SM": 4,
    "Subclass": "Dragon. fire. Flying",
    "Environment": "",
    "OR": 68,
    "PR": 55,
    "CER": 123,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 21,
    "Weight": 1
    },
    {
    "Description": "Dragon, medium poison",
    "Class": "Mundane",
    "SM": 4,
    "Subclass": "Dragon. poison. Flying",
    "Environment": "",
    "OR": 83,
    "PR": 61,
    "CER": 144,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 21,
    "Weight": 1
    },
    {
    "Description": "Dragon, large acid",
    "Class": "Mundane",
    "SM": 5,
    "Subclass": "Dragon. acid. Flying",
    "Environment": "",
    "OR": 102,
    "PR": 90,
    "CER": 192,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 21,
    "Weight": 1
    },
    {
    "Description": "Dragon, large cold",
    "Class": "Mundane",
    "SM": 5,
    "Subclass": "Dragon. cold. Flying",
    "Environment": "",
    "OR": 92,
    "PR": 90,
    "CER": 182,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 21,
    "Weight": 1
    },
    {
    "Description": "Dragon, large fire",
    "Class": "Mundane",
    "SM": 5,
    "Subclass": "Dragon. fire. Flying",
    "Environment": "",
    "OR": 92,
    "PR": 90,
    "CER": 182,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 21,
    "Weight": 1
    },
    {
    "Description": "Dragon, large poison",
    "Class": "Mundane",
    "SM": 5,
    "Subclass": "Dragon. poison",
    "Environment": "",
    "OR": 107,
    "PR": 86,
    "CER": 193,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 21,
    "Weight": 1
    },
    {
    "Description": "Giant Constrictor",
    "Class": "Giant Animal",
    "SM": 2,
    "Subclass": "Reptile. Snake",
    "Environment": "",
    "OR": 24,
    "PR": 23,
    "CER": 47,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 31,
    "Weight": 1
    },
    {
    "Description": "Giant Viper",
    "Class": "Giant Animal",
    "SM": 0,
    "Subclass": "Reptile. Snake. Poison",
    "Environment": "",
    "OR": 17,
    "PR": 8,
    "CER": 25,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 31,
    "Weight": 1
    },
    {
    "Description": "Giant Spider, big",
    "Class": "Giant Animal",
    "SM": -1,
    "Subclass": "Spider. Poison",
    "Environment": "",
    "OR": 41,
    "PR": -1,
    "CER": 40,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 31,
    "Weight": 1
    },
    {
    "Description": "Giant Spider, huge",
    "Class": "Giant Animal",
    "SM": 0,
    "Subclass": "Spider. Poison",
    "Environment": "",
    "OR": 46,
    "PR": 7,
    "CER": 53,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 31,
    "Weight": 1
    },
    {
    "Description": "Giant Spider, humongous",
    "Class": "Giant Animal",
    "SM": 3,
    "Subclass": "Spider. Poison",
    "Environment": "",
    "OR": 53,
    "PR": 16,
    "CER": 69,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 31,
    "Weight": 1
    },
    {
    "Description": "Goblin",
    "Class": "Mundane",
    "SM": 0,
    "Subclass": "Humanoid. Goblin-kin",
    "Environment": "",
    "OR": 23,
    "PR": 7,
    "CER": 30,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 33,
    "Weight": 1
    },
    {
    "Description": "Hobgoblin",
    "Class": "Mundane",
    "SM": 0,
    "Subclass": "Humanoid. Goblin-kin",
    "Environment": "",
    "OR": 14,
    "PR": 13,
    "CER": 27,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 34,
    "Weight": 1
    },
    {
    "Description": "Orc",
    "Class": "Mundane",
    "SM": 0,
    "Subclass": "Humanoid. Goblin-kin",
    "Environment": "",
    "OR": 13,
    "PR": 10,
    "CER": 23,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 34,
    "Weight": 1
    },
    {
    "Description": "Gryphon",
    "Class": "Hybrid",
    "SM": 1,
    "Subclass": "Animal. bird. cat. Flying",
    "Environment": "",
    "OR": 40.5,
    "PR": 15,
    "CER": 55.5,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 35,
    "Weight": 1
    },
    {
    "Description": "Gargoyle",
    "Class": "Mundane",
    "SM": 0,
    "Subclass": "Humanoid. Flying",
    "Environment": "",
    "OR": 21,
    "PR": 7,
    "CER": 28,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 35,
    "Weight": 1
    },
    {
    "Description": "Hellhound",
    "Class": "Demon",
    "SM": 0,
    "Subclass": "Dog. Fire.",
    "Environment": "",
    "OR": 18.5,
    "PR": 8,
    "CER": 26.5,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 35,
    "Weight": 1
    },
    {
    "Description": "Ice Weasel",
    "Class": "Dire Animal",
    "SM": -4,
    "Subclass": "Ice. Mammal",
    "Environment": "",
    "OR": 83,
    "PR": 6,
    "CER": 89,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 37,
    "Weight": 1
    },
    {
    "Description": "Jelly, SM+1",
    "Class": "Slime",
    "SM": 1,
    "Subclass": "Acid. Bug. Slime",
    "Environment": "",
    "OR": 48,
    "PR": 46,
    "CER": 94,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 38,
    "Weight": 1
    },
    {
    "Description": "Jelly, SM+2",
    "Class": "Slime",
    "SM": 2,
    "Subclass": "Acid. Bug. Slime",
    "Environment": "",
    "OR": 48,
    "PR": 56,
    "CER": 104,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 38,
    "Weight": 1
    },
    {
    "Description": "Jelly, SM+3",
    "Class": "Slime",
    "SM": 3,
    "Subclass": "Acid. Bug. Slime",
    "Environment": "",
    "OR": 48,
    "PR": 66,
    "CER": 114,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 38,
    "Weight": 1
    },
    {
    "Description": "Jelly, SM+4",
    "Class": "Slime",
    "SM": 4,
    "Subclass": "Acid. Bug. Slime",
    "Environment": "",
    "OR": 48,
    "PR": 81,
    "CER": 129,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 38,
    "Weight": 1
    },
    {
    "Description": "Lizard Man",
    "Class": "Mundane",
    "SM": 0,
    "Subclass": "Humanoid. Reptile. Sand. Swamp",
    "Environment": "",
    "OR": 23,
    "PR": 7,
    "CER": 30,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 38,
    "Weight": 1
    },
    {
    "Description": "Minotaur",
    "Class": "Mundane",
    "SM": 0,
    "Subclass": "Humanoid. Mammal. ",
    "Environment": "",
    "OR": 27,
    "PR": 13,
    "CER": 40,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 42,
    "Weight": 1
    },
    {
    "Description": "Ogre",
    "Class": "Mundane",
    "SM": 1,
    "Subclass": "Humanoid. Mammal. ",
    "Environment": "",
    "OR": 27,
    "PR": 14,
    "CER": 41,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 44,
    "Weight": 1
    },
    {
    "Description": "Ooze",
    "Class": "Slime",
    "SM": 0,
    "Subclass": "Slime. Bug. Acid",
    "Environment": "",
    "OR": 25,
    "PR": 74,
    "CER": 99,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 45,
    "Weight": 1
    },
    {
    "Description": "Pudding, Black",
    "Class": "Slime",
    "SM": 0,
    "Subclass": "Slime.Bug. Acid",
    "Environment": "",
    "OR": 65,
    "PR": 95,
    "CER": 160,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 46,
    "Weight": 1
    },
    {
    "Description": "Pudding, Brown",
    "Class": "Slime",
    "SM": 0,
    "Subclass": "Slime.Bug. Acid. Sand",
    "Environment": "",
    "OR": 65,
    "PR": 95,
    "CER": 160,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 46,
    "Weight": 1
    },
    {
    "Description": "Pudding, Gray",
    "Class": "Slime",
    "SM": 0,
    "Subclass": "Slime.Bug. Acid Astral",
    "Environment": "",
    "OR": 65,
    "PR": 115,
    "CER": 180,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 46,
    "Weight": 1
    },
    {
    "Description": "Pudding, Green",
    "Class": "Slime",
    "SM": 0,
    "Subclass": "Slime.Bug. Acid. Amphibious. Swamp. Poison",
    "Environment": "",
    "OR": 65,
    "PR": 95,
    "CER": 160,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 46,
    "Weight": 1
    },
    {
    "Description": "Pudding, Red",
    "Class": "Slime",
    "SM": 0,
    "Subclass": "Slime.Bug. Acid. Fire",
    "Environment": "",
    "OR": 67,
    "PR": 103,
    "CER": 170,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 46,
    "Weight": 1
    },
    {
    "Description": "Pudding, White",
    "Class": "Slime",
    "SM": 0,
    "Subclass": "Slime.Bug. Acid. Ice",
    "Environment": "",
    "OR": 65,
    "PR": 103,
    "CER": 168,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 46,
    "Weight": 1
    },
    {
    "Description": "Skeleton",
    "Class": "Undead",
    "SM": 0,
    "Subclass": "Humanoid. Skeleton",
    "Environment": "",
    "OR": 19,
    "PR": 7,
    "CER": 26,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 47,
    "Weight": 1
    },
    
    {
    "Description": "Slime",
    "Class": "Slime",
    "Subclass": "Acid. Bug. Slime. Poison",
    "OR": "",
    "PR": "",
    "CER": 1,
    "Source1": "",
    "Page1": "",
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 48,
    "Weight": 1,
    "SM": 0
    },
    {
    "Description": "Specter",
    "Class": "Undead",
    "SM": 0,
    "Subclass": "Ghost. Insubstantial. ",
    "Environment": "",
    "OR": 112.5,
    "PR": 63,
    "CER": 175.5,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 50,
    "Weight": 1
    },
    {
    "Description": "Spirit Guardian",
    "Class": "Spirit",
    "SM": 0,
    "Subclass": "Insubstantial, Spirit, Aerial. Flying",
    "Environment": "",
    "OR": 10,
    "PR": 63,
    "CER": 73,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 52,
    "Weight": 1
    },
    {
    "Description": "Tiger",
    "Class": "Animal",
    "SM": 1,
    "Subclass": "Mammal. Cat",
    "Environment": "",
    "OR": 19,
    "PR": 13,
    "CER": 32,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 56,
    "Weight": 1
    },
    {
    "Description": "Vampire",
    "Class": "Undead",
    "SM": 0,
    "Subclass": "Humanoid. Vampire. Undead.",
    "Environment": "",
    "OR": 31,
    "PR": 37,
    "CER": 68,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 58,
    "Weight": 1
    },
    {
    "Description": "Werewolf",
    "Class": "Mundane",
    "SM": 0,
    "Subclass": "Mammal. Lycanthrope. Humanoid",
    "Environment": "",
    "OR": 21,
    "PR": 51,
    "CER": 72,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 60,
    "Weight": 1
    },
    {
    "Description": "Wildman",
    "Class": "Mundane",
    "SM": 0,
    "Subclass": "Mammal. Humanoid. Leader",
    "Environment": "",
    "OR": 12,
    "PR": 5,
    "CER": 17,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 60,
    "Weight": 1
    },
    {
    "Description": "Zombie",
    "Class": "Undead",
    "SM": 0,
    "Subclass": "Humanoid. Zombie",
    "Environment": "",
    "OR": 13,
    "PR": 21,
    "CER": 34,
    "Source1": "",
    "Page1": null,
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 62,
    "Weight": 1
    },
    
    {
    "Description": "Swarm, Army Ants",
    "Class": "Animal",
    "Subclass": "Swarm. Bug",
    "OR": "",
    "PR": "",
    "CER": 1,
    "Source1": "",
    "Page1": "",
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 54,
    "Weight": 1,
    "SM": 0
    },
    {
    "Description": "Swarm, Bats",
    "Class": "Animal",
    "Subclass": "Swarm. Mammal. Flying",
    "OR": "",
    "PR": "",
    "CER": 1,
    "Source1": "",
    "Page1": "",
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 54,
    "Weight": 1,
    "SM": 0
    },
    {
    "Description": "Swarm, Bees",
    "Class": "Animal",
    "Subclass": "Swarm. Bug. Poison",
    "OR": "",
    "PR": "",
    "CER": 1,
    "Source1": "",
    "Page1": "",
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 54,
    "Weight": 1,
    "SM": 0
    },
    {
    "Description": "Swarm, Birds",
    "Class": "Animal",
    "Subclass": "Swarm. Bird. Flying",
    "OR": "",
    "PR": "",
    "CER": 1,
    "Source1": "",
    "Page1": "",
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 54,
    "Weight": 1,
    "SM": 0
    },
    {
    "Description": "Swarm, Centipedes",
    "Class": "Animal",
    "Subclass": "Swarm. Poison. Bug",
    "OR": "",
    "PR": "",
    "CER": 1,
    "Source1": "",
    "Page1": "",
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 54,
    "Weight": 1,
    "SM": 0
    },
    {
    "Description": "Swarm, Scorpions",
    "Class": "Animal",
    "Subclass": "Swarm. Poison. Bug",
    "OR": "",
    "PR": "",
    "CER": 1,
    "Source1": "",
    "Page1": "",
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 54,
    "Weight": 1,
    "SM": 0
    },
    {
    "Description": "Swarm, Spiders",
    "Class": "Animal",
    "Subclass": "Swarm. Poison. Bug",
    "OR": "",
    "PR": "",
    "CER": 1,
    "Source1": "",
    "Page1": "",
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 54,
    "Weight": 1,
    "SM": 0
    },
    {
    "Description": "Swarm, Fire Ants",
    "Class": "Animal",
    "Subclass": "Swarm. Poison. Bug",
    "OR": "",
    "PR": "",
    "CER": 1,
    "Source1": "",
    "Page1": "",
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 54,
    "Weight": 1,
    "SM": 0
    },
    {
    "Description": "Swarm, Hornets",
    "Class": "Animal",
    "Subclass": "Swarm. Poison. Bug",
    "OR": "",
    "PR": "",
    "CER": 1,
    "Source1": "",
    "Page1": "",
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 54,
    "Weight": 1,
    "SM": 0
    },
    {
    "Description": "Swarm, Wasps",
    "Class": "Animal",
    "Subclass": "Swarm. Poison. Bug",
    "OR": "",
    "PR": "",
    "CER": 1,
    "Source1": "",
    "Page1": "",
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 54,
    "Weight": 1,
    "SM": 0
    },
    {
    "Description": "Swarm, Mosquitoes",
    "Class": "Animal",
    "Subclass": "Swarm. Bug",
    "OR": "",
    "PR": "",
    "CER": 1,
    "Source1": "",
    "Page1": "",
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 54,
    "Weight": 1,
    "SM": 0
    },
    {
    "Description": "Swarm, Piranha",
    "Class": "Animal",
    "Subclass": "Swarm. Fish. Aquatic",
    "OR": "",
    "PR": "",
    "CER": 1,
    "Source1": "",
    "Page1": "",
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 54,
    "Weight": 1,
    "SM": 0
    },
    {
    "Description": "Swarm, Rats",
    "Class": "Animal",
    "Subclass": "Swarm. Mammal",
    "OR": "",
    "PR": "",
    "CER": 1,
    "Source1": "",
    "Page1": "",
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 54,
    "Weight": 1,
    "SM": 0
    },
    {
    "Description": "Swarm, Small Snakes",
    "Class": "Animal",
    "Subclass": "Swarm. Reptile",
    "OR": "",
    "PR": "",
    "CER": 1,
    "Source1": "",
    "Page1": "",
    "Source2": "Dungeon Fantasy RPG Monsters",
    "Page2": 54,
    "Weight": 1,
    "SM": 0
    },
    {
    "Description": "as-Sharak (Aloakasa)",
    "Class": "Demon",
    "Subclass": "Demon. Humanoid. Psi",
    "OR": 20,
    "PR": 58,
    "CER": 78,
    "Source1": "Dungeon Fantasy 14: Psi",
    "Page1": 41,
    "Source2": "",
    "Page2": "",
    "Weight": 1,
    "SM": 0
    },
    {
    "Description": "Astral Hound",
    "Class": "Elder Thing",
    "Subclass": "Elder Thing. Psi",
    "OR": 17,
    "PR": 29,
    "CER": 46,
    "Source1": "Dungeon Fantasy 14: Psi",
    "Page1": 42,
    "Source2": "",
    "Page2": "",
    "Weight": 1,
    "SM": 1
    },
    {
    "Description": "Astral Thing",
    "Class": "Spirit",
    "Subclass": "Spirit. Extradimensional. Psi",
    "OR": 33,
    "PR": -8,
    "CER": 25,
    "Source1": "Dungeon Fantasy 14: Psi",
    "Page1": 42,
    "Source2": "",
    "Page2": "",
    "Weight": 1,
    "SM": 0
    },
    {
    "Description": "Chaos Monk",
    "Class": "Mundane",
    "Subclass": "Humanoid. Psi",
    "OR": 29,
    "PR": 19,
    "CER": 48,
    "Source1": "Dungeon Fantasy 14: Psi",
    "Page1": 42,
    "Source2": "",
    "Page2": "",
    "Weight": 1,
    "SM": 0
    },
    {
    "Description": "Flying Squid Monster",
    "Class": "Elder Thing",
    "Subclass": "Elder Thing. Psi. Fuzzy",
    "OR": 23,
    "PR": 37,
    "CER": 60,
    "Source1": "Dungeon Fantasy 14: Psi",
    "Page1": 43,
    "Source2": "",
    "Page2": "",
    "Weight": 1,
    "SM": 1
    },
    {
    "Description": "Fuzzy, Biter",
    "Class": "Elder Thing",
    "Subclass": "Elder Thing. Psi. Fuzzy",
    "OR": 16,
    "PR": -7,
    "CER": 9,
    "Source1": "Dungeon Fantasy 14: Psi",
    "Page1": 44,
    "Source2": "",
    "Page2": "",
    "Weight": 1,
    "SM": -6
    },
    {
    "Description": "Fuzzy, Bright",
    "Class": "Elder Thing",
    "Subclass": "Elder Thing. Psi. Fuzzy",
    "OR": 25,
    "PR": -7,
    "CER": 18,
    "Source1": "Dungeon Fantasy 14: Psi",
    "Page1": 44,
    "Source2": "",
    "Page2": "",
    "Weight": 1,
    "SM": -6
    },
    {
    "Description": "Fuzzy, Gloomy",
    "Class": "Elder Thing",
    "Subclass": "Elder Thing. Psi. Fuzzy",
    "OR": -3,
    "PR": -7,
    "CER": 1,
    "Source1": "Dungeon Fantasy 14: Psi",
    "Page1": 44,
    "Source2": "",
    "Page2": "",
    "Weight": 1,
    "SM": -6
    },
    {
    "Description": "Fuzzy, Jiggly",
    "Class": "Elder Thing",
    "Subclass": "Elder Thing. Psi. Fuzzy",
    "OR": 20,
    "PR": -7,
    "CER": 13,
    "Source1": "Dungeon Fantasy 14: Psi",
    "Page1": 44,
    "Source2": "",
    "Page2": "",
    "Weight": 1,
    "SM": -6
    },
    {
    "Description": "Fuzzy, Lumpy",
    "Class": "Elder Thing",
    "Subclass": "Elder Thing. Psi. Fuzzy",
    "OR": 5,
    "PR": -7,
    "CER": 1,
    "Source1": "Dungeon Fantasy 14: Psi",
    "Page1": 44,
    "Source2": "",
    "Page2": "",
    "Weight": 1,
    "SM": -6
    },
    {
    "Description": "Fuzzy, Spewer",
    "Class": "Elder Thing",
    "Subclass": "Elder Thing. Psi. Fuzzy",
    "OR": 11,
    "PR": -7,
    "CER": 4,
    "Source1": "Dungeon Fantasy 14: Psi",
    "Page1": 44,
    "Source2": "",
    "Page2": "",
    "Weight": 1,
    "SM": -6
    },
    {
    "Description": "Neuroid",
    "Class": "Spirit",
    "Subclass": "Spirit. Extradimensional. Psi",
    "OR": 37,
    "PR": 52,
    "CER": 89,
    "Source1": "Dungeon Fantasy 14: Psi",
    "Page1": 45,
    "Source2": "",
    "Page2": "",
    "Weight": 1,
    "SM": -5
    },
    {
    "Description": "No-Brainer",
    "Class": "Undead",
    "Subclass": "Undead. Humanoid. Psi",
    "OR": 4,
    "PR": 20,
    "CER": 24,
    "Source1": "Dungeon Fantasy 14: Psi",
    "Page1": 45,
    "Source2": "",
    "Page2": "",
    "Weight": 1,
    "SM": 0
    },
    {
    "Description": "Odifier",
    "Class": "Demon",
    "Subclass": "Demon. Psi",
    "OR": 17,
    "PR": 38,
    "CER": 55,
    "Source1": "Dungeon Fantasy 14: Psi",
    "Page1": 45,
    "Source2": "",
    "Page2": "",
    "Weight": 1,
    "SM": 0
    },
    {
    "Description": "Abominable Snowman",
    "Class": "Dire Animal",
    "Subclass": "Mammal. Humanoid",
    "OR": 19,
    "PR": 22,
    "CER": 41,
    "Source1": "Pyramid #3/50: Dungeon Fantasy II",
    "Page1": 38,
    "Source2": "",
    "Page2": "",
    "Weight": 1,
    "SM": 1
    },
    {
    "Description": "Animated Snowman",
    "Class": "Construct",
    "Subclass": "Cold. Humanoid",
    "OR": 9,
    "PR": 4,
    "CER": 13,
    "Source1": "Pyramid #3/50: Dungeon Fantasy II",
    "Page1": 38,
    "Source2": "",
    "Page2": "",
    "Weight": 1,
    "SM": 0
    },
    {
    "Description": "Horde Ninja",
    "Class": "Mundane",
    "Subclass": "Humanoid",
    "OR": 28,
    "PR": 7,
    "CER": 35,
    "Source1": "Pyramid #3/70: 4th Edition Festival",
    "Page1": 32,
    "Source2": "",
    "Page2": "",
    "Weight": 1,
    "SM": 0
    },
    {
    "Description": "Dire Frog",
    "Class": "Dire Animal",
    "Subclass": "Amphibian. Aquatic",
    "OR": 23,
    "PR": 11,
    "CER": 34,
    "Source1": "Pyramid #3/76: Dungeon Fantasy IV",
    "Page1": 31,
    "Source2": "",
    "Page2": "",
    "Weight": 1,
    "SM": 1
    },
    {
    "Description": "Dire Hart",
    "Class": "Dire Animal",
    "Subclass": "Mammal",
    "OR": 23,
    "PR": 17,
    "CER": 40,
    "Source1": "Pyramid #3/76: Dungeon Fantasy IV",
    "Page1": 30,
    "Source2": "",
    "Page2": "",
    "Weight": 1,
    "SM": 2
    },
    {
    "Description": "Fetusoid",
    "Class": "Elder Thing",
    "Subclass": "Elder Thing. Humanoid. Living Room",
    "OR": 14,
    "PR": 23,
    "CER": 37,
    "Source1": "Pyramid #3/76: Dungeon Fantasy IV",
    "Page1": 23,
    "Source2": "",
    "Page2": "",
    "Weight": 1,
    "SM": 0
    },
    {
    "Description": "Hungry Room",
    "Class": "Elder Thing",
    "Subclass": "Elder Thing. Living Room. Sessile",
    "OR": 21,
    "PR": 112,
    "CER": 133,
    "Source1": "Pyramid #3/76: Dungeon Fantasy IV",
    "Page1": 21,
    "Source2": "",
    "Page2": "",
    "Weight": 1,
    "SM": 5
    },
    {
    "Description": "Intruder",
    "Class": "Elder Thing",
    "Subclass": "Elder Thing. Humanoid. Psi",
    "OR": 42,
    "PR": 57,
    "CER": 99,
    "Source1": "Pyramid #3/76: Dungeon Fantasy IV",
    "Page1": 9,
    "Source2": "",
    "Page2": "",
    "Weight": 1,
    "SM": 0
    },
    {
    "Description": "Pscorpion",
    "Class": "Dire Animal",
    "Subclass": "Bug. Psi",
    "OR": 26,
    "PR": 27,
    "CER": 53,
    "Source1": "Pyramid #3/76: Dungeon Fantasy IV",
    "Page1": 10,
    "Source2": "",
    "Page2": "",
    "Weight": 1,
    "SM": 0
    },
    {
    "Description": "Pyro-Tiger",
    "Class": "Dire Animal",
    "Subclass": "Mammal. Cat. Fire",
    "OR": 55,
    "PR": 15,
    "CER": 70,
    "Source1": "Pyramid #3/76: Dungeon Fantasy IV",
    "Page1": 11,
    "Source2": "",
    "Page2": "",
    "Weight": 1,
    "SM": 1
    },
    {
    "Description": "Terrible Dire Bunny",
    "Class": "Terrible Dire Animal",
    "Subclass": "Mammal",
    "OR": 52,
    "PR": 13,
    "CER": 65,
    "Source1": "Pyramid #3/76: Dungeon Fantasy IV",
    "Page1": 32,
    "Source2": "",
    "Page2": "",
    "Weight": 1,
    "SM": -4
    },
    {
    "Description": "Terribly Dire Wolverine",
    "Class": "Terrible Dire Animal",
    "Subclass": "Mammal. Humanoid",
    "OR": 69,
    "PR": 65,
    "CER": 134,
    "Source1": "Pyramid #3/76: Dungeon Fantasy IV",
    "Page1": 33,
    "Source2": "",
    "Page2": "",
    "Weight": 1,
    "SM": 0
    },
    {
    "Description": "Terrible Hedge",
    "Class": "Terrible Plant",
    "Subclass": "Plant. Sessile",
    "OR": 315,
    "PR": 8,
    "CER": 323,
    "Source1": "Pyramid #3/76: Dungeon Fantasy IV",
    "Page1": 32,
    "Source2": "",
    "Page2": "",
    "Weight": 1,
    "SM": 0
    },
    {
    "Description": "Terrible Terrier",
    "Class": "Terrible Animal",
    "Subclass": "Mammal",
    "OR": 18,
    "PR": 3,
    "CER": 21,
    "Source1": "Pyramid #3/76: Dungeon Fantasy IV",
    "Page1": 31,
    "Source2": "",
    "Page2": "",
    "Weight": 1,
    "SM": 0
    },
    {
    "Description": "Terrible Whipping Willow",
    "Class": "Terrible Plant",
    "Subclass": "Plant. Sessile",
    "OR": 315,
    "PR": 76,
    "CER": 391,
    "Source1": "Pyramid #3/76: Dungeon Fantasy IV",
    "Page1": 32,
    "Source2": "",
    "Page2": "",
    "Weight": 1,
    "SM": 6
    },
    ];
    
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
    if (encounter_monster === undefined) {
        console.error("encounter_monster undefined from get_monster()");
        console.trace();
        quantity = 0;
        return room;
    }
    var quantity = Math.max( // at least one
        1, Math.round(target_cer / encounter_monster.CER)
    );
    //room.cer_total += (encounter_monster.CER * quantity);
    //console.log( "The selected monster is " + encounter_monster.Description + " (CER " + encounter_monster.CER + ", SM " + encounter_monster.SM + ")" + "\n" +
    //    "There are (initially) " + quantity + " of them. Total CER is " + (encounter_monster.CER * quantity) + ".\n");


    var pick_n_mix = random(100) < 30;
    if (!pick_n_mix) {
        add_monster_without_duplication(room, encounter_monster, quantity);
    } else {
        quantity = Math.max(Math.round(rand_between(1, Math.max(quantity - 1, 1))), 1);
        if (isNaN(quantity)) {
            console.error("quantity was NaN");
            console.trace();
            quantity = 0;
            return room;
        }

        console.warn(encounter_monster.Description + " quantity adjusted down to " + quantity + " to make room for pick 'n mix monsters");

        if ((target_cer - encounter_monster.CER) >= lowest_cer_available) {
            //console.log("PickNMix!");
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
    return new Monster(target_cer);
    //return {
    //    monster: {
    //        Description: "No Qualifying Monsters"
    //    },
    //    cer: target_cer,
    //    quantity: 1,
    //    "Source1": "Oops",
    //    "Page1": '00'
    //};
}

function get_cer_range(target_cer, n_range, lowest_cer_available, highest_cer_available) {
    var min_cer;
    var max_cer;
    
    if (n_range.min !== undefined && n_range.max !== undefined) { // min and max defined
        min_cer = target_cer / n_range.max;
        max_cer = target_cer / n_range.min;
    } else if (n_range.min === undefined && n_range.max !== undefined) {
        min_cer = lowest_cer_available; 
        max_cer = target_cer /  n_range.min;
    } else if (n_range.min !== undefined && n_range.max === undefined) { // no maximum - get the smallest CER off the chart and calculate N from that to find the maximum
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

        console.debug("Searching dungeon for wandering monster candidates");

    // collect all monsters used in the dungeon
    for (roomIDX = 1; roomIDX <= dungeonOBJ.n_rooms; roomIDX++) {
        // push all monsters onto used_monsters, rather than push an array of monsters onto used_monsters
        var mons = dungeonOBJ.room[roomIDX].monsters;
        //used_monsters.push.apply(used_monsters, mons.map(function(m) { return m.monster; }) ); 
        for ( var mon_type = 0; mon_type < mons.length; mon_type++)
                for (var mon_count = 0; mon_count < mons[mon_type].quantity; mon_count++) {
                    if (mons[mon_type].monster.Description !== "No Qualifying Monsters" 
                        && mons[mon_type].quantity > 0) {
                            //console.log("Adding monster to candidate list");
                            //console.log(mons[mon_type].monster.Description);
                            unique_monsters.add(mons[mon_type].monster);
                            var ct = unique_monsters.get(mons[mon_type].monster);
                            unique_monsters.set(mons[mon_type].monster, ct + mons[mon_type].quantity);
                        }
                }
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
        extra_mon.Weight = 1;
        // check if it's a duplicate.
        if (used_monsters.findIndex((mon) => mon.Description == extra_mon.Description) == -1)
            used_monsters.push(extra_mon);
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
    console.debug("Get_monster(largest_SM: " + largest_SM + ", max_cer: " + max_cer + ", min_cer: " + min_cer + ", monster_table: " + (monster_table === undefined ? 0: monster_table.length) + " entries" );
    if (typeof(monster_table) === undefined ){
        monster_table = monsters;
    }
 
    var qualifying_monsters_table = monsters_in_CER_bracket(monster_table, max_cer, min_cer);

    if (qualifying_monsters_table === undefined || qualifying_monsters_table.length === 0) {
        console.error("monsters_in_CER_bracket(max: " + max_cer + ", min: " + min_cer +")"+" came up undefined or empty after filtering for CER");
        console.trace();
        return undefined;
    }

    qualifying_monsters_table = qualifying_monsters_table.filter(function (monster) {
        return monster.SM <= largest_SM;
    });

    if (qualifying_monsters_table === undefined || qualifying_monsters_table.length === 0) {
        console.error("qualifying_monsters_table came up undefined or empty after clamping size");
        console.trace();
        return dummy_monster(max_cer);
    }

    var encounter_monster = select_from_weighted_table(qualifying_monsters_table);

    if (encounter_monster === undefined || encounter_monster === {}) {
        console.error("encounter_monster came up undefined or empty");
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
     * @param {Array} arr adds all the elements in the Array to the Multiset
     * @returns {undefined} nothing
     */
    add_array(arr) {
        arr.forEach(element => {
            this.add(element);
        });
    }

    /**
     * 
     * @param {any} elem object to remove from Multiset
     * @returns {undefined} nothing
     */
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
    if (monster_table === undefined) {
        monster_table = monsters;
    }
    if (monster_table.constructor !== Array) {
        console.error("monster_table is not an Array, it is a " + monster_table.constructor);
        return [];
    }
    return monster_table.filter(function (monster) {
        return (monster.CER <= max_cer) && (monster.CER >= min_cer);
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