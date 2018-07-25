var water = [

    {
        "Weight": 10,
        "Description": "There is a ${ River Width } wide and ${ Beam Width } deep creek running ${ Direction } and spanning the entire room, ${ Crossing }",
        "Tag":"River"
    },
    {
        "Weight": 30,
        "Description": "There is a ${ River Width } wide and ${ River Depth } deep stream running ${ Direction } and spanning the entire room, ${ Crossing }",
        "Tag":"River"
    },
    {
        "Weight": 20,
        "Description": "There is a ${ River Width } wide and ${ River Depth } deep stream running ${ Direction } and spanning the entire room, crossed by ${ Common Bridge }",
        "Tag":"River"
    },
    {
        "Weight": 5,
        "Description": "There is a ${ River Width } wide and ${ River Depth } deep stream running ${ Direction } and spanning the entire room, crossed by ${ Rare Bridge }",
        "Tag":"River"
    },
    {
        "Weight": 10,
        "Description": "There is a ${ River Width } wide and ${ Chasm Depth } deep chasm running ${ Direction } and spanning the entire room, ${ Crossing }"
    },
    {
        "Weight": 10,
        "Description": "There is a ${ River Width } wide and ${ Chasm Depth } deep chasm running ${ Direction } and spanning the entire room, crossed by ${ Common Bridge }"
    },
    {
        "Weight": 6,
        "Description": "There is a ${ River Width } wide and ${ Chasm Depth } chasm running ${ Direction } and spanning the entire room, crossed by ${ Rare Bridge }"
    }
];

var water_data = {
    "River Width": ["3 yard", "4 yard", "4 yard", "4 yard", "5 yard", "5 yard", "5 yard", "6 yard", "7 yard"],
    "River Depth": ["1 yard", "2 yard", "2 yard", "3 yard", "3 yard", "3 yard", "6 yard", "6 yard", "8 yard"],
    "Chasm Depth": ["3 yard deep", "6 yard deep", "6 yard deep", 
                    "8 yard deep", "8 yard deep", "8 yard deep", 
                    "10 yard deep", "10 yard deep", "20 yard deep", "bottomless"],
    "Direction": [
        "east-west",
        "north-south"
    ],
    "Crossing": ["and no bridge in sight!", "and a conspicuous 1 foot wide plank on the ${ Side } side", "and a series of (wet, slippery) stepping stones across"],
    "Common Bridge": [
        "a wobbly chain bridge (DX${ Penalty } roll to keep your feet)",
        "a ${ Bridge Width } wide ${ Hidden Bridge }, activated by pulling a lever on the ${ Side } side",
        "a ${ Bridge Width } wide ${ Hidden Bridge }, activated by pulling a hidden lever on the ${ Side } side (Observation${ Penalty } roll to find",
        "a ${ Bridge Width } wide stout oak bridge",
        "a ${ Bridge Width } wide stout oak bridge",
        "a ${ Bridge Width } sturdy stone bridge",
        "a ${ Bridge Width } sturdy stone bridge",
        "a ${ Beam Width } wide oak beam, 1 yard above the ground",
        "a ${ Beam Width } wide smooth stone beam (${ Penalty } to Acrobatics), 1 yard above the ground",
        "a series of 18 inch brass rings suspended from the ceiling, 1 yard apart, leading from one side to the other"
    ],
    "Rare Bridge" : [
        "a ${ Bridge Width } wide eery bone bridge",
        "a ${ Bridge Width } wide delicate ice bridge (treat the slick surface as under the effect of the Grease spell)",
        "a 2 yard by 2 yard swinging platform, suspended in the middle",
        "a ${ Bridge Width } wide spider webbing bridge (treat the incredibly sticky surface as under the effect of the Glue spell)",
        "a 2 yard by 2 yard cart suspended from a heavy 3\" rope, cranked by a pully on the ${ Side }",
        "a 2 yard by 2 yard cart suspended from a heavy 3\" rope, cranked by a pully on the cart"
    ],
    "Bridge Width": [
        "1 foot",
        "2 feet",
        "1 yard",
        "2 yard",
        "2 yard",
        "2 yard",
        "3 yard",
        "3 yard"
    ],
    "Beam Width": [
        "4 inch",
        "6 inch",
        "8 inch"
    ],
    "Hidden Bridge": [
        "mechanical bridge",
        "magical forcefield bridge"
    ],
    "Penalty": [
        "",
        "-1",
        "-2",
        "-2",
        "-3",
        "-3",
        "-4"
    ],
    "Side": [
        "far",
        "near"
    ]
    

}