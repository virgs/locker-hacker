# Engineering Guidelines for AI Agent

## 0. Pre work Checklist
* Read the rules.md file to understand the constraints and requirements for valid patterns.
* Familiarize yourself with the existing codebase, especially the `PatternLock` component and its related files.
* Review the `memento.md` file for any relevant architectural decisions or design choices.

## 1. Think Before Coding

* Always reason step by step before writing code.
* Understand the problem, constraints, edge cases, and future impact.
* Design with long-term maintainability in mind.
* Plan how the feature integrates with the existing architecture.
* Prefer extensible patterns to quick fixes.

---

## 2. Code Quality Standards

All code must be:

* Clean and readable
* Modular and reusable
* Well-documented (clear naming over excessive comments)
* Secure and defensive (handle edge cases)
* Efficient and performant
* Easy to debug and test
* Following TypeScript and React best practices

Prefer:

* Strong typing (avoid `any`)
* Explicit return types always
* Clear naming conventions
* Predictable data flow

---

## 3. Architecture & Size Constraints

Keep everything small and focused.

### Size Limits (Soft Constraints)

* Functions: ≤ 30 lines, ≤ 4 parameters
* Components: ≤ 150 lines
* Classes: ≤ 150 lines
* Files: ≤ 200 lines

If something grows too large:

* Extract smaller components
* Extract custom hooks
* Extract utility modules
* Apply Single Responsibility Principle

Each unit should have one clear responsibility.

---

## 4. Incremental Development

* Avoid large refactors.
* Make small, testable changes.
* Ensure each step can be validated and rolled back.
* Preserve system stability while adding features.

---

## 5. User Experience First

* Consider how users interact with the feature.
* Optimize clarity, feedback, and usability.
* Avoid unnecessary complexity in UI.
* Keep state management predictable.

---

## 6. Styling Rules

* Each component must have a matching SCSS file.

    * `ComponentName.tsx`
    * `ComponentName.styled.tsx`
* Keep styles scoped and organized.
* Maintain naming consistency.
* Update SCSS files when renaming components.

---

## 7. Async & Function Conventions

* Use `async/await` instead of `.then()`
* Prefer arrow functions over regular functions
* Handle errors explicitly with try/catch
* Avoid nested async logic

---

## 8. Testing Requirements

* Keep tests updated with every change.
* Each component must have a matching testing file (*.tsx, or *.ts files).

  * `ComponentName.tsx`
  * `ComponentName.test.tsx`
 
* Cover:

    * New features
    * Edge cases
    * Critical flows
* Maintain strong coverage.
* Tests must reflect real usage scenarios.

---

## 9. Documentation & Project Memory

Maintain these files:

### `memento.md`

Store:

* Architectural decisions
* Important design choices
* Context and constraints
* Trade-offs made
* Key references or links

### `README.md`

Update when:

* Adding features
* Changing behavior
* Modifying setup or usage

---

## 10. After Completing Any Task

Always:

1. Create/Update `memento.md` with decisions/context
2. Update `README.md` if behavior changed
3. Update/add tests once any code is written
4. Review code quality
5. Refactor if needed
6. Ensure size constraints are respected

---

## 11. Package management

*  Keep pnpm as the package manager and use pnpm install instead of npm for better performance and workspace management.

---

## 12. Long-Term Vision

* Ensure new features align with overall architecture.
* Avoid shortcuts that create technical debt.
* Think about scalability and future extensibility.
* Prefer composability over monolithic solutions.

---

# Summary Philosophy

Think long-term.
Keep everything small and the tests in sync.
Write predictable, testable, modular code.
Prioritize clarity over cleverness.
Update documentation continuously.
Build incrementally and safely.
**Ask questions if you didn't understand something or if you think a different approach is better.**


# TODO list


1. [x] The game should only be considered running after the first guess is made, not while it's still being made. Once the reveal modal is shown and dismissed It should still be possible to visualize the pattern lock and the history of guesses. The pattern lock should be disabled though until a new game is started.  Ask questions if something is not clear.
2. [ ] Different players should have different colors in the pattern lock and in the dropdown items (the pattern locks in the history should still have the same color) (use bootstrap colors: primary, success, warning, info).  Ask questions if something is not clear.
3. [ ] On multiplayer games (aka games with more than one player), there should be a 3 seconds long modal announcing whose turn it is after a player makes a move, the turn should switch to the next player. The announcement should say something like "Player 2 turn" or something similar with the same meaning and the "Player X" should have the color of the player whose turn it is.  Ask questions if something is not clear.
4. [ ] After every one player game, update and show stats (number of wins, losses, time taken for each game, etc.), then show (avg win %, time with deciseconds) and total time. Stats should be stored in local storage so they persist across sessions. When the user clicks the game icon in the nav bar, a modal with these information in a table is shown. If you hold the icon for too long, these game stats should be clear from the local storage and the modal should show "No stats available. Play some games to see stats here!". Also, the stats modal should be shown when the user clicks the "Finish" button at the end of a game, showing the stats for that specific game and the overall stats. It also should be shown when a single player game is finished by the user giving up or winning, showing the stats for that specific game and the overall stats.  Ask questions if something is not clear.
5. [ ] Add a footer that tells what's the current code length, the current level and total time with the seconds precision. This should be visible in all screens.  Ask questions if something is not clear.
