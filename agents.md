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

1. [x] Everytime a user selects a path whose length is different from the secret code length, the footer icon (and its number) that indicates the path length should briefly turn red (boostrap danger). This provides immediate feedback to the user about the validity of their selection.
2. [x] Once the game is over, either by winning or losing, there shouldn't be a modal that pops up to indicate the end of the game anymore. Instead, the pattern lock itself should visually indicate the end of the game by enabling arrowHeads and dynamicLineStyle. It should still be disabled to prevent further input, but the visual cues will provide feedback on the game's outcome. For example, if the user wins, the pattern lock would turn (bootstrap success) to celebrate the victory. If the user loses, it could flash red (bootstrap danger) to indicate the loss. This approach keeps the user engaged with the main game interface and provides immediate feedback without interrupting the flow with a modal. Because of that, we cn get rid of the modal, the "Reveal" button is also no longer needed.
3. [] Write a few (5ish) playwright tests to cover the main user flows and edge cases. This will help ensure that the game behaves as expected and that any future changes don't break existing functionality. Focus on testing the user interactions, feedback mechanisms, and game outcomes to validate the overall user experience. Add them to the pipeline to ensure they run on every commit and pull request, providing continuous feedback on the health of the codebase.