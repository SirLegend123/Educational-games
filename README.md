# Educational Games

A collection of free browser-based educational games. Each game is a self-contained web page in its own folder, so it runs in any modern browser without anything to install.

## Games

Every game where students type answers has an **on-screen keypad**, so tablets and phones don't need their own keyboard, which can cover half the screen. Each game shows the keys it needs: `y =`, `x`, `/` and `.` for straight lines; `n` for sequences; `²` for brackets; `/` and a space key for mixed numbers; `.` and `−` for standard form. The keypad types into whichever answer box was last tapped and hides itself between questions. A physical keyboard still works, and "Use my keyboard instead" switches the keypad off on that device (remembered across all games). The code is in `shared/keypad.js`.

The home page groups the games by topic. Students can tap topics on or off to build their own revision page (remembered on their device), and each card shows their best score in that game. **Copy a link to these topics** gives a link like `https://sirlegend123.github.io/Educational-games/?topics=fractions,standard-form` that opens with just those topics, handy for setting revision for a class. The topic names are `arithmetic`, `primes`, `fractions`, `standard-form`, `expressions`, `equations`, `sequences` and `graphs`.

| Topic | Game | Skill | Players |
| --- | --- | --- | --- |
| Arithmetic | [Noughts and Numbers](noughts-and-numbers/) | Mental addition and strategy | 1 (vs computer) or 2 |
| Primes & factors | [Prime Factor Defence](prime-defence/) | Prime factorisation and index notation | 1 |
| Fractions | [Fraction Wall Race](fraction-wall/) | Adding fractions and equivalent fractions | 1 |
| Fractions | [Mixed Number Mountain](mixed-number-mountain/) | Converting mixed numbers and the four operations with them | 1 |
| Standard form | [Standard Form Space Race](standard-form-race/) | Writing, reading and comparing numbers in standard form | 1 |
| Standard form | [Standard Form Bank Heist](standard-form-heist/) | The four operations with numbers in standard form | 1 |
| Expressions | [Bracket Factory](bracket-factory/) | Expanding single brackets, and expanding and simplifying | 1 |
| Expressions | [Grid Lock](grid-lock/) | Expanding double brackets with the grid method | 1 |
| Equations | [Equation Escape Room](equation-escape/) | Solving linear equations | 1 |
| Equations | [Elimination Agent](elimination-agent/) | Solving simultaneous equations algebraically (elimination) | 1 |
| Sequences | [Nth Term Vault](nth-term-vault/) | Finding and using the nth term of linear sequences | 1 |
| Sequences | [Matchstick Patterns](matchstick-patterns/) | Linear sequences from patterns, and why the rule works | 1 |
| Sequences | [Sequence Sniper](sequence-sniper/) | Deciding whether a number is a term of a sequence | 1 |
| Straight-line graphs | [Laser Battleships](laser-battleships/) | Gradient and y-intercept (`y = mx + c`) | 1 (vs computer) or 2 (pass and play) |
| Straight-line graphs | [Line Up](line-up/) | Simultaneous equations: where two lines cross | 2 (pass and play) |
| Straight-line graphs | [Parallel Parking](parallel-parking/) | Gradients of parallel and perpendicular lines | 1 |

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

### Nth Term Vault

Ten safes, each with two locks. Lock 1: find the nth term of the sequence shown (e.g. `4n + 3`, `20 − 3n`). Lock 2 alternates between "find the 50th term" and "which term equals 185?". Safes progress from rising sequences, to ones with negative numbers, falling sequences, decimal steps, and a boss safe showing only two non-consecutive terms. Wrong rules get specific feedback: what the student's rule gives compared with the sequence, plus a spotted mistake such as writing `n + 4` instead of `4n`, the wrong sign, using the first term instead of the difference, or the wrong constant. A second wrong answer shows the full working.

### Matchstick Patterns

Four matchstick patterns (squares in a row, triangles, houses, and two rows of squares), each with four questions: how many sticks in pattern 4, pattern 10, the nth term, and which pattern uses a given number of sticks. Answers are built stick by stick on screen. The "🎨 Show how it grows" button colours the starting sticks (the `+ b`) and each repeated block (the `an`), which shows why the rule is, for example, `3n + 1`.

### Sequence Sniper

Five 30-second rounds, each with a rule such as `4n − 1`. Numbers fly across the screen, and the player taps only the terms of the sequence. Distractors include near misses and "term 0" traps. Every tap shows the working (`4n − 1 = 99 → 4n = 100 → n = 25 ✅`). Wrong taps cost a life, and missed terms are listed in an end-of-game review. Later rounds bring falling sequences and much larger numbers.

