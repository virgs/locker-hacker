# Memento — locker-hacker

## Architectural Decisions

### PatternLock Component Architecture

**Decision:** Split PatternLock into a presentational component + `usePatternLock` hook.

**Rationale:** The original `PatternLock.tsx` was ~210 lines, exceeding the 200-line file limit and 150-line component limit from `agents.md`. All internal state, collision detection, and event handler logic now lives in `usePatternLock.ts`. The component file is now ~90 lines, purely responsible for rendering.

**Files:**
- `src/components/PatternLock.tsx` — props interface + JSX rendering
- `src/components/usePatternLock.ts` — internal state, effects, event handlers

---

### Container Sizing vs. Grid Dimensions

**Decision:** Two orthogonal concepts with separate props:
- `containerSize?: number | string` — the CSS size of the container (square). Default: `"100%"`.
- `width?: number` — grid **columns**. Default: `5`.
- `height?: number` — grid **rows**. Default: `5`.

**Rationale:** `width` and `height` describe the board shape (how many dots wide × tall), not the CSS size. A `3×3` board and a `2×4` board both render inside the same `containerSize` container. This naming mirrors natural language: "the board is 3 wide and 4 tall".

**Usage examples:**
```tsx
<PatternLock containerSize={200} width={3} height={3} />   // 3×3 grid, 200px container
<PatternLock containerSize={300} width={4} height={3} />   // 4 cols × 3 rows
<PatternLock containerSize="100%" width={2} height={5} />  // 2 cols × 5 rows, full width
```

---

### Non-Square Grid Math

**Decision:** `getPoints` accepts `cols` and `rows` separately; `getPointsInTheMiddle` accepts `cols`.

**Rationale:** Cell dimensions are computed as `cellWidth = containerWidth / cols` and `cellHeight = containerHeight / rows`, allowing asymmetric grids. `Point.tsx` uses `colPercent = 100/cols` and `rowPercent = 100/rows` for the flex layout so each cell fills its share of the container in both axes.

---

### Arrow Heads (`arrowHeads` prop)

**Decision:** Added `arrowHeads?: boolean` (default `false`) to `PatternLock`. When `true`, each connector line renders a CSS border-triangle at its `to` end (`left: 100%` inside the connector div).

**Rationale:** Arrow heads communicate the draw direction, making the pattern "flow" readable. The triangle size is proportional to `connectorThickness` (height ≈ 3×, length ≈ 2×). Color is driven by CSS class rules in `PatternLock.styled.tsx` (matching the connector color for each state: white / grey / green / red) so no extra color props are needed.

---

### `dynamicLineStyle` Direction: Oldest = Thickest/Most-Opaque

**Decision:** Index 0 (oldest/first-drawn) gets `connectorThickness` and opacity `1.0`. The last index (newest/live) gets `minConnectorThickness` and `minConnectorOpacity`. Both use the same linear ratio: `1 - i / max(1, N-1)`.

**Rationale:** The user specified exact examples — 5 lines with min=2, max=4 → `[4, 3.5, 3, 2.5, 2]`. This requires a descending linear sequence with no rounding (exact floats for smooth sub-pixel rendering). The previous implementation was ascending (oldest=thinnest), which was the opposite of the required behavior.

**Tests include the three spec examples verbatim**, plus boundary/monotonicity checks (25 tests total).

---

### Per-Connector Thickness and Opacity (`dynamicLineStyle` redesign)

**Decision:** Both thickness and opacity are now **per-connector**, not global. The `Connector` type carries its own `thickness` and `opacity`. `buildConnector` computes them at construction time using `connectorIndex/totalConnectors` as the ratio, so `getConnectorPoint` receives the correct centering offset for each individual line.

**Rationale:** The previous global-thickness approach applied the same width to all connectors, making the "trail" effect visible only as a single uniform change when the path grew. Per-connector values create a smooth gradient: oldest connector = `minConnectorThickness` + `minConnectorOpacity`, newest = `connectorThickness` + full opacity. This also eliminates the visual "thinning" artefact when `dynamicLineStyle=false` because opacity is now strictly guarded by the flag.

**New prop `minConnectorOpacity?: number`** (default `0.2`) — ensures the oldest connector is never invisible.

**`cols`/`rows` removed from `ConnectorsProps`** — the old `maxPossibleLines` cap is no longer needed; the per-connector ratio is bounded to `[1/N, 1]` by construction.

**Function signatures updated:**
- `getDynamicConnectorThickness`: `{connectorIndex, totalConnectors, connectorThickness, minConnectorThickness}`
- `getConnectorOpacity`: `{connectorIndex, totalConnectors, minConnectorOpacity}`

Both functions are pure, fully tested (21 tests), and use the same monotonically increasing ratio formula — no cyclic behavior possible.

---


### Arrow Head Always on Last Connector

**Decision:** The arrow head (`arrowHeadIndex`) now shows on the last connector in the array regardless of whether it is a live trailing connector or the final path segment. Previously it only showed on the live connector, making the arrow invisible when the component is disabled (no mouse interaction → no live connector).

---

### `dynamicLineStyle` and `minConnectorThickness` Props

**Decision:** Added `dynamicLineStyle?: boolean` (default `false`) and `minConnectorThickness?: number` (default `2`) to `PatternLockProps`. When `dynamicLineStyle=true`, connector thickness scales linearly from `connectorThickness` (1 line) down to `minConnectorThickness` (max possible lines for the grid). When `false`, thickness is always `connectorThickness`.

**Implementation:** Logic extracted into `getDynamicConnectorThickness` in `math.ts` (pure, tested). Formula: linear interpolation based on `numLines / maxPossibleLines`. No cyclic behavior — `Math.max(minConnectorThickness, ...)` ensures the floor is respected even if `numLines` exceeds the theoretical maximum.

**`cols` and `rows` forwarded to Connectors** to compute `maxPossibleLines = cols * rows - 1`.

---

### Removed `error` and `success` Props

**Decision:** Removed `error?: boolean` and `success?: boolean` from `PatternLockProps`. Removed corresponding CSS rules from `PatternLock.styled.tsx`.

**Rationale:** Simplifies the API; callers can apply their own CSS classes via `className` prop if they need state-specific styling.

---

### Optional `onChange` and `onFinish`

**Decision:** `onChange` and `onFinish` are optional props (both in `PatternLockProps` and `UsePatternLockOptions`). All call sites in `usePatternLock.ts` use optional chaining (`onChange?.()`, `onFinish?.()`).

**Rationale:** Disabled/display-only pattern locks don't need callbacks. Making them optional removes the burden of passing empty no-ops.

---

### Connector Z-Order (Dots Above Lines)

**Decision:** `.point-wrapper` now has `position: relative; z-index: 2`, placing dots above the connector wrapper (`z-index: 1`).

**Rationale:** Previously connectors rendered on top of dots (z-index: 1 > no z-index). Lines appeared to cut through dot centers rather than terminate at dot edges, looking especially "unfinished" in disabled mode. With dots above connectors, each connector is visually hidden inside the dots at both endpoints, creating the classic pattern-lock appearance where lines cleanly emerge from and dock to each dot.

---

### Arrow Head on Live Line Only (`arrowHeadSize` prop)

**Decision:** The arrow head renders only on the "live" trailing connector (the line from the last selected point to the current cursor position). Completed path connectors render as plain lines with no arrow head.

**Implementation:** In `Connectors.tsx`, `liveConnectorIndex` is set to the last array index when `mouse !== null && path.length > 0`, otherwise `-1`. The arrow head div is rendered only when `i === liveConnectorIndex`.

**`arrowHeadSize` prop:** Added to `PatternLockProps` and `ConnectorsProps` (default `10`). Controls the CSS border triangle dimensions: `borderTopWidth/borderBottomWidth = arrowHeadSize`, `borderLeftWidth = Math.round(arrowHeadSize * 1.5)`.

---

### Removed `length` Prop

**Decision:** The `length` prop (which gated `onFinish` until the path reached a minimum length) was removed.

