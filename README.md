# Educational Games

A collection of free browser-based educational games. Each game is a self-contained web page in its own folder, so it runs in any modern browser without anything to install.

## Games

| Game | Topic | Players |
| --- | --- | --- |
| [Laser Battleships](laser-battleships/) | Straight-line graphs: gradient and y-intercept (`y = mx + c`) | 1 (vs computer) or 2 (pass and play) |
| [Line Up](line-up/) | Simultaneous equations: where two lines cross | 2 (pass and play) |
| [Parallel Parking](parallel-parking/) | Gradients of parallel and perpendicular lines | 1 |
| [Equation Escape Room](equation-escape/) | Solving linear equations | 1 |
| [Prime Factor Defence](prime-defence/) | Prime factorisation and index notation | 1 |
| [Fraction Wall Race](fraction-wall/) | Adding fractions and equivalent fractions | 1 |
| [Standard Form Space Race](standard-form-race/) | Writing, reading and comparing numbers in standard form | 1 |

### Laser Battleships

Each player secretly places two ships on a coordinate grid. On their turn, a player types the equation of a straight line, such as `y = 2x + 1`, and a laser fires along that line across the opponent's grid. Every time a laser crosses a side of a ship it makes a hole: going right through a ship (in one side, out another) makes **2 holes**, and a graze (touching a corner or running along an edge) makes **1 hole**. A ship sinks when it has **4 holes**. Holes are shown on the grid so players can aim their next shot, and a hole in the same place doesn't count twice. The first player to sink both enemy ships wins.

In **solo mode** the computer hides its own fleet and fires back. Each of its shots is shown with its equation, so students see more examples of lines. "Easy" fires random lines, and "Clever" aims near holes it has already made.

Teaching features:

- Accepts the ways students commonly write lines: `y = 3x - 2`, `y = -x + 4`, `y = 1/2x`, `y = x/2 + 1`, `y = 0.5x`, `y = 5`, `y = 3 + 2x`.
- While typing, it shows how the equation is being read ("gradient 2, y-intercept 1").
- After each shot, it explains the line: "for every 1 step right the line goes up 2; it crosses the y-axis at (0, 1)".
- Optional aiming line for beginners; small (−6 to 6) or large (−10 to 10) grid.

### Line Up

The grid has 8 stars. Players take turns drawing a line by typing its equation. A line through a free star claims it, and a line through an opponent's star (crossing their line right on it) steals and locks it. After each line, the player works out exactly where it crosses their opponent's latest line, or says the lines are parallel, for 2 points. Wrong answers show the full working: set the equations equal, collect terms, divide, substitute.

### Parallel Parking

Ten levels, each with a road and a parking spot P. The player types the equation of a line through P that is parallel or perpendicular to the road. Levels 1–3 are parallel, 4–6 perpendicular, and 7–10 mix both with the road's equation hidden, so the gradient must be read from two marked points. Feedback says whether the gradient or the intercept is wrong, and up to three hints walk through the method. Levels are randomly generated each game.

### Equation Escape Room

Ten locked doors, each opened by solving an equation: one-step, two-step, brackets, unknowns on both sides, brackets with unknowns on both sides, a fraction, and a final "brackets on both sides" boss. Answers from room 6 on can be negative. Solving within two tries earns a key; a wrong answer gives the first step as a hint, and a second wrong answer shows the full working. The game is timed and remembers your best result on that device. Equations are randomly generated each game.

### Prime Factor Defence

Monsters carrying composite numbers walk along a road towards the castle. The player fires primes (2, 3, 5, 7, 11, 13) with buttons or the keyboard. A prime that is a factor divides the monster's number, and a prime that isn't makes it speed up. A monster divided down to 1 is defeated, and its prime factorisation is shown in index form (e.g. `60 = 2² × 3 × 5`). Waves bring larger numbers and more primes. Monsters that reach the castle cost a life. The game has slow, normal and fast speeds, a pause button, and remembers your best score on that device.

### Fraction Wall Race

Build a 10-row fraction wall against the clock. Each row starts with one or two bricks, and the player adds bricks from a tray (including some spares) until the row is exactly 1. The running total shows the working with a common denominator, e.g. `1/3 + 1/4 = 4/12 + 3/12 = 7/12 (need 5/12 more)`. A brick that would overflow the row is rejected with the working and a 5-second penalty. Rows move from halves, thirds, quarters, sixths and eighths up to mixes of fifths, tenths and twelfths. In hard mode, tray bricks are all the same size, so the sums can't be judged by eye.

### Standard Form Space Race

A rocket flies along a powers-of-ten track through 13 real objects, from a flu virus (1.2 × 10⁻⁷ m) to the Milky Way (9.5 × 10²⁰ m). Each stop is a mission of one of four kinds: **write it** in standard form, **read it** as an ordinary number, **fix it** (e.g. 0.8849 × 10⁴ → 8.849 × 10³), or **order** four objects by size. Missions are mixed differently each game. Answers are checked exactly, and the feedback spots common mistakes: the wrong sign on the power, a front number that isn't between 1 and 10, or the decimal point in the wrong place. A hint follows the first wrong answer, and the answer with working after the second. Fuel: 3 for right first time, 1 for right second time.

## Sharing the games (GitHub Pages)

1. In this repository on GitHub, open **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to *Deploy from a branch*, choose **main** and **/ (root)**, then press **Save**.
3. After a minute or two, the site is live at `https://sirlegend123.github.io/Educational-games/`. Each game has its own link, e.g. `https://sirlegend123.github.io/Educational-games/laser-battleships/`.

## Adding a new game

Create a new folder (e.g. `my-new-game/`) containing an `index.html`, then add a card for it to the home page (`index.html`) and a row to the table above.

Shared code lives in `shared/`: `theme.css` (colours, panels, buttons, grid styles) and `lines.js` (reading equations like `y = 2x + 1`, formatting fractions, and drawing coordinate grids). Line Up, Parallel Parking and Equation Escape Room use these; Laser Battleships is self-contained.