### Mixed Number Mountain

Twelve checkpoints up a mountain. It starts with converting between mixed numbers and improper fractions, then adding (with and without carrying), subtracting (with and without borrowing), multiplying (by a whole number and by a mixed number), dividing, and a mix near the summit. Answers are typed like `3 5/6`. If an answer has the right value but isn't finished (not simplified, or an improper fraction instead of a mixed number), the game asks the student to finish it without counting a wrong try. Wrong answers are checked against the classic mistakes: adding numerators and denominators, taking the smaller fraction from the bigger when borrowing, multiplying whole numbers and fractions separately, and flipping the wrong fraction when dividing. The working always uses improper fractions.

### Standard Form Bank Heist

Twelve vaults: multiplying, dividing (each with and without adjusting the front number), negative powers, adding and subtracting with the same and different powers, and a final vault where the answer crosses into a new power. Answers are checked exactly, and the feedback spots the classic mistakes: not adjusting (e.g. `12 × 10⁹`), multiplying the powers, subtracting the powers the wrong way round, and adding the front numbers when the powers differ. The working shows each step, plus an ordinary-number check for addition and subtraction. Loot is £1,000 × the vault number, or half on a second try.

### Bracket Factory

Twelve orders on a factory conveyor belt, each a single bracket to expand. They progress through a number outside, minus signs inside, a negative outside, x or 2x outside (making x² terms), two letters, a negative x outside, then "expand and simplify" with two brackets, including subtracting a bracket and the double-negative trap in `6(2x + 7) − 2(x − 9)`. Answers like `3x + 12` or `x^2 + 3x` are read in any order. An answer with uncollected like terms is sent back without counting as wrong. Feedback spots multiplying only the first term and sign errors, and the working shows every multiplication.

### Grid Lock

Twelve locks, each a pair of brackets to expand with the grid method. Step 1: fill a 2 × 2 grid, with each box checked separately and a hint like `x × (−9) = ?` for wrong boxes. Step 2: add the boxes and collect like terms. It progresses from `(x + a)(x + b)` through minus signs, squaring a bracket, the difference of two squares, and numbers in front of x, to a final lock with no grid. Feedback catches the classic `(x + 5)² = x² + 25` mistake, sign errors and wrongly collected x terms. Expert mode removes the grid entirely.

### Elimination Agent

Ten pairs of "intercepted clues", each a pair of simultaneous equations hiding x and y. Students work through the elimination method in four checked steps: choose what to multiply each equation by so the x or y terms match (any valid choice is accepted), decide whether to add or subtract (same signs: subtract; different signs: add), solve for one letter, then substitute back for the other. The game then checks the answer in the other equation. The completed working builds up on screen like a textbook. Codes progress from matching coefficients, to opposite signs, multiplying one equation, multiplying both, and negative answers, to a cinema-ticket word problem. Wrong answers get explained (e.g. "4x and 4x have the same sign, so adding gives 8x"), and a second wrong answer shows that step. Expert mode asks for x and y directly.

### Noughts and Numbers

Noughts and crosses with numbers. Each player has the digits 0 to 5, each usable once per game. Players take turns placing a digit in an empty square (tap the square then the digit, the digit then the square, or type 0–5). The player who completes a full row, column or diagonal totalling exactly 10 wins; digits from both players count. Optional running totals sit beside every line and turn yellow when one more digit could make 10. Play two players on one device, or against the computer: "Easy", or "Tricky", which takes a winning move when it can and never leaves an immediate win if it can avoid it. Scores carry over between rounds, and the starting player alternates.

## Sharing the games (GitHub Pages)

1. In this repository on GitHub, open **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to *Deploy from a branch*, choose **main** and **/ (root)**, then press **Save**.
3. After a minute or two, the site is live at `https://sirlegend123.github.io/Educational-games/`. Each game has its own link, e.g. `https://sirlegend123.github.io/Educational-games/laser-battleships/`.

## Adding a new game

Create a new folder (e.g. `my-new-game/`) containing an `index.html`, then add a card for it to the home page (`index.html`) and a row to the table above.

Shared code lives in `shared/`: `theme.css` (colours, panels, buttons, grid styles) and `lines.js` (reading equations like `y = 2x + 1`, formatting fractions, and drawing coordinate grids). The newer games use these (`lines.js` also reads nth term rules like `4n + 3`); Laser Battleships is self-contained.
