var threats = [
    {
        "Name": "nuisance",
        "NgtX": 11,
        "Treasure": 0.25,
        "Description": "The monsters are pests or a diversion of some kind."
    },
    {
        "Name": "fodder",
        "NgtX": 3,
        "Treasure": 0.5,
        "Description": "The enemy may wear down the PCs, but will rarely beat them."
    },
    {
        "Name": "worthy",
        "NgtX": 0.5,
        "Treasure": 1,
        "Description": "This fight is roughly even."
    },
    {
        "Name": "boss",
        "NgtX": 0.1,
        "Treasure": 5,
        "Description": "The enemy outmatches the party, who will need luck and quick wits to win."
    },
    {
        "Name": "epic",
        "NgtX": 0,
        "Treasure": 20,
        "Description": "Only luck, emergency one-use magic, or unexpected reinforcements will save the heroes!"
    }
];

var threat_distribution = {
    "cakewalk": [
        {
            "Weight": 50,
            "Description": "Nuisance",
            N: {
                "min": 11
            }
        },
        {
            "Weight": 15,
            "Description": "Fodder",
            N: {
                "min": 3
            }
        },
        {
            "Weight": 5,
            "Description": "Worthy",
            N: {
                "min": 0.5,
                "max": 3
            }
        },
        {
            "Weight": 0,
            "Description": "Boss",
            N: {
                "min": 0.1,
                "max": 0.5
            }
        },
        {
            "Weight": 0,
            "Description": "Epic",
            N: {
                "max": 0.1
            }
        }
    ],
    "easy": [
        {
            "Weight": 40,
            "Description": "Nuisance",
            N: {
                "min": 11
            }
        },
        {
            "Weight": 20,
            "Description": "Fodder",
            N: {
                "min": 3
            }
        },
        {
            "Weight": 10,
            "Description": "Worthy",
            N: {
                "min": 0.5,
                "max": 3
            }
        },
        {
            "Weight": 1,
            "Description": "Boss",
            N: {
                "min": 0.1,
                "max": 0.5
            }
        },
        {
            "Weight": 0,
            "Description": "Epic",
            N: {
                "max": 0.1
            }
        }
    ],
    "average": [
        {
            "Weight": 20,
            "Description": "Nuisance",
            N: {
                "min": 10,
                "max": 20
            }
        },
        {
            "Weight": 2,
            "Description": "Fodder",
            N: {
                "min": 3
            }
        },
        {
            "Weight": 4,
            "Description": "Worthy",
            N: {
                "min": 0.5,
                "max": 3
            }
        },
        {
            "Weight": 1,
            "Description": "Boss",
            N: {
                "min": 0.1,
                "max": 0.5
            }
        },
        {
            "Weight": 0,
            "Description": "Epic",
            N: {
                "max": 0.1
            }
        }
    ],
    "hard": [
        {
            "Weight": 10,
            "Description": "Nuisance",
            N: {
                "min": 10,
                "max": 20
            }
        },
        {
            "Weight": 15,
            "Description": "Fodder",
            N: {
                "min": 3
            }
        },
        {
            "Weight": 40,
            "Description": "Worthy",
            N: {
                "min": 0.5,
                "max": 3
            }
        },
        {
            "Weight": 5,
            "Description": "Boss",
            N: {
                "min": 0.1,
                "max": 0.5
            }
        },
        {
            "Weight": 1,
            "Description": "Epic",
            N: {
                "max": 0.1
            }
        }
    ],
    "evil": [
        {
            "Weight": 0,
            "Description": "Nuisance",
            N: {
                "min": 10,
                "max": 20
            }
        },
        {
            "Weight": 2,
            "Description": "Fodder",
            N: {
                "min": 3
            }
        },
        {
            "Weight": 15,
            "Description": "Worthy",
            N: {
                "min": 0.5,
                "max": 3
            }
        },
        {
            "Weight": 7,
            "Description": "Boss",
            N: {
                "min": 0.1,
                "max": 0.5
            }
        },
        {
            "Weight": 5,
            "Description": "Epic",
            N: {
                "max": 0.1
            }
        }
    ]
};