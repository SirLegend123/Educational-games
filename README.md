# Educational Games

A collection of free browser-based educational games. Each game is a self-contained web page in its own folder, so it runs in any modern browser without anything to install.

## Games

| Game | Topic | Players |
| --- | --- | --- |
| [Laser Battleships](laser-battleships/) | Straight-line graphs: gradient and y-intercept (`y = mx + c`) | 2 (pass and play) |

### Laser Battleships

Each player secretly places two ships on a coordinate grid. On their turn, a player types the equation of a straight line, such as `y = 2x + 1`, and a laser fires along that line across the opponent's grid. Every time a laser crosses a side of a ship it makes a hole: going right through a ship (in one side, out another) makes **2 holes**, and a graze (touching a corner or running along an edge) makes **1 hole**. A ship sinks when it has **4 holes**. Holes are shown on the grid so players can aim their next shot, and a hole in the same place doesn't count twice. The first player to sink both enemy ships wins.

Teaching features:

- Accepts the ways students commonly write lines: `y = 3x - 2`, `y = -x + 4`, `y = 1/2x`, `y = x/2 + 1`, `y = 0.5x`, `y = 5`, `y = 3 + 2x`.
- While typing, it shows how the equation is being read ("gradient 2, y-intercept 1").
- After each shot, it explains the line: "for every 1 step right the line goes up 2; it crosses the y-axis at (0, 1)".
- Optional aiming line for beginners; small (−6 to 6) or large (−10 to 10) grid.

## Sharing the games (GitHub Pages)

1. In this repository on GitHub, open **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to *Deploy from a branch*, choose **main** and **/ (root)**, then press **Save**.
3. After a minute or two, the site is live at `https://sirlegend123.github.io/Educational-games/`. Each game has its own link, e.g. `https://sirlegend123.github.io/Educational-games/laser-battleships/`.

## Adding a new game

Create a new folder (e.g. `my-new-game/`) containing an `index.html`, then add a card for it to the home page (`index.html`) and a row to the table above.