**Rationale:** Decided not to pursue this approach; `onFinish` fires on any non-empty path release.

---

## Key Constraints

- **pnpm** is the package manager (`pnpm install`, not `npm install`).
- All styled-components go in `*.styled.tsx` co-located with their component.
- File limit: 200 lines (soft). Component limit: 150 lines (soft).
- Tests must cover new/changed logic; run `pnpm test` to verify.
- ESLint config is flat (eslint 10): `eslint.config.js`. Run `pnpm lint`.

### `dynamicLineStyle=false` Bug Fix: Stale CSS Override Removed

**Root Cause:** `src/App.scss` contained a SCSS mixin that applied `:nth-child(1..9)` rules with `!important` to `.react-pattern-lock__connector`, overriding the component's inline `height` and `opacity` for the first 9 connectors. This made every connector appear with a different thickness and opacity regardless of the `dynamicLineStyle` prop — explaining why "it stabilizes at ~10 lines" (no CSS rule existed beyond `:nth-child(9)`).

**Fix:**
1. Removed the stale CSS from `App.scss` entirely (it predated the React prop-based implementation).
2. Added `dynamicLineStyle: boolean` as a required parameter to `getDynamicConnectorThickness` and `getConnectorOpacity` in `math.ts`. When `false`, both return the constant values (`connectorThickness` / `1`) immediately, making the invariant explicit at the function level.
3. Simplified `Connectors.tsx` `buildConnector` to always call the math functions (no more ternary guard), since the functions now own both code paths.

---

### Game Logic Layer (`src/game/`)

**Decision:** Added a `src/game/` directory to house pure, framework-agnostic game logic, separate from the React component layer (`src/components/`) and shared geometry utilities (`src/math/`).

**Files:**
- `src/game/CodeGenerator.ts` — `CodeGenerator` class that generates a valid hidden code.
- `src/game/GuessValidator.ts` — `GuessValidator` class + `Feedback` type that computes bulls/cows.

**`CodeGenerator` design:**
- Constructor takes `{ cols, rows, length }` and throws immediately if `length > cols * rows`.
- `generate()` uses a random-restart loop: `tryGenerate()` starts at a random dot and extends the path by picking a random valid next dot (via `validNextDots`) until `length` is reached. If stuck (no valid next dots), it returns `null` and the loop retries.
- `validNextDots` reuses `getPointsInTheMiddle` from `math.ts` to enforce the no-jumping constraint: a candidate dot is valid only if every intermediate dot on the straight-line path to it has already been visited.

**`GuessValidator` design:**
- Constructor stores an immutable copy of the code.
- `validate(guess)` computes bulls (exact-position matches) and cows (dots in both, but at wrong positions). No dot double-counts: `cows = inBoth - bulls`.
- `isSolved(guess)` returns true when `bulls === code.length`.

**Reuse of `getPointsInTheMiddle`:** The geometry function already used by the PatternLock component enforces move validity during code generation — no duplication of logic.

---

### `cols`/`rows` Prop Rename (was `width`/`height`)

**Decision:** Renamed `PatternLockProps.width` → `cols` and `PatternLockProps.height` → `rows`.

**Rationale:** `width`/`height` are CSS dimension concepts. The props control the grid structure (number of columns and rows), which is the same vocabulary used everywhere else: `usePatternLock`, `CodeGenerator`, `getPoints`, `getPointsInTheMiddle`, and the `config` object in `App.tsx`. Aligning the prop names eliminates the translation layer (`cols: width, rows: height`) that existed inside `PatternLock`.

---

### `FeedbackIndicator` Component

**Decision:** Added `src/components/FeedbackIndicator.tsx` to display a vertical column of `codeLength` coloured dots beside each history entry.

**Colour convention:**
- Green `#22c55e` — bull (correct dot, correct position)
- Yellow `#eab308` — cow (correct dot, wrong position)
- Grey `#6b7280` — miss (dot not in code)

Dots are sorted: bulls first, cows next, misses last — matching standard Mastermind peg conventions. The colour mapping lives in `COLORS` constant so it can be updated without touching the render logic.

**Files:**
- `src/components/FeedbackIndicator.tsx`
- `src/components/FeedbackIndicator.styled.tsx` (`FeedbackDot`, `FeedbackColumn` styled-components)

---

### History Entry Numbering and Dividers

**Decision:** Each history entry shows a small `#N` badge (absolute-positioned, top-left of the PatternLock box) and a subtle horizontal divider between entries (`:not(:first-child)` border-top).

**Numbering:** Since `pathHistory.unshift()` keeps newest first, guess index `i` maps to guess number `pathHistory.length - i`. So the most recent guess always shows the highest number.

