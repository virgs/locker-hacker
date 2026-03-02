## Pattern Lock “Hack the Code”

A variation of the classic *Bulls and Cows* code-breaking game. The objective is to determine a hidden code through iterative guesses and structured feedback.

This version replaces character strings with **pattern lock paths** over a grid of dots.

---

## 1. Objective

The goal is to correctly guess a hidden pattern.

After each guess, feedback is provided in the form of:

* **Bulls**: Number of dots that are correct **and** in the correct position in the sequence.
* **Cows**: Number of dots that are correct **but** in the wrong position.

The game continues until the number of Bulls equals the code length.

---

## 2. Board Configuration

The board consists of a rectangular grid of dots.

Examples of valid board sizes include (but are not limited to):

* 3×2
* 4×3
* 5×5
* 6×6

The total number of dots equals:

```
rows × columns
```

Dots are uniquely identifiable (e.g., by coordinates or numeric indices).

---

## 3. Code Definition

The secret code is defined as:

* A **sequence of distinct dots**
* With a fixed **code length L**

Valid code lengths may vary (e.g., 3, 4, 5, 6, etc.), provided:

```
L ≤ total number of dots on the board
```

The order of dots matters.

Example (4×3 board, code length = 4):

Valid code:

```
(0,0) → (1,0) → (1,1) → (2,1)
```

Invalid code:

```
(0,0) → (1,0) → (0,0) → (2,1)   (dot repeated)
```

---

## 4. Guess Rules

Each guess must be a valid pattern according to the constraints below.

### 4.1 No Repeated Dots

A dot may appear **at most once** in a pattern.

Invalid:

```
A → B → C → B
```

Valid:

```
A → B → C → D
```

---

### 4.2 No Skipping Over Unvisited Dots

A move between two dots is invalid if:

* The straight line between them passes through another dot
* And that intermediate dot has **not already been used earlier in the sequence**

Example (classic 3×3 mental model):

Invalid:

```
Top-left → Top-right
```

If the top-middle dot has not already been used.

Valid:

```
Top-left → Top-middle → Top-right
```

Also valid:

```
Top-middle → Top-left → Top-right
```

Because the intermediate dot was already visited.

This rule applies to any rectangular board size.

---

### 4.3 Straight-Line Constraint

The “no skipping” rule applies to:

* Horizontal moves
* Vertical moves
* Diagonal moves
* Any straight-line move where dots are evenly spaced

If a move geometrically passes through one or more intermediate dots, all those intermediate dots must already have been visited.

---

## 5. Feedback Calculation

After a valid guess:

* **Bulls** = count of positions where guess[i] == code[i]
* **Cows** = count of dots that:

    * Appear in both guess and code
    * But are in different positions

No dot contributes to both Bulls and Cows.

Example:

Secret:

```
A → B → C → D
```

Guess:

```
A → C → B → E
```

Result:

* Bulls = 1 (A)
* Cows = 2 (B and C swapped)

---

## 6. Termination Condition

The game ends when:

```
Bulls == L
```

At that point, the code is considered hacked. Congratulations. You have defeated a grid of dots.

---

## 7. Design Considerations

Because of the pattern constraints:

* Not all permutations of dots are valid guesses.
* Larger boards (5×5, 6×6) significantly increase the search space.
* Longer codes increase combinatorial complexity.
* The “no skipping” constraint reduces valid paths in non-trivial ways.

In short:

* The grid limits movement.
* The sequence matters.
* Geometry is part of the puzzle.
* And brute force becomes progressively less charming.