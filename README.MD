# The DFRPG Random Dungeon Generator
## WHAT THIS IS AND HOW TO USE IT:
A HTML/CSS/JavaScript based random dungeon generator for the Dungeon Fantasy RPG, and for GURPS (particularly the GURPS Dungeon Fantasy product line).

This is intended as an entirely stand-alone and cross-platform application. It does not require web hosting and it does not require installation of a scripting environment or other special software. All you need is to download, unzip, and then open "index.html" in a relatively modern web-browser (I just can't support IE6, sorry).

## WHAT IT IS FOR:
The primary intent is twofold:
* to accelerate game preparation, so the GM can minimize paperwork and maximize fun
* to remind GMs about the many factors of dungeon design that are core parts of game balance in DFRPG and GURPS.

The most obvious two issues when GMs design their own "dungeons" are forgetting about mana and sanctity levels (making spellcasters particularly powerful), and not providing a varied enough palette of challenges (resulting in one profession becoming "the best" or another profession becoming "the worst").

The extreme use-case for this app is "push button, receive dungeon, start playing by reading out what's on the paper". It is currently possible to operate this way, but the experience will have bizarre elements introduced by the random systems and be a bit lifeless. Consider taking 30 minutes to review the output and replacing unsuitable encounters and descriptions. Or come up with a story to explain the insanity!

## WHAT IT DOES:
This app produces a dungeon map image with customizable resolution (suitable for printing or for online play on a virtual tabletop) and a formatted room-by-room key.

### Implemented Features:
* Control over dungeon size, shape, room sizes, room frequency (lots of rooms packed into a small space vs rooms scattered around), hallway squigglyness, number of dead-ends, staircases, general dungeon security level, monster difficulty.
* Hallways include height.
* Room dimensions, including height.
* Monster encounters keyed to party CER ("Combat Effectiveness Rating" - a starting party of four is usually in the 100-150 range).
* Wandering monster table, populated primarily from monsters found in the dungeon.
* Treasures keyed to encounter difficulty and overall dungeon CER (with option to produce completely random treasure using the DF8 treasure generator service, online)
* Concealed treasures.
* Doors with GURPS/DFRPG statistics for forcing open, picking, and breaking down. And shoving open, if they're particularly heavy.
* Secret or concealed doors
* Portcullises and how hard they are to lift.
* Traps (currently handled by references to published traps).
* Notes on general environmental conditions (Mana level, Sanctity, lighting).
* Odd dungeon features (misty or dangerous atmospheres, weird and magical pools and fountains - and mundane ones).
* Random dungeon junk in rooms to provide some colour and potentially interesting environments to interact with.
* Randomize travel time to the dungeon or select manually. Further dungeons have better loot, but burn more resources to get there and back again.

### TODO:
*Quick description of the enviornment, Survival checks for the trip from town.
* Create random rumours about the dungeon to find in town.
* Create some quest hooks - provide McGuffins to recover, kidnapped NPCs, name particularly notorious monsters, generate bounties
* Generate some "exceptional" monsters with lenses or special abilities.
* Have the program create completely new traps keyed to party CER, and provide statistics to the GM
* Pit traps, and pits as an alternative to stairs to the next level. I love pit traps.
* More dungeon environmental conditions: 
  * What are the walls made of and how easy are they to climb? 
  * What are the floors made of, and do they impose any interesting effects on movement and combat?  
    These have implications for PCs trying creative solutions, and are key factors for determining Natures Power for druids (not currently evaluated).
* Determine Natures Power level.
* Traps in specific room hexes and in hallways.
* "Setpiece" rooms and encounters - hand-crafted by a human to be guarenteed to make sense.
* More variable hallway widths, option to force a minimum of 2 yards or 3 yards.
* More coherent hallway digging algorithm (as an option; insane is also fun)
* option to create "flow" in the dungeon level, adjusting difficulty according to proximity to entrance/exit.
* match up stairs up/down to a "generate next floor" option
* option to regenerate a room, encounter, treasure, or trap if you don't like it
* Themed monster groups (with the option for totally insane monster groups too)
* Dungeons (or subsections of large dungeons) entirely populated on a selectable theme
* Cool hash-fill dungeon design
* put water on the map
* position dungeon junk on the map? (may never happen)

## CREDIT:

This project is significantly based on [version 1.0.3 of the random dungeon generator][drow] created by drow (drow@bin.sh).
We owe drow a significant debt of gratitude. Thank you for making this work possible by sharing your code.

Modifications and elaborations by Emily Smirle and Kyle Norton. Programming and data by Emily Smirle, Project Management and data by Kyle Norton. Code contributors include nasfarley88 and eggdropsoap. Pull requests are welcome!

This project is licensed under [Creative Commons BY-NC 3.0][creativecommons]

GURPS is a trademark of Steve Jackson Games, and its rules and art are copyrighted by Steve Jackson Games. 
All rights are reserved by Steve Jackson Games. 

This game aid is the original creation of Emily Smirle and Kyle Norton and is released for free distribution, 
and not for resale, under the permissions granted in the [Steve Jackson Games Online Policy][sjgamesonlinepolicy].

[drow]: http://donjon.bin.sh
[sjgamesonlinepolicy]: http://www.sjgames.com/general/online_policy.html
[creativecommons]: http://creativecommons.org/licenses/by-nc/3.0/