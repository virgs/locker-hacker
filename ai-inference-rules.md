# Pattern Lock — AI Inference Rules

## Core idea

At the start of each game, the AI generates every valid pattern-lock path on the current grid — the **candidate list**. A valid path has no repeated dots and never skips over an unvisited dot on a straight line.

After each guess, the AI compares the game's Bulls/Cows feedback against what each candidate would have produced for that same guess. Any candidate that disagrees with the real feedback is eliminated.

When only one candidate remains, that's the secret code.

---

## Progress reporting

Since the AI observes rather than guesses, progress is measured by how much the candidate list has shrunk:

- **Candidate count** — the raw number of secrets still possible ("12 candidates remaining").
- **Solved percentage** — how far we've gone from the full initial list down to one: 0% at the start, 100% when solved.
- **Position certainty** — for each position in the code, the fraction of positions that have been narrowed down to a single dot.
