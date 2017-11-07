var threats = {
    /* "comment": {
        "Name": "Name of the threat level",
        "NgtX": "N is the party CER divided by the encounter/monster CER",
        "Treasure": "Treasure is based on CER times this scaling factor",
        "Description": "A text description to give a human-friendly idea of the threat."
    }, */
    "nuisance": {
        "Name": "Nuisance",
        "NgtX": 0,
        "NltX": 1/11,
        "Treasure": 0.25,
        "Description": "The monsters are pests or a diversion of some kind."
    },
    "fodder": {
        "Name": "Fodder",
        "NgtX": 1/11,
        "NltX": 1/3,
        "Treasure": 0.5,
        "Description": "The enemy may wear down the PCs, but will rarely beat them."
    },
    "worthy": {
        "Name": "Worthy",
        "NgtX": 1/3,
        "NltX": 2,
        "Treasure": 1,
        "Description": "This fight is roughly even."
    },
    "boss": {
        "Name": "Boss",
        "NgtX": 2,
        "NltX": 10,
        "Treasure": 5,
        "Description": "The enemy outmatches the party, who will need luck and quick wits to win."
    },
    "epic": {
        "Name": "Epic",
        "NgtX": 10,
        "NltX": 20,
        "Treasure": 20,
        "Description": "Only luck, emergency one-use magic, or unexpected reinforcements will save the heroes!"
    }
};

var threat_distribution = {
    "cakewalk": [
        {
            "Description": "nuisance",
            "Weight": 5
        },
        {
            "Description": "fodder",
            "Weight": 3
        },
        {
            "Description": "worthy",
            "Weight": 2
        },
        {
            "Description": "boss",
            "Weight": 0
        },
        {
            "Description": "epic",
            "Weight": 0
        }
    ],
    "easy": [
        {
            "Description": "nuisance",
            "Weight": 25
        },
        {
            "Description": "fodder",
            "Weight": 40
        },
        {
            "Description": "worthy",
            "Weight": 25
        },
        {
            "Description": "boss",
            "Weight": 1
        },
        {
            "Description": "epic",
            "Weight": 0
        }
    ],
    "average": [
        {
            "Description": "nuisance",
            "Weight": 15
        },
        {
            "Description": "fodder",
            "Weight": 23
        },
        {
            "Description": "worthy",
            "Weight": 50
        },
        {
            "Description": "boss",
            "Weight": 7
        },
        {
            "Description": "epic",
            "Weight": 0
        }
    ],
    "harsh": [
        {
            "Description": "nuisance",
            "Weight": 9
        },
        {
            "Description": "fodder",
            "Weight": 20
        },
        {
            "Description": "worthy",
            "Weight": 60
        },
        {
            "Description": "boss",
            "Weight": 10
        },
        {
            "Description": "epic",
            "Weight": 1
        }
    ],
    "evil": [
        {
            "Description": "nuisance",
            "Weight": 0
        },
        {
            "Description": "fodder",
            "Weight": 11
        },
        {
            "Description": "worthy",
            "Weight": 64
        },
        {
            "Description": "boss",
            "Weight": 20
        },
        {
            "Description": "epic",
            "Weight": 5
        }
    ],
    "nightmare": [
        {
            "Description": "nuisance",
            "Weight": 0
        },
        {
            "Description": "fodder",
            "Weight": 0
        },
        {
            "Description": "worthy",
            "Weight": 40
        },
        {
            "Description": "boss",
            "Weight": 50
        },
        {
            "Description": "epic",
            "Weight": 10
        }
    ]

};