## Reworded `ai_inference_rules.md` (less math, more plain language)

# Pattern Lock “Hack the Code” — AI Inference Rules

## What this AI does

This AI’s job is to **narrow down what the secret pattern can be**, using only:

* the player’s past guesses (valid patterns), and
* the game feedback (**Bulls** and **Cows**).

The AI **does not make guesses**. It only learns from guesses that already happened.

---

## Key idea

Instead of trying to “reason in the abstract”, the AI keeps a list of **all secret patterns that are still possible**.

Think of it like this:

> “Given everything we’ve seen so far, these are the only secrets that could still be true.”

That list is called the **Candidate List**.

As more guesses happen, the candidate list shrinks, until ideally only **one** candidate remains.

---

## What counts as a valid secret (and valid candidate)

A secret (and any candidate) must be a valid pattern-lock path:

* **No repeated dots**
* **No skipping unvisited dots on straight lines**
  If moving from dot A to dot B passes through dot X in a straight line, then **X must have already been used earlier** in the sequence.

This rule applies on any grid size (3×2, 4×3, 5×5, 6×6, etc.).

---

## What the AI stores

### 1) Candidate List (the source of truth)

A list of every valid secret pattern that still matches all feedback so far.

If a candidate pattern would produce different Bulls/Cows than what the game reported, it gets removed.

### 2) “Possible dots per position” (fast summary)

For each position (0 to L-1), the AI also keeps a set of dots that could still appear there, based on the candidate list.

Example:

* Position 0 could still be {A, F, J}
* Position 1 could still be {B, C}
* …

This is not separate “extra knowledge”; it’s just a summary of what the candidates imply.

### 3) “Definitely in” / “definitely out” dots

From the candidate list:

* **Definitely in** = dots that appear in *every* remaining candidate
* **Definitely out** = dots that appear in *no* remaining candidate

---

## Inference rules

### Rule 1 — Candidate filtering (the main rule)

For each observed guess:

1. Pretend each candidate is the secret.
2. Compute what feedback that candidate would produce for the guess.
3. If it doesn’t match the real feedback, remove it.

This alone is enough to solve the game (given enough information), because it never removes a valid secret.

---

### Rule 2 — “Nothing matches” (easy elimination)

If a guess returns:

* Bulls = 0
* Cows = 0

Then **none of the dots in that guess are in the secret**.

Those dots can be treated as “definitely out”.

---

### Rule 3 — “Everything matches” (easy inclusion)

If Bulls + Cows equals the code length L, then:

* **every dot in the guess is in the secret**
* **no dot outside the guess is in the secret**

So the secret is some re-ordering of the guess dots (still respecting pattern rules).

---

### Rule 4 — “One change in one position” (bull confirmation)

If two guesses are identical except for one position:

* and Bulls goes up by 1,
  then the new dot is correct for that position.

This is a clean way to directly lock positions when the guess history allows it.

---

### Rule 5 — “Swapping two positions” (placement discovery)

If one guess is the same as another, except two dots swapped places:

* and Bulls changes by 2,
  then those two dots must belong to those positions (one way or the other).

In practice, the candidate filter will already enforce this, but this rule is helpful for explanation and debugging.

---

### Rule 6 — Pattern validity pruning (geometry matters)

Even if Bulls/Cows would match, a “secret” is impossible if it breaks pattern-lock movement rules.

So all candidates must also be legal paths under:

* no repeats
* no illegal skipping

This single rule often removes a large amount of false possibilities.

---

## When the AI is “done”

The AI has identified the secret when:

* **Candidate List size == 1**

At that point, the remaining candidate is the only possible secret.

---

## How close are we? (progress reporting)

Because the AI doesn’t guess, “progress” means:

> How much we reduced the space of possible secrets.

The AI reports these:

### A) Solved Percentage (recommended)

This reads like “how close to a single answer”.

* **0%** = at the start (everything is possible)
* **100%** = only one candidate remains

It’s based on how much the candidate list shrank compared to the starting list.

### B) Candidate Count

Just the raw number:

* “There are 12 possible secrets left.”

This is the most honest indicator.

### C) Position Certainty Percentage

Looks at each position:

* If a position has 1 possible dot left, it’s “locked”
* If it has many possible dots, it’s still uncertain

This produces an easy-to-read percentage like:

* “Position certainty: 76%”