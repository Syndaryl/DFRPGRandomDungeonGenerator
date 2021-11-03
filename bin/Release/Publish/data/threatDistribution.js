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
        "Description": "The enemy outmatches the party, who will need luck and quick wits to win.",
        "ForceTreasure": true
    },
    {
        "Name": "epic",
        "NgtX": 0,
        "Treasure": 20,
        "Description": "Only luck, emergency one-use magic, or unexpected reinforcements will save the heroes!",
        "ForceTreasure": true
    }
];

var threatIndex = 
{    "nuisance":0,
    "fodder":1,
    "worthy":2,
    "boss":3,
    "epic":4
}

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
            "Weight": 0}
        ],
    "easy": [
        {
            "Description": "nuisance",
            "Weight": 30
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
            "Weight": 3
        },
        {
            "Description": "epic",
            "Weight": 0}
        ],
    "average": [
        {
            "Description": "nuisance",
            "Weight": 10
        },
        {
            "Description": "fodder",
            "Weight": 20
        },
        {
            "Description": "worthy",
            "Weight": 20
        },
        {
            "Description": "boss",
            "Weight": 7
        },
        {
            "Description": "epic",
            "Weight": 0}
        ],
    "hard": [
        {
            "Description": "nuisance",
            "Weight": 10
        },
        {
            "Description": "fodder",
            "Weight": 20
        },
        {
            "Description": "worthy",
            "Weight": 59
        },
        {
            "Description": "boss",
            "Weight": 10
        },
        {
            "Description": "epic",
            "Weight": 1}
    ],
    "evil": [
        {
            "Description": "nuisance",
            "Weight": 0
        },
        {
            "Description": "fodder",
            "Weight": 10
        },
        {
            "Description": "worthy",
            "Weight": 65
        },
        {
            "Description": "boss",
            "Weight": 20
        },
        {
            "Description": "epic",
            "Weight": 5}
    ]

};