**Layout refinements:**
- `PatternLockWrapper` (`position: relative; display: inline-block`) wraps each history PatternLock so `GuessNumber` can be absolute-positioned at `top: 2px; left: 2px` with `z-index: 3` (above the lock's dots at z-index 2).
- `HistoryEntry` uses `justify-content: center` so the lock+feedback pair is horizontally centred.
- `HistoryList` has `width: 100%` and `Sidebar` has `align-items: center` so the list fills the sidebar width and everything is centred.
- `MainArea` gains `height: 100%; min-height: 0` to guarantee vertical centring of the PatternLock in all browsers.

---

### True Viewport Centering via `padding-left` on `MainArea`

**Problem:** `MainArea` fills `viewport_width − 220px` (the sidebar). `justify-content: center` centres the PatternLock within that reduced area, so visually it appears left-shifted by `sidebar_width / 2 = 110px` relative to the true viewport centre.

**Fix:** `padding-left: 220px; box-sizing: border-box` on `MainArea`. The content box shrinks by 220px from the left, so `justify-content: center` now places the PatternLock at `(viewport_width − 220px) / 2 + 220px / 2 = viewport_width / 2` — the exact screen centre.

---

### `GuessNumber` Position

**Decision:** `GuessNumber` moved from inside `PatternLockWrapper` to a direct child of `HistoryEntry`, positioned at `left: 4px; top: 50%; transform: translateY(-50%)`. This anchors it to the left edge of the entry, vertically centred, well away from the first pattern dot.

**Previous issue:** `left: 2px` inside `PatternLockWrapper` overlapped the first grid dot, causing visual confusion.

---

### Two-Column App Layout

**Decision:** The app uses a full-viewport flex-row layout: `MainArea` (flex:1, centered) holds the active PatternLock; `Sidebar` (fixed 220px wide, `overflow-y: auto`) holds the PatternHistory.

**Files:**
- `src/App.styled.tsx` — `AppLayout`, `MainArea`, `Sidebar` styled-components
- `src/App.scss` — overrides `body { display: block }` and sets `html/body/#root` to `height: 100%` (needed because `index.css` applies `display: flex; place-items: center` to `body`, which fights the two-column layout)

**Scroll behaviour:**
- `AppLayout` and `MainArea` both have `overflow: hidden` — the PatternLock never scrolls out of view.
- `Sidebar` has `overflow-y: auto` and `height: 100%` — it scrolls independently when the history list grows.

**`entrySize` prop on `PatternHistory`:** Controls `containerSize` of each history PatternLock (default 120). `pointSize` and `arrowHeadSize` are derived as `Math.round(entrySize / 10)` to keep the visuals proportional at any size.

---

### `PatternHistory` Component

**Decision:** Extracted the history-entries rendering from `App.tsx` into `src/components/PatternHistory.tsx`.

**Rationale:** The `pathHistory.map(...)` block in `App.tsx` was inline configuration + rendering mixed together. `PatternHistory` owns the display of past guesses (disabled, `dynamicLineStyle`, arrow heads) and keeps `App.tsx` focused on game-state management only.

**Props:** `{ pathHistory: number[][], code: number[], cols: number, rows: number }`

`GuessValidator` is instantiated once per render (not per entry) and reused across the `.map`. `code` is stable (from `useState` with no setter) so this is effectively a single allocation.

**Layout styled-components:** `HistoryList` (flex column, gap 12px), `HistoryEntry` (flex row, gap 16px) live in `PatternHistory.styled.tsx`.

---

### `PatternHistory` Scroll and Numbering

**Decision:** Oldest guesses appear at the top (index 0), newest at the bottom. A sentinel `<div ref={listEndRef} />` is appended after the mapped list. `useEffect` calls `listEndRef.current?.scrollIntoView({ behavior: 'smooth' })` whenever `pathHistory.length` changes, auto-scrolling the sidebar to show the latest guess.

**Numbering:** `GuessNumber` displays `#{index + 1}` since `App.tsx` uses `push()` (oldest-first), making index 0 = guess #1.

---

### Navbar Component

**Decision:** Added `src/components/Navbar.tsx` (rendered at the top of `AppLayout`) with a title "Pattern Lock History" and a GitHub icon (`react-feather`'s `<Github>`) linking to https://github.com/virgs/locker-hacker.

**Constants file:** `src/components/Navbar.constants.ts` exports `GITHUB_URL` and `APP_TITLE`. These are imported by `Navbar.tsx` (used at runtime) and by `Navbar.test.ts` (unit-tested without loading React/JSX).

**Styling (`Navbar.styled.tsx`):** `NavbarContainer` (flex row, 52 px height, dark background), `NavbarTitle` (h1 reset to `1.1rem` to avoid the browser h1 default of `3.2em`), `GitHubLink` (hover: full white + subtle scale, `focus-visible` ring in Cyborg blue). Both `NavbarContainer` and `NavbarTitle` include `@media (max-width: 480px)` rules for mobile.

---

### Cyborg Bootswatch Theme

**Decision:** Imported `bootswatch/dist/cyborg/bootstrap.min.css` as the first CSS import in `main.tsx`. This provides the Cyborg dark colour scheme (body background `#060606`, primary blue `#2a9fd6`, Roboto font) to the whole application.

**index.css simplified:** Removed the Vite starter's opinionated `color`, `background-color`, and font stack declarations (now supplied by Cyborg). Kept only `font-synthesis`, `text-rendering`, smoothing flags, `margin: 0`, and `min-width: 320px` so Cyborg's base styles are never overridden.

**`App.scss` stays as-is:** The `html/body { display: block }` override is still needed to cancel any `display: flex` the Bootstrap reset might set.

---

### Layout: Navbar + ContentArea

**Decision:** `AppLayout` changed from `flex-direction: row` to `flex-direction: column`. A new `ContentArea` styled component wraps the existing `MainArea` + `Sidebar` pair as a `flex-direction: row` container.

```
AppLayout (flex-col, 100%)
├── Navbar          (flex-shrink: 0, 52 px)
└── ContentArea     (flex: 1, min-height: 0, flex-row, overflow: hidden)
    ├── MainArea    (flex: 1, centred, padding-left: 220px)
    └── Sidebar     (220 px, overflow-y: scroll)
```

`min-height: 0` on `ContentArea` is required so the flex child does not overflow `AppLayout` past 100 vh.

---

### Always-Visible Sidebar Scrollbar

**Decision:** Changed `Sidebar` from `overflow-y: auto` to `overflow-y: scroll` so the scrollbar track is always rendered (users see immediately that content is scrollable). Added custom `scrollbar-width: thin` (Firefox) and `&::-webkit-scrollbar` rules for a slim, subtly styled track.

---

### `FeedbackIndicator.utils.ts`

**Decision:** Extracted `COLORS` and `dotColor` from `FeedbackIndicator.tsx` into `src/components/FeedbackIndicator.utils.ts`. This keeps the component file free of testable pure logic, and lets `FeedbackIndicator.test.ts` import those exports without pulling in React or styled-components.

---

### Responsive Layout (mobile ≤ 600 px)

**Problem:** On a 430 px viewport the Sidebar (220 px) consumed most of the width, leaving the MainArea only ~210 px while it still had `padding-left: 220px`. The 500 px PatternLock overflowed and was hidden behind the sidebar.

**Fix — stacked column layout on mobile, viewport always locked (no page scroll):**

| Element | Desktop | Mobile (≤ 600 px) |
|---|---|---|
| `html/body` | `overflow: hidden; height: 100%` | same — no page scroll on any screen size |
| `AppLayout` | `height: 100%; overflow: hidden` | same — no override needed |
| `ContentArea` | `flex-direction: row` | `flex-direction: column` (stacks vertically) |
| `MainArea` | `flex: 1; padding-left: 220px` | `flex: none; width: 100%; padding: 16px` |
| `Sidebar` | `220px; height: 100%; overflow-y: scroll` | `width: 100%; flex: 1; min-height: 0; overflow-y: scroll; border-top` |

**Why `flex: 1; min-height: 0` on mobile Sidebar:** without `min-height: 0`, a flex child's minimum height defaults to its content size, so the browser never imposes a height cap and `overflow-y: scroll` has nothing to clip against — the sidebar expands to full content height instead of scrolling. `flex: 1` makes the sidebar fill whatever space remains below the PatternLock; `min-height: 0` overrides the flex default and lets the scroll container actually constrain its content.

**`PatternLockSizer` (new styled-component):** wraps the PatternLock and provides explicit pixel dimensions (`500px × 500px` desktop, `calc(100vw - 32px) × calc(100vw - 32px)` mobile). The PatternLock receives `containerSize="100%"` so it fills the sizer precisely. This avoids passing a viewport-unit string to the component and keeps the sizing logic in CSS.

**Breakpoint `600px`** chosen to cover all phones (iPhone 14 Pro = 430 px, typical Android ~360–412 px) while leaving tablets (768 px) on the desktop layout.

---

## Trade-offs

- `containerSize` default of `"100%"` means the CSS height is also `"100%"` when neither `width` nor `height` is provided. This differs from the old behavior where height was always set to a pixel value equal to `offsetWidth`. In practice all current usages pass an explicit pixel value so this has no visible impact.

---

### Responsive Two-Column Pattern History Grid

**Decision:** `PatternHistory` now uses CSS Grid with responsive column counts. On XL screens (≥ 1400 px) and XS screens (≤ 600 px), the history renders in a **two-column grid**. On intermediate breakpoints, it remains **single-column**.

**XL behaviour:** `Sidebar` widens from 220 px → 440 px; `MainArea.padding-left` mirrors the change to keep the PatternLock visually centred. `HistoryList` switches to `grid-template-columns: 1fr 1fr`, allowing more patterns visible without scrolling.

**XS behaviour:** `HistoryList` also gets `grid-template-columns: 1fr 1fr`. Pattern cards shrink to 65 % of the normal `entrySize` (via `useMediaQuery("(max-width: 600px)")` in `PatternHistory.tsx`). `FeedbackDot` sizes reduce from 14 px → 10 px, gaps tighten, and `GuessNumber` font shrinks to keep everything readable on small screens.

**`useMediaQuery` hook:** Rewritten to use React 18's `useSyncExternalStore` for correctness and to avoid the ESLint `react-hooks/set-state-in-effect` violation that the previous `useState`+`useEffect` approach triggered.

**Files changed:**
- `src/components/PatternHistory.styled.tsx` — CSS Grid layout with XS/XL media queries
- `src/components/PatternHistory.tsx` — responsive `entrySize` via `useMediaQuery`
- `src/App.styled.tsx` — XL breakpoint for `Sidebar` (440 px) and `MainArea` padding
- `src/components/FeedbackIndicator.styled.tsx` — smaller dots/gaps on XS
- `src/components/useMediaQuery.ts` — `useSyncExternalStore` implementation

---

### Intermediate-Screen Breathing Room & History Entry Spacing

**Decision:** Added uniform padding (`24px` all sides, with `padding-left: 220px + 24px`) to `MainArea` so the PatternLock has breathing room on intermediate screens (600–1400 px). `PatternLockSizer` gained `max-width: 100%; max-height: 100%` so it shrinks gracefully within the padded area instead of overflowing.

**History entry gap** increased from `12px` → `20px` (desktop) and `6px` → `10px` (XS) to visually separate the pattern lock thumbnail from the feedback indicator dots.

**Rationale:** On intermediate viewports (~700–900 px) the fixed 500 px lock + 220 px sidebar + 220 px counterbalance padding left almost no margin, making dots appear jammed against the container edges. The padding + `max-width`/`max-height` approach keeps the lock centred and ensures consistent whitespace without adding a new breakpoint.

**Files changed:**
- `src/App.styled.tsx` — `MainArea` padding, `PatternLockSizer` max constraints
- `src/components/PatternHistory.styled.tsx` — increased `gap` on `HistoryEntry`

---

### Connector Lines Reposition on Screen Rotation / Resize

**Problem:** When the screen was rotated or the container resized, the `Point` components repositioned correctly (they use CSS percentage-based layout), but the connector lines stayed at their old pixel positions. This caused visible misalignment between dots and lines.

**Root cause:** `onResize` only updated `wrapperPosition` (the wrapper's viewport offset). `containerWidth` and `containerHeight` — used by `getPoints()` to compute the absolute pixel coordinates for connectors — were only set once on mount via a `useEffect([], [])`.

**Fix (two changes in `usePatternLock.ts`):**
1. `onResize` now also calls `setContainerWidth(wrapperRef.current.offsetWidth)` and `setContainerHeight(wrapperRef.current.offsetHeight)`. This triggers the existing effect that recomputes `points` via `getPoints()`, which in turn causes `Connectors` to re-render with correct positions.
2. Replaced the `window.addEventListener("resize", ...)` with a `ResizeObserver` on the wrapper element. `ResizeObserver` is more reliable for detecting element-level size changes — it fires on container resizes that `window.resize` misses (e.g., CSS layout shifts, orientation changes on some mobile browsers).

**Data flow after fix:**
```
ResizeObserver fires → onResize() → setContainerWidth/Height
  → useEffect([containerWidth, containerHeight, ...]) → getPoints() → setPoints
    → Connectors receives new points → lines re-render at correct positions
```

---

### Navbar Redesign with Game Controls

**Decision:** Redesigned the navbar from a simple title+GitHub-link bar into a full game control center with dropdowns, play/reveal flow, help modal, and level/player configuration.

**New components:**
- `Navbar.tsx` — Shell component with layout and props from `App.tsx`. Contains: app icon (Lock), players dropdown, level dropdown, play/reveal button, help icon, GitHub icon.
- `HelpModal.tsx` + `HelpModal.styled.tsx` — react-bootstrap Modal showing game rules and a "Play Now" button.
- `CodeRevealOverlay.tsx` + `CodeRevealOverlay.styled.tsx` — Full-screen overlay that renders the secret code as a disabled `PatternLock` for `REVEAL_DELAY_MS` (3 seconds), then auto-dismisses and resets the game.

**Game state lifted to `App.tsx`:**
- `phase: GamePhase` ("idle" | "playing") — controls whether the PatternLock is interactive and whether dropdowns are disabled.
- `level: Level` ("easy" | "medium" | "hard") — drives `config` via `LEVEL_CONFIGS[level]`.
- `playerCount: PlayerCount` (1–4) — stored for future multiplayer; no gameplay effect yet.
- `revealing: boolean` — drives the code reveal overlay visibility.

**New file `src/game/GameConfig.ts`:** Exports `Level`, `GamePhase`, `PlayerCount`, `GridConfig` types, `LEVEL_CONFIGS` map, label maps, and defaults. Fully tested in `GameConfig.test.ts` (12 tests).

**Play/Reveal flow:**
1. User clicks "Play" → `startGame()` generates a new code, clears history, sets phase to "playing".
2. User clicks "Reveal" → `revealCode()` shows `CodeRevealOverlay` for 3 seconds, then resets to "idle".
3. Dropdowns are disabled during gameplay, re-enabled when idle.

**Navbar center button logic:**
- `phase === Revealing`: shows **Reveal** (EyeOff icon, `outline-secondary`) + **Finish Game** (Feather icon, `outline-danger`) side by side
- `phase === Playing && isRunning`: shows **Give Up** (Eye icon, `outline-danger`)
- `phase === Playing && !isRunning`: nothing

**`onDismissReveal`** (Reveal button / backdrop click on overlay): sets phase→Playing, increments `gameKey`. History is preserved; PatternLock remounts fresh.

**`onFinishGame`** (Finish Game button): regenerates code, clears path/history, sets phase→Playing, increments `gameKey`.

**`CodeRevealOverlay` simplified:** No action buttons. The overlay shows code only; clicking the backdrop calls `onDismissReveal`. Navbar owns all control buttons during Revealing phase.

**`NavbarContainer`** gains `position: relative; z-index: 1100` so it renders above the overlay backdrop (`z-index: 1000`).

**Files changed/added:**
- `src/game/GameConfig.ts` — `GamePhase` union + `ALL_GAME_PHASES` constant
- `src/game/GameConfig.test.ts` — tests for `ALL_GAME_PHASES`
- `src/components/Navbar.tsx` — redesigned with game control props
- `src/components/Navbar.styled.tsx` — new styled components for layout
- `src/components/Navbar.constants.ts` — new constants
- `src/components/Navbar.test.ts` — updated tests
- `src/components/HelpModal.tsx` + `HelpModal.styled.tsx` — help modal
- `src/components/CodeRevealOverlay.tsx` + `CodeRevealOverlay.styled.tsx` — code reveal
- `src/App.tsx` — game state management, wiring

---

### Fix: ResizeObserver Crash on Game Reset

**Problem:** After the code reveal timer fired, `revealCode()` set `code` to `[]`, causing a React re-render cycle. The `ResizeObserver` callback in `usePatternLock.ts` fired during this transition and called `wrapperRef.current.getBoundingClientRect()` on a disconnected/null element, throwing `Cannot read properties of null`.

**Fix (two changes):**
1. `onResize()` in `usePatternLock.ts` now guards against a null or disconnected `wrapperRef.current` — returns `[0, 0]` early if `!el || !el.isConnected`.
2. `revealCode()` in `App.tsx` no longer clears `code`, `path`, and `pathHistory` after the timer. It only sets `phase` back to `"idle"`. The cleanup happens in `startGame()` when the user clicks "Play" again, which avoids the problematic empty-code render.

---

### Removed "Play Now" from HelpModal

**Decision:** The `HelpModal` footer with the "Play Now" button was removed. The modal now only shows the help content and a close button (via Bootstrap Modal's built-in `closeButton`). The `onPlay` prop was removed from `HelpModalProps`.

**Rationale:** The Play button in the navbar already serves this purpose; duplicating it in the help modal was confusing.

---

### Cyborg Theme Preservation

**Decision:** Removed custom styled-components that overrode the Cyborg Bootswatch theme's native styles. Specifically:
- `IconButton` (custom border/color/hover) → replaced with native Bootstrap `<Button variant="outline-primary|outline-danger" size="sm">`.
- `StyledDropdownToggle` → replaced with native `<Dropdown.Toggle variant="outline-secondary" size="sm">`.
- `StyledDropdownItem` → replaced with native `<Dropdown.Item>`.
- `HelpModal.styled.tsx` — removed `font-size` and `color` overrides on `li` elements.
- `NavbarContainer` — removed hardcoded `background: #0d0d0d`; the theme provides the background.

**Rationale:** The Cyborg theme already provides dark-mode-appropriate colors, hover effects, and sizing for all Bootstrap components. Custom overrides created visual inconsistencies and made the app fight the theme rather than embrace it.

**Kept custom styles for:**
- `GitHubLink` and `HelpButton` — these are not Bootstrap components; they're icon-only elements that need hover/transition effects matching the GitHub icon style.
- `AppIconImage` — sizing the app icon image.
- Layout containers (`NavbarRow`, `NavbarLeft`, `NavbarCenter`, `NavbarRight`) — pure flexbox layout, not visual overrides.

---

### App Icon from `public/icon.png`

**Decision:** Replaced the feather `<Lock>` icon in the navbar with an `<img>` tag pointing to `/icon.png` (from `public/icon.png`). Sized at 28px height on desktop, 22px on mobile via `AppIconImage` styled-component.

---

### App Icon is a No-Op

**Decision:** Changed `AppIconLink` from `styled.a` (with `href="/"`) to `styled.span`. The icon no longer acts as a navigation link — clicking it does nothing.

**Rationale:** Navigating to `/` caused a full page refresh, restarting the game unexpectedly. Since this is a single-page app with no routing, there's no meaningful "home" to navigate to.

---

### Help Modal Rich Content

**Decision:** Replaced the plain-text `HELP_CONTENT` string array (from `Navbar.constants.ts`) with inline JSX in `HelpModal.tsx` using `<strong>`, `<em>`, and colored bullet characters for Bulls/Cows/Miss. The `HELP_CONTENT` export was removed from constants.

**Rationale:** Rich formatting (bold keywords, italic conditions, colored dot indicators matching the feedback colors) makes the rules scannable. JSX content can't live in a `.ts` constants file, so it moved to the component.

---

### Game Reinitialization After Reveal

**Decision:** `revealCode()` now clears `code`, `path`, and `pathHistory` when the reveal timer expires (in addition to setting `phase` back to `"idle"`).

**Rationale:** Previously, old feedback entries remained visible in the sidebar after the reveal overlay dismissed. Users expected a fresh slate. The `onResize` guard in `usePatternLock.ts` (`if (!el || !el.isConnected) return [0, 0]`) prevents the `getBoundingClientRect` crash that previously occurred when code was set to `[]`.

---

### Enum-Based State (GamePhase, Level, PlayerCount)

**Decision:** Replaced raw string/number literal union types with TypeScript `enum` for all game-state discriminators.

| Old type | New enum | Values |
|---|---|---|
| `type GamePhase = "idle" \| "playing" \| "revealing" \| "game-over"` | `enum GamePhase` | `Idle`, `Playing`, `Revealing`, `GameOver` |
| `type Level = "easy" \| "medium" \| "hard"` | `enum Level` | `Easy`, `Medium`, `Hard` |
| `type PlayerCount = 1 \| 2 \| 3 \| 4` | `enum PlayerCount` | `One=1`, `Two=2`, `Three=3`, `Four=4` |

String enums (`GamePhase`, `Level`) preserve their string values at runtime so existing `Record<Level, ...>` lookups, `toEqual(["easy", ...])` comparisons, and styled-component switch logic all continue to work unchanged.

**`ALL_GAME_PHASES`, `ALL_LEVELS`, `ALL_PLAYER_COUNTS`** updated to reference enum members.

---

### "Give Up" Button (was "Reveal")

**Decision:** Renamed the in-game action button from "Reveal" to "Give Up".

**Rationale:** "Give Up" clearly communicates that pressing the button ends the current game and surrenders, which is the actual consequence. "Reveal" only described the effect (seeing the code) without conveying the finality.

---

### `dismissReveal` Increments `gameKey`

**Problem:** After clicking Dismiss, the main PatternLock could end up in a stale `usePatternLock` state (zero container dimensions) because the `ResizeObserver` fires during the overlay-close transition and the mount-only dimension effects had not re-run. This caused the PatternLock to render with an invisible/empty grid.

**Fix:** `dismissReveal()` now also increments `gameKey`, forcing the main PatternLock to remount with fresh hook state. This mirrors the existing pattern documented for `startGame()`.

---

### `finishGame` — Return to Idle From Overlay

**Decision:** Added a separate `finishGame()` callback (called by the overlay "Finish" button) that resets all state and returns to `GamePhase.Idle`. This is distinct from `startGame()` which goes directly to `GamePhase.Playing`.

| Action | Phase after | Code/History | gameKey |
|---|---|---|---|
| Dismiss | `GameOver` | preserved | +1 |
| Finish (overlay) | `Idle` | cleared | +1 |
| New Game (navbar) | `Playing` | cleared | +1 |

**Rationale:** "Finish" ends the game session and lets the user reconfigure (choose level/players) before their next game. "New Game" from the navbar is a quick shortcut to jump straight into a fresh game.

**Overlay button rename:** "New Game" → "Finish" (better conveys that the session is over).

---

### Dismiss vs New Game on Code Reveal Overlay

**Decision:** Replaced the 3-second auto-dismiss timer with two explicit buttons — **Dismiss** and **New Game** — on `CodeRevealOverlay`.

**Behaviour:**
- **Dismiss** → `phase = "game-over"`: overlay closes, history and disabled PatternLock remain visible, dropdowns stay locked. Navbar center shows "New Game" button.
- **New Game** (overlay or navbar) → `startGame()`: full reset (new code, clear history, `phase = "playing"`).

**`GamePhase` expanded:** `"idle" | "playing" | "revealing" | "game-over"`. `"revealing"` replaces the old `revealing: boolean` flag; `"game-over"` is the new post-dismiss state.

**`REVEAL_DELAY_MS` removed:** No longer used; deleted from `Navbar.constants.ts` and its test.

**Navbar `configDisabled`:** Dropdowns are disabled whenever `phase !== "idle"` (was only during `"playing"`). Center button renders via `centerButton()` helper that returns Play / Reveal / New Game depending on the current phase.

**Files changed:**
- `src/game/GameConfig.ts` — `GamePhase` union + `ALL_GAME_PHASES` constant
- `src/game/GameConfig.test.ts` — tests for `ALL_GAME_PHASES`
- `src/components/Navbar.tsx` — `centerButton()` helper, `configDisabled` flag
- `src/components/CodeRevealOverlay.tsx` — two Bootstrap buttons
- `src/components/CodeRevealOverlay.styled.tsx` — `RevealActions` flex container
- `src/App.tsx` — game state management, wiring

---

### gameKey — Forced PatternLock Remount on Game Reset

**Problem:** After the code reveal overlay dismissed, the PatternLock disappeared entirely — no dots visible, just the navbar. The PatternLock component was the same React instance across game resets (never unmounted), but the `usePatternLock` hook's internal state (container dimensions, points array, ResizeObserver) could become stale or out of sync when the game state changed underneath it.

**Root cause:** `usePatternLock` initialises `containerWidth`/`containerHeight` and the `ResizeObserver` in a `useEffect([], [])` — mount-only effects. When the game reset (code→`[]`, phase→`"idle"`) the component re-rendered without remounting, so those effects never re-ran. If the ResizeObserver callback fired during the transition and hit the `!el.isConnected` guard, subsequent renders could leave the hook with stale zero-dimension state, causing points to compute at invisible positions.

**Fix — `gameKey` state counter:**
- `App.tsx` maintains a `gameKey: number` state, incremented in both `startGame()` and the `revealCode()` timer callback.
- The main `<PatternLock key={gameKey} ... />` receives `gameKey` as its React `key`. When the key changes, React unmounts the old instance and mounts a fresh one, guaranteeing all `useEffect([], [])` hooks re-run (container measurement, ResizeObserver setup, points computation).

**Why a key instead of fixing the hook:** The hook's mount-only effects are correct for the normal resize/interaction lifecycle. Trying to make them re-run on arbitrary state changes would add complexity and break the separation between "hook initialisation" and "prop-driven updates". A key change is the idiomatic React way to force a clean remount.

**Files changed:**
- `src/App.tsx` — added `gameKey` state, passed as `key` to `PatternLock`, incremented in `startGame` and `revealCode`.

---

### GameContext Refactor — Centralized Game State

**Decision:** Moved all game state and logic from `App.tsx` into a new `src/context/GameContext.tsx` using React Context API. `App.tsx` is now a pure layout component.

**`GamePhase` simplified:** Removed `Idle` and `GameOver` phases. Only two phases remain: `Playing` and `Revealing`. The previous phase states are replaced by derived values:
- `isRunning`: `pathHistory.length > 0 || path.length > 0` — whether the user has made at least one move.
- `configDisabled` (local to `Navbar`): `isRunning || phase === Revealing` — whether level/player dropdowns are locked.

**Auto-start behaviour:** The game starts immediately when the user draws their first dot — no explicit Play button. Code is generated:
- On initial app load (lazy `useState` initializer)
- After "Finish Game" (full reset with new code)
- When the level changes (new grid config → new code)

**Navbar center button logic:**
- `phase === Revealing`: shows **Reveal** (EyeOff icon, `outline-secondary`) + **Finish Game** (Feather icon, `outline-danger`) side by side
- `phase === Playing && isRunning`: shows **Give Up** (Eye icon, `outline-danger`)
- `phase === Playing && !isRunning`: nothing

**`onDismissReveal`** (Reveal button / backdrop click on overlay): sets phase→Playing, increments `gameKey`. History is preserved; PatternLock remounts fresh.

**`onFinishGame`** (Finish Game button): regenerates code, clears path/history, sets phase→Playing, increments `gameKey`.

**`CodeRevealOverlay` simplified:** No action buttons. The overlay shows code only; clicking the backdrop calls `onDismissReveal`. Navbar owns all control buttons during Revealing phase.

**Files changed/added:**
- `src/game/GameConfig.ts` — `GamePhase` union + `ALL_GAME_PHASES` constant
- `src/game/GameConfig.test.ts` — tests for `ALL_GAME_PHASES`
- `src/components/Navbar.tsx` — redesigned with game control props
- `src/components/Navbar.styled.tsx` — new styled components for layout
- `src/components/Navbar.constants.ts` — new constants
- `src/components/Navbar.test.ts` — updated tests
- `src/components/HelpModal.tsx` + `HelpModal.styled.tsx` — help modal
- `src/components/CodeRevealOverlay.tsx` + `CodeRevealOverlay.styled.tsx` — code reveal
- `src/App.tsx` — game state management, wiring

---

### Centralized Feedback Theme & Accessible Shapes

**Decision:** Extracted hardcoded bull/cow/miss colors from `FeedbackIndicator.utils.ts` and `HelpModal.tsx` into a central theme file `src/theme/feedbackTheme.ts`. Replaced colored circles with color-coded **shape symbols** for colorblind accessibility.

**Shape convention:**
- `+` (plus) — bull (correct dot, correct position) — green `#22c55e`
- `−` (minus/U+2212) — cow (correct dot, wrong position) — yellow `#eab308`
- `○` (circle/U+25CB) — miss (dot not in code) — grey `#6b7280`

**Rationale:** Using distinct shapes in addition to colors ensures colorblind users can differentiate feedback types. The central theme file (`FEEDBACK_THEME`) provides a single source of truth for colors, symbols, and labels — eliminating scattered hardcoded hex values and making future theme changes trivial.

**Theme structure:**
```typescript
interface FeedbackEntry { color: string; symbol: string; label: string; }
FEEDBACK_THEME = { bull, cow, miss } — each a FeedbackEntry
feedbackEntry(index, bulls, cows) — returns the correct entry for a position
```

**Files changed:**
- `src/theme/feedbackTheme.ts` — new central theme file
- `src/theme/feedbackTheme.test.ts` — tests for theme constants and feedbackEntry
- `src/components/FeedbackIndicator.utils.ts` — re-exports from theme; keeps deprecated `COLORS`/`dotColor`
- `src/components/FeedbackIndicator.tsx` — uses `feedbackEntry`, renders `FeedbackShape` with symbol children
- `src/components/FeedbackIndicator.styled.tsx` — `FeedbackDot` → `FeedbackShape` (text-based, no border-radius)
- `src/components/FeedbackIndicator.test.ts` — extended with `feedbackEntry` and `FEEDBACK_THEME` tests
- `src/components/HelpModal.tsx` — imports `FEEDBACK_THEME` instead of hardcoded hex values; shows shape symbols

---

### Centralized Breakpoints (`src/theme/breakpoints.ts`)

**Decision:** Extracted all hardcoded media-query breakpoint strings (`@media (max-width: 600px)`, `@media (min-width: 1400px)`) from 5 styled-component files into a single `src/theme/breakpoints.ts` module.

**Problem:** The same breakpoint values were redefined as local constants (`const MOBILE`, `const XS`, `const XL`) in `App.styled.tsx`, `Navbar.styled.tsx`, `Footer.styled.tsx`, `PatternHistory.styled.tsx`, and `FeedbackIndicator.styled.tsx`. The `useMediaQuery` call in `PatternHistory.tsx` also had a hardcoded `"(max-width: 600px)"` string. Changing a breakpoint would require updating 7 locations.

**Exports (three levels of abstraction):**
- `BREAKPOINT_VALUES` — raw pixel numbers (`{ mobile: 600, xl: 1400 }`), for tests or programmatic use.
- `BREAKPOINT_QUERIES` — bare query strings without `@media` prefix (`"(max-width: 600px)"`), for `useMediaQuery()` / `window.matchMedia()`.
- `BREAKPOINTS` — full `@media (…)` strings (`"@media (max-width: 600px)"`), for styled-components template literals.

**Files changed:**
- `src/theme/breakpoints.ts` — new central breakpoints file
- `src/theme/breakpoints.test.ts` — tests for all three export levels
- `src/App.styled.tsx` — imports `BREAKPOINTS` instead of local `MOBILE`/`XL`
- `src/components/Navbar.styled.tsx` — imports `BREAKPOINTS` instead of local `MOBILE`
- `src/components/Footer.styled.tsx` — imports `BREAKPOINTS` instead of local `MOBILE`
- `src/components/PatternHistory.styled.tsx` — imports `BREAKPOINTS` instead of local `XS`/`XL`
- `src/components/FeedbackIndicator.styled.tsx` — imports `BREAKPOINTS` instead of local `XS`
- `src/components/PatternHistory.tsx` — uses `BREAKPOINT_QUERIES.mobile` instead of hardcoded string
- `src/components/useMediaQuery.ts` — updated JSDoc example to reference `BREAKPOINT_QUERIES`

---

### CodeRevealOverlay → react-bootstrap Modal

**Decision:** Replaced the custom `RevealBackdrop`/`RevealCard`/`RevealTitle` overlay with a standard `react-bootstrap Modal`, matching the existing pattern used by `StatsModal` and `HelpModal`.

**Rationale:** The custom overlay duplicated modal behaviour (backdrop click-to-close, fade animation, centering, z-index management) that Bootstrap's Modal already provides with better accessibility (focus trapping, ARIA attributes, ESC key handling). The `NavbarContainer` z-index hack (`z-index: 1100`) was only needed to render above the custom overlay's `z-index: 1000` — Bootstrap modals use portals with their own z-index, making the hack unnecessary.

**Changes:**
- `src/components/CodeRevealOverlay.tsx` — uses `<Modal>` with `show`/`onHide` from `useGameContext()`
- `src/components/CodeRevealOverlay.styled.tsx` — removed `RevealBackdrop`, `RevealCard`, `RevealTitle`, `keyframes fadeIn`; kept `RevealStats`/`RevealStat` for stat row layout
- `src/components/Navbar.styled.tsx` — removed `position: relative; z-index: 1100`

---

### AI Inference Module (`src/ai/`)

**Decision:** Split the monolithic 403-line `src/ai/summary-buider.ts` (note: original had filename typo) into 5 focused files, removing duplicated logic and reusing existing modules.

**Duplications removed:**
- `Board` class → replaced with `GridConfig` from `GameConfig.ts` + `dotCount()` from new `src/math/grid.ts`
- `Geometry.intermediates()` → replaced with `getPointsInTheMiddle()` from `math.ts`
- `PatternValidator` → inlined into `CandidateGenerator.ts` using `getPointsInTheMiddle()`
- `FeedbackEngine.compute()` → replaced with `GuessValidator.validate()` from `GuessValidator.ts`
- Local `Feedback` type → reuses `Feedback` from `GuessValidator.ts`

**New file structure:**
- `src/ai/types.ts` — `DotId`, `Path`, `Observation`, `Progress`, `InferenceSummary` (imports `Feedback` from GuessValidator)
- `src/ai/CandidateGenerator.ts` — `generateCandidates(config)` — DFS enumeration of all valid paths
- `src/ai/CandidateFilter.ts` — `filterCandidates(candidates, observation)` — filters via GuessValidator
- `src/ai/SummaryBuilder.ts` — `buildSummary(config, candidates, initialCount)` — domains, mustHave, mustNotHave, progress
- `src/ai/InferenceEngine.ts` — `InferenceEngine` class orchestrating generation → filtering → summary
- `src/math/grid.ts` — `toCoord()`, `toId()`, `dotCount()` shared grid coordinate utilities

**Design principles:**
- Functions over classes where possible (CandidateGenerator, CandidateFilter, SummaryBuilder are all exported functions, not classes)
- Only `InferenceEngine` is a class — it holds state (initial candidates, config) across multiple `applyObservation` calls
- All AI modules are pure TypeScript with no React dependency
- Each file is under 90 lines (well within the 200-line limit)

**Tests:** `CandidateGenerator.test.ts` (7 tests), `CandidateFilter.test.ts` (5 tests), `SummaryBuilder.test.ts` (13 tests), `InferenceEngine.test.ts` (5 tests), `grid.test.ts` (5 tests)

---

### AI Progress Percentage in Footer

**Decision:** Added a real-time AI progress percentage to the far left of the footer, showing how close the AI inference engine is to narrowing down the secret code.

**Display:** An `Unlock` icon (from react-feather) followed by `X%` on the far left side of the footer. The percentage represents `reducedPercent` from the AI's progress — how much of the initial candidate space has been eliminated (0% = no guesses yet, ~100% = only 1 candidate remains).

**Implementation:**
- `src/components/useInferenceEngine.ts` — custom React hook that wraps `InferenceEngine`. Uses `useMemo` (not `useState`+`useEffect`) to avoid the `react-hooks/set-state-in-effect` ESLint error. The engine is memoized on `gridConfig` and recomputed when `pathHistory` changes. Returns `{ percent, candidates }`.
- `src/components/Footer.tsx` — calls `useInferenceEngine(gridConfig, code, pathHistory)` and renders the progress stat with the `Unlock` icon.
- `src/components/Footer.styled.tsx` — added `moveUpAndFadeOut` keyframe + `ConfidenceDelta` styled component; added `position: relative` to `AiProgressStat`
- `src/components/Footer.tsx` — added `showDelta`/`deltaKey` state, effect to trigger on `pathHistory.length`, and `ConfidenceDelta` rendering
- `src/components/useInferenceEngine.test.ts` — added `percentDelta` tests + `formatPercentDelta` tests
- `src/components/Footer.test.ts` — added `formatPercentDelta` tests

---

### AI Indicator Color Feedback (Three-Tier Guess Quality)

**Decision:** The AI progress indicator in the footer changes color based on a **relative** assessment of each guess's quality, using three tiers:
- **Green** (`var(--bs-success)`) — guess was good: eliminated ≥ 50% of the remaining candidate space
- **Yellow** (`var(--bs-warning)`) — guess was mediocre: eliminated some candidates, but < 50% of the remaining space
- **Red** (`var(--bs-danger)`) — guess was bad: no candidates eliminated (or candidates increased)
- **Green** also shown permanently when `isSolved = true` (AI reaches 100%), but active flashes temporarily override it
- All color flashes last 2.5 seconds, with `transition: color 0.4s ease`

**Relative evaluation formula:** `relativeReduction = (prevCandidates - currentCandidates) / prevCandidates`. This ensures the feedback is proportional — going from 0% → 50% is rated the same as from 98% → 99%, since both represent a 50% reduction of the remaining candidate space. Thresholds: `≤ 0` = Bad, `< 0.5` = Mediocre, `≥ 0.5` = Good.

**First-guess classification:** Previously, the first guess was always `Neutral` (no flash) because classification only ran when `pathHistory.length >= 2`. Now the first guess uses `initialCandidateCount` from the inference engine as the baseline. A first guess typically eliminates a large portion of candidates, so it correctly flashes green.

**Flash priority over isSolved:** Active flash quality takes precedence over the permanent `isSolved` green. This ensures that once the AI reaches 100%, any subsequent non-winning guess correctly flashes red (since no guess can further reduce an already-minimal candidate count), rather than staying permanently green.

**Color priority in `getAiIndicatorColor`:** `flashQuality !== Neutral` → use flash color; else if `isSolved` → success green; else → undefined (default).

**Files changed:**
- `src/components/useInferenceEngine.ts` — `GuessQuality` enum, `classifyGuessQuality` function, first guess uses `initialCandidateCount`
- `src/components/Footer.tsx` — `flashQuality: GuessQuality` state with 2.5s timer
- `src/components/Footer.utils.ts` — `getAiIndicatorColor` with flash-first priority
- `src/components/useInferenceEngine.test.ts` — updated tests for first-guess classification and flash priority

---

### Sidebar Title Outside Scroll Area

**Decision:** Extracted the "Guess History" title from `PatternHistory` into a standalone `HistoryTitle` component, rendered in a fixed `SidebarHeader` above the scrollable `SidebarContent`.

**Problem:** The title scrolled away with the guess history, making it invisible after a few guesses.

**Fix — split Sidebar into header + scrollable content:**
```
Sidebar (flex-col)
├── SidebarHeader (flex-shrink: 0, padding)
│   └── HistoryTitle (icon + "Guess History")
└── SidebarContent (flex: 1, min-height: 0, overflow-y: scroll)
    └── PatternHistory (HistoryList only, no title)
```

**`HistoryTitle`** — extracted from inline JSX in `PatternHistory.tsx` into a named export component. Uses `HistoryTitleContainer` styled `h6` from `PatternHistory.styled.tsx`. Removed bottom margin (now handled by `SidebarHeader` padding).

**`SidebarHeader` / `SidebarContent`** — new styled components in `App.styled.tsx`. Scrollbar styling moved from `Sidebar` to `SidebarContent`.

**Files changed:**
- `src/App.styled.tsx` — `Sidebar` split into `Sidebar` + `SidebarHeader` + `SidebarContent`
- `src/App.tsx` — imports `HistoryTitle`, wraps in `SidebarHeader`/`SidebarContent`
- `src/components/PatternHistory.tsx` — exports `HistoryTitle` component, removes title from render
- `src/components/PatternHistory.styled.tsx` — renamed `HistoryTitle` → `HistoryTitleContainer`

---

### Build to `docs/` + CircleCI Pipeline

**Decision:** Configured the production build to output to `docs/` for GitHub Pages hosting, and added a CircleCI pipeline with multiple quality-gate jobs.

**Vite config changes:**
- `base: '/locker-hacker/'` — sets the correct asset prefix for GitHub Pages (`https://virgs.github.io/locker-hacker/`)
- `build.outDir: 'docs'` — outputs the build to `docs/` instead of the default `dist/`

**ESLint ignores:** Added `docs` and `coverage` to the ignore list in `eslint.config.js` — both are generated directories that should never be linted.

**New script:** `test:coverage` — runs Jest with `--coverage` flag, producing an lcov report stored as a CircleCI artifact.

**CircleCI pipeline (`.circleci/config.yml`):**
- Uses `cimg/node:22.14` (Node 22 LTS) as the executor
- Caches `node_modules` keyed on `pnpm-lock.yaml` checksum
- Workspace persistence: `install` persists the full checkout+dependencies; downstream jobs attach it
- Jobs: `install` → `lint` + `test` + `coverage` (parallel) → `build` → `deploy` (main only)
- Deploy job commits the `docs/` folder back to `main` with `[skip ci]` in the commit message to avoid infinite loops

**Files:**
- `vite.config.ts` — `base` and `build.outDir` settings
- `eslint.config.js` — `docs` and `coverage` in ignores
- `package.json` — added `test:coverage` script
- `.circleci/config.yml` — full pipeline definition
- `README.md` — updated Development and CI/CD sections

---

### Tooltips on All Interactive Elements

**Decision:** Added react-bootstrap `OverlayTrigger` + `Tooltip` to every button and interactive element in the UI. A reusable `Tip` wrapper component keeps the implementation DRY.

**`Tip` component (`src/components/Tip.tsx`):** A thin wrapper around `OverlayTrigger` that accepts `text`, optional `placement` (default `"bottom"`), and a single child element. Delay values (`show: 400ms`, `hide: 150ms`) are extracted into `Tip.constants.ts` for testability.

**Tooltipped elements:**

| Location | Element | Tooltip text | Placement |
|---|---|---|---|
| Navbar | App icon | "Game stats" | bottom |
| Navbar | Players dropdown | "Number of players" | bottom |
| Navbar | Level dropdown | "Difficulty level" | bottom |
| Navbar | Give Up button | "Give up and reveal the code" | bottom |
| Navbar | Reveal button | "Show the secret code" | bottom |
| Navbar | Finish button | "Start a new game" | bottom |
| Navbar | Help icon | "How to play" | bottom |
| Navbar | GitHub icon | "View source on GitHub" | bottom |
| Footer | AI progress | "AI confidence" | top |
| Footer | Code length | "Code length" | top |
| Footer | Level | "Difficulty level" | top |
| Footer | Elapsed time | "Elapsed time" | top |

**Files:**
- `src/components/Tip.tsx` — reusable tooltip wrapper
- `src/components/Tip.constants.ts` — `TOOLTIP_DELAY` constant
- `src/components/Tip.test.ts` — 3 tests for delay constants
- `src/components/Navbar.tsx` — wrapped 8 interactive elements with `Tip`
- `src/components/Footer.tsx` — wrapped 4 stats with `Tip` (placement `"top"`)

---

### HelpModal Worked Examples

**Decision:** Added two worked examples to the "How to Play" modal using letter sequences (A, B, C, D…) for the secret and guess, with colored feedback shapes.

**Examples:**
1. Secret `A B C D`, Guess `A B E F` → `+ + ○ ○` — A, B in correct position; E, F not in code
2. Secret `A B C D`, Guess `C D E A` → `− − − ○` — C, D, A in code but wrong position; E not in code

**Feedback legend updated:** "Green/Yellow/Gray" labels → "Bull/Cow/Miss" to match game terminology.

**New styled components:** `ExampleCaption` (section heading) and `ExampleTable` (minimal table with alternating row shading) added to `HelpModal.styled.tsx`.

**`FeedbackCell` helper:** Inline component that renders a sequence of colored feedback symbols in a `<td>`.

**Files:**
- `src/components/HelpModal.tsx` — added `FeedbackCell` helper + examples table
- `src/components/HelpModal.styled.tsx` — added `ExampleCaption`, `ExampleTable`

---

### AI Console Log at 100% Confidence

**Decision:** When the inference engine reaches exactly 1 remaining candidate (`isSolved = true`), the predicted code is logged to the browser console: `🔓 AI is 100% confident. Predicted code: [3, 7, 11, 0, 5]`.

**Rationale:** Provides a way to verify the AI's correctness. The user reported skepticism that 2 guesses could solve a 4×4 grid — the console output lets them verify. Hard mode (4×4, length 5) has 154,680 valid candidates, but spatial constraints (no-skip rule, path connectivity) combined with bulls/cows feedback can eliminate them very quickly.

**Files:**
- `src/components/useInferenceEngine.ts` — added `console.log` when `isSolved && summary.candidates.length === 1`

---

### Small Screen (Mobile) Responsive Adjustments

**Decision:** On mobile screens (≤600px, matching Bootstrap xs breakpoint via `BREAKPOINT_QUERIES.mobile`), apply three condensed-layout changes:

1. **Stats table:** Hide header text labels, keeping only the icons (e.g., the clock icon remains, but "Time avg" text is hidden).
2. **Footer level label:** Show abbreviated single-letter labels (E/M/H) instead of full words (Easy/Medium/Hard).
3. **Footer player label:** Show only the player icon + number (e.g., `👤 2`) instead of "Player 2".

**Rationale:** On xs screens the footer and stats modal were cramped. Abbreviating text while preserving icons keeps the UI readable without horizontal overflow. The `LEVEL_LABELS_SHORT` map centralizes short labels in `GameConfig.ts` alongside `LEVEL_LABELS` for consistency.

**Files:**
- `src/game/GameConfig.ts` — added `LEVEL_LABELS_SHORT` map
- `src/game/GameConfig.test.ts` — added tests for `LEVEL_LABELS_SHORT`
- `src/components/Footer.tsx` — uses `useMediaQuery` to switch between full/short labels and full/short player text
- `src/components/StatsModal.tsx` — uses `useMediaQuery` to conditionally hide header text and use short level labels

---

### TurnAnnouncement Refactor to React Bootstrap Modal

**Decision:** Replaced the custom overlay implementation (`TurnBackdrop`, `TurnCard`, `DismissButton`) with `react-bootstrap/Modal`, consistent with how `StatsModal`, `HelpModal`, and `CodeRevealOverlay` work.

**Rationale:** The custom overlay duplicated modal behaviour (backdrop, dismiss, centering, animation) that React Bootstrap already provides. Reusing the same `<Modal>` component ensures consistent styling, accessibility (focus trap, Escape key), and animation across the app. Also uses `formatTurnMessage` from `TurnAnnouncement.utils.ts` for the title text.

**Behaviour preserved:**
- Auto-dismiss after 2 seconds via `setTimeout`
- Click backdrop or close button to dismiss
- Player-colored name in the title
- Only renders in multiplayer mode

**Files:**
- `src/components/TurnAnnouncement.tsx` — rewrote to use `react-bootstrap/Modal`
- `src/components/TurnAnnouncement.styled.tsx` — removed `TurnBackdrop`, `TurnCard`, `TurnMessage`, `DismissButton`; kept `TurnPlayerName`

---

### Animated AI Confidence Delta on Guess

**Decision:** After each guess, display a floating animated text (e.g., "+12.3%" or "-3.0%") near the unlock icon in the footer, showing how much the AI confidence changed from the previous guess.

**Implementation:**
- Added `percentDelta` field to `AiProgress` interface — computed as `currentPercent - previousPercent` in the `useInferenceEngine` hook.
- Added `formatPercentDelta` utility in `Footer.utils.ts` — formats delta with sign prefix (e.g., "+5.0%", "-3.2%").
- Added `ConfidenceDelta` styled component with `moveUpAndFadeOut` keyframe animation: starts at normal size/opacity, then floats up 30px, shifts right 10px, scales to 2.5×, and fades to 0 over 2 seconds.
- In `Footer.tsx`, the delta element is shown for 2 seconds after each guess, using a `deltaKey` counter to re-trigger the CSS animation on each new guess. Color is green (`--bs-success`) for positive deltas, red (`--bs-danger`) for negative.

**Files:**
- `src/components/useInferenceEngine.ts` — added `percentDelta` to `AiProgress` interface and computation
- `src/components/Footer.utils.ts` — added `formatPercentDelta` function
- `src/components/Footer.styled.tsx` — added `moveUpAndFadeOut` keyframe + `ConfidenceDelta` styled component; added `position: relative` to `AiProgressStat`
- `src/components/Footer.tsx` — added `showDelta`/`deltaKey` state, effect to trigger on `pathHistory.length`, and `ConfidenceDelta` rendering
- `src/components/useInferenceEngine.test.ts` — added `percentDelta` tests + `formatPercentDelta` tests
- `src/components/Footer.test.ts` — added `formatPercentDelta` tests
