var trapsBuilder = {
  "trap_type" : [
    {
      "Description": "Alchemical",
      "Weight": 1,
      "Detection Skill": "Alchemy or Hazardous Materials (Magical)",
      "Disarm": "Alchemy or Hazardous Materials (Magical)",
      "Tables": ["trap_trigger, trap_quality", "trap_can_be_stolen"]
    },
    {
      "Description": "Poison",
      "Weight": 1,
      "Detection Skill": "Poisons",
      "Disarm": "Poisons",
      "Tables": ["trap_trigger", "trap_can_be_stolen"]
    },
    {
      "Description": "Mechanial",
      "Weight": 2,
      "Detection Skill": "Traps (PER based)",
      "Disarm": "Traps (DX-based)",
      "Tables": ["trap_trigger", "trap_can_be_stolen_mechanical"]
    },
    {
      "Description": "Magical",
      "Weight": 1,
      "Detection Skill": "Thaumatology",
      "Disarm": "Thaumatology",
      "Tables":  ["trap_trigger", "trap_can_be_stolen_weird"]
    },
    {
      "Description": "Tricks",
      "Weight": 1,
      "Detection Skill": "Traps (PER based)",
      "Disarm": "Traps (DX-based)",
      "Tables": ["trap_trigger", "trap_can_be_stolen_weird"]
    }
  ],
  "trap_trigger": [
    {"Description": "Specific Location: Pressure plate on the floor", "Weight": 2},
    {"Description": "Tripwire at ankle height on a human", "Weight": 2},
    {"Description": "Tripwire at waist height on a human", "Weight": 1},
    {"Description": "Tripwire at neck height on a human", "Weight": 2},
    {"Description": "Touching an object, lock, or doorknob (as appropriate)", "Weight": 2},
    {"Description": "Cyclic: Trap automatically activates every hour", "Weight": 1},
    {"Description": "Cyclic: Trap automatically activates every six hours", "Weight": 1},
    {"Description": "Cyclic: Trap automatically activates every twelve hours", "Weight": 1},
    {"Description": "Cyclic: Trap automatically activates every twenty four hours", "Weight": 1},
    {"Description": "${ trap_detect_spell } spell cast with effective skill ${ gen_skill }", "Weight": 1},
    {"Description": "Specific Location (Exotic): Trap automatically activates if a ${ trap_trigger_victim } enters the hex", "Weight": 2}
  ],
  "trap_trigger_victims": [
    { "Description": "person with Magery", "Weight": 5},
    { "Description": "person with Power Investiture", "Weight": 5},
    { "Description": "person carrying a magic item (not enchantments, not alchemy or items with spells cast on them)", "Weight": 1},
    { "Description": "elf", "Weight": 5},
    { "Description": "dwarf", "Weight": 5},
    { "Description": "human", "Weight": 10},
    { "Description": "half-orc", "Weight": 1},
    { "Description": "halfling", "Weight": 5},
    { "Description": "gnome", "Weight": 3},
    { "Description": "half-ogre", "Weight": 1},
    { "Description": "person carrying a weapon in hand", "Weight": 5},
    { "Description": "holy symbol (worn, carried, or packed away)", "Weight": 5}
  ],
  "trap_detect_spell" : ["Detect Life"],
  "trap_shots": [
    {"Description": "Constant or Infinite", "Weight": 1},
    {"Description": "${ shots } shots", "Weight": 5}
  ],
  "shots": [1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 10, 10, 11, 11, 12, 13, 14, 15, 16, 17, 18 ],
  "trap_can_be_stolen": [ 
    { "Description": "yes", "Weight": 1}, 
    { "Description": "no", "Weight": 2}
  ],
  "trap_can_be_stolen_mechanical" : [
    { "Description": "yes", "Weight": 2}, 
    { "Description": "no", "Weight": 1}
  ],
  "trap_can_be_stolen_weird" : [
    { "Description": "yes", "Weight": 1}, 
    { "Description": "no", "Weight": 4}
  ],
  "traps_weapons_ST": {
    "basic": [
      {
        "Description": "ST 10",
        "Weight": 3
      },
      {
        "Description": "ST 14",
        "Weight": 2
      },
      {
        "Description": "ST 18",
        "Weight": 1
      },
      {
        "Description": "ST 22",
        "Weight": 1
      },
      {
        "Description": "ST 26",
        "Weight": 0
      }
    ],
    "standard": [
      {
        "Description": "ST 10",
        "Weight": 2
      },
      {
        "Description": "ST 14",
        "Weight": 4
      },
      {
        "Description": "ST 18",
        "Weight": 3
      },
      {
        "Description": "ST 22",
        "Weight": 2
      },
      {
        "Description": "ST 26",
        "Weight": 1
      }
    ],
    "secure": [
      {
        "Description": "ST 10",
        "Weight": 1
      },
      {
        "Description": "ST 14",
        "Weight": 2
      },
      {
        "Description": "ST 18",
        "Weight": 5
      },
      {
        "Description": "ST 22",
        "Weight": 3
      },
      {
        "Description": "ST 26",
        "Weight": 2
      }
    ],
    "deathtrap": [
      {
        "Description": "ST 10",
        "Weight": 0
      },
      {
        "Description": "ST 14",
        "Weight": 1
      },
      {
        "Description": "ST 18",
        "Weight": 2
      },
      {
        "Description": "ST 22",
        "Weight": 5
      },
      {
        "Description": "ST 26",
        "Weight": 3
      }
    ]
  },
  "traps_weapons": [
    {
      "Description": "Broadsword",
      "ST 10": "1d+1",
      "ST 14": "2d+1",
      "ST 18": "3d+1",
      "ST 22": "4d+1",
      "ST 26": "5d+1",
      "Type": "cutting",
      "Melee": false,
      "Ranged": true,
      "Weight": 5
    },
    {
      "Description": "Crossbow",
      "ST 10": "1d+2",
      "ST 14": "1d+4",
      "ST 18": "1d+6",
      "ST 22": "2d+4",
      "ST 26": "2d+6",
      "Type": "impaling",
      "Melee": true,
      "Ranged": false,
      "Weight": 5
    },
    {
      "Description": "Great Axe",
      "ST 14": "2d+4",
      "ST 18": "3d+4",
      "ST 22": "4d+4",
      "ST 26": "5d+4",
      "Type": "cutting",
      "Melee": false,
      "Ranged": true,
      "Weight": 5
    },
    {
      "Description": "Halberd",
      "ST 14": "2d+5",
      "ST 18": "3d+5",
      "ST 22": "4d+5",
      "ST 26": "5d+5",
      "Type": "cutting",
      "Melee": false,
      "Ranged": true,
      "Weight": 5
    },
    {
      "Description": "Large Knife",
      "ST 10": "1d-2",
      "ST 14": "1d",
      "ST 18": "1d+2",
      "Type": "impaling",
      "Melee": true,
      "Ranged": true,
      "Weight": 5
    },
    {
      "Description": "Longbow",
      "ST 10": "1d",
      "ST 14": "1d+2",
      "ST 18": "1d+4",
      "ST 22": "2d+2",
      "ST 26": "2d+4",
      "Type": "impaling",
      "Melee": true,
      "Ranged": false,
      "Weight": 5
    },
    {
      "Description": "Maul",
      "ST 14": "2d+5",
      "ST 18": "3d+5",
      "ST 22": "4d+5",
      "ST 26": "5d+5",
      "Type": "crushing",
      "Melee": false,
      "Ranged": true,
      "Weight": 5
    },
    {
      "Description": "Pollaxe",
      "ST 14": "2d+3",
      "ST 18": "3d+3",
      "ST 22": "4d+3",
      "ST 26": "5d+3",
      "Type": "impaling",
      "Melee": false,
      "Ranged": true,
      "Weight": 5
    },
    {
      "Description": "Small Mace",
      "ST 10": "1d+2",
      "ST 14": "2d+2",
      "ST 18": "3d+2",
      "ST 22": "4d+2",
      "ST 26": "5d+2",
      "Type": "crushing",
      "Melee": true,
      "Ranged": true,
      "Weight": 5
    },
    {
      "Description": "Star Shuriken",
      "ST 10": "1d-3",
      "ST 14": "1d-1",
      "Type": "cutting",
      "Melee": true,
      "Ranged": false,
      "Weight": 5
    }
  ]
 };