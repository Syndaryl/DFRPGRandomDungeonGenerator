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
    "cakewalk": {
        "nuisance": 0.5,
        "fodder": 0.3,
        "worthy": 0.2,
        "boss": 0,
        "epic": 0
    },
    "easy": {
        "nuisance": 0.3,
        "fodder": 0.4,
        "worthy": 0.25,
        "boss": 0.05,
        "epic": 0
    },
    "average": {
        "nuisance": 0.2,
        "fodder": 0.23,
        "worthy": 0.5,
        "boss": 0.07,
        "epic": 0
    },
    "hard": {
        "nuisance": 0.1,
        "fodder": 0.2,
        "worthy": 0.59,
        "boss": 0.1,
        "epic": 0.01
    },
    "evil": {
        "nuisance": 0,
        "fodder": 0.1,
        "worthy": 0.65,
        "boss": 0.2,
        "epic": 0.05
    }

};