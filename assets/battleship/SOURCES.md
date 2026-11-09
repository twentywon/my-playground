# Battleship ship artwork — visual references

The five top-down SVG ship types in `src/naval-artwork.js` are original game illustrations. No downloaded photograph, texture, silhouette, or 3D mesh is redistributed. The drawings simplify common naval features; they are not exact plans of named ships. The 5/4/3/3/2 board lengths represent the game's fleet rules, not real dimensions.

## Online references consulted

- [Battleship Iowa museum-related public project](https://github.com/boddie/BattleshipIowa). The repository describes itself as the mobile game created for the Battleship Iowa Museum in California.
- [Iowa project vessel illustration](https://github.com/boddie/BattleshipIowa/blob/master/Powerhouse/Assets/Resources/Textures/MenuBackground.png). Viewed as a visual reference for the three large gun turrets, raised bridge/superstructure and narrow hull. It remains a reference only; no pixels or meshes are included in this project.
- [Keel naval-history guessing game](https://github.com/LordKnish/keel), its [reference description](https://github.com/LordKnish/keel/blob/master/README.md), and [public ship-class list](https://github.com/LordKnish/keel/blob/master/public/ship-list.json). Consulted for naval ship categories and terminology; the repository cites Wikidata and Wikimedia Commons as its data sources.

The search queries used included “warship silhouettes” and “Iowa battleship”. Wikipedia access was unavailable in this execution environment; it is not listed as a directly consulted source.

## Simplified visual features

- Carrier: broad flight deck, deck markings, starboard island and aircraft silhouettes.
- Battleship: pointed bow, raised center superstructure and three large triple-gun turrets.
- Cruiser: slimmer hull, smaller gun turrets and center superstructure.
- Submarine: rounded pressure-hull silhouette, sail and stern control surfaces.
- Destroyer: smaller deck gun, two funnels and an open aft deck.

The artwork is shared by the lobby thumbnail, placement selector, board and fleet status icons. Enemy hulls are omitted from rendered markup until sunk or the game is over.
