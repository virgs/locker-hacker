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
- `src/components/CodeRevealOverlay.tsx` — `onDismiss`/`onNewGame` props, two Bootstrap buttons
- `src/components/CodeRevealOverlay.styled.tsx` — `RevealActions` flex container
- `src/App.tsx` — game state management, wiring

---

### gameKey — Forced PatternLock Remount on Game Reset

**Problem:** After the code reveal overlay dismissed, the PatternLock disappeared entirely — no dots visible, just the navbar. The PatternLock component was the same React instance across game resets (never unmounted), but the `usePatternLock` hook's internal state (container dimensions, points array, ResizeObserver) could become stale or out of sync when the game state changed underneath it.

**Root cause:** `usePatternLock` initialises `containerWidth`/`containerHeight` and the `ResizeObserver` in `useEffect([], [])` — mount-only effects. When the game reset (code→`[]`, phase→`"idle"`) the component re-rendered without remounting, so those effects never re-ran. If the ResizeObserver callback fired during the transition and hit the `!el.isConnected` guard, subsequent renders could leave the hook with stale zero-dimension state, causing points to compute at invisible positions.

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

**`NavbarContainer`** gains `position: relative; z-index: 1100` so it renders above the overlay backdrop (`z-index: 1000`).

**Files changed/added:**
- `src/context/GameContext.tsx` — new: `GameContextValue`, `GameProvider`, `useGameContext`
- `src/context/GameContext.test.ts` — new: basic tests for defaults and phases
- `src/main.tsx` — wraps `<App>` with `<GameProvider>`
- `src/App.tsx` — layout-only; reads from `useGameContext()`
- `src/game/GameConfig.ts` — removed `Idle`/`GameOver` from `GamePhase`, updated `ALL_GAME_PHASES`
- `src/game/GameConfig.test.ts` — updated `ALL_GAME_PHASES` test
- `src/components/Navbar.tsx` — no props; consumes context; new center button logic
- `src/components/Navbar.styled.tsx` — `NavbarContainer` z-index 1100; `NavbarCenter` gap 8px
- `src/components/PatternHistory.tsx` — reads `pathHistory`/`code`/`gridConfig` from context
- `src/components/CodeRevealOverlay.tsx` — reads from context; no action buttons; backdrop click
- `src/components/CodeRevealOverlay.styled.tsx` — removed `RevealActions`

---

---

### Implicit Dot Pop Animation

**Problem:** When `allowJumping=false` and the user draws from dot A to dot C, intermediate dot B is silently inserted into the path by `checkCollision`. Only the final dot (C) received the `pop` animation (class `.active`), making the intermediate insertion invisible.

**Fix:** Added `flashingPoints: Set<number>` state and `flashTimerRef` to `usePatternLock`. When `checkCollision` inserts implicit dots (`implicitDots`), they are added to `flashingPoints` for 350ms, then cleared. `PatternLock.tsx` propagates `flashingPoints` to the `pop` prop:
```tsx
pop={!noPop && ((isMouseDown && path[path.length - 1] === i) || flashingPoints.has(i))}
```
A cleanup `useEffect` clears the timer on unmount. `flashingPoints` is included in `UsePatternLockResult`.

---

### Reveal Modal Once Per Game + Persistent Reveal/Finish Buttons

**Problem:** After clicking "Give Up" and dismissing the overlay, the user could click "Give Up" again to re-enter the Revealing phase and see the code again. The intent is that after giving up, the "Reveal"/"Finish" buttons stay in the navbar permanently.

**Fix:** Separated modal visibility from phase:
- `phase: Playing | Revealing` — `Revealing` means the user has given up (PatternLock disabled).
- `showRevealModal: boolean` — controls overlay visibility independently.

| Action | `phase` | `showRevealModal` |
|---|---|---|
| Give Up | → Revealing | → true |
| "Reveal" button / backdrop click | unchanged | toggled |
| "Finish Game" | → Playing | → false |

`onDismissReveal` removed; replaced with `onToggleRevealModal` (toggled by Reveal button and overlay backdrop). `GameContextValue` updated accordingly.

---

### Icons-Only Navbar on Small Screens + Truly Centered Center Buttons

**Icons-only on mobile (≤ 600 px):** Added `ButtonLabel` styled-component that hides (`display: none`) on mobile. All text labels in dropdown toggles and center action buttons are wrapped in `<ButtonLabel className="ms-1">`. Icons have no right margin (`me-1` removed from icon elements); margin comes from `ms-1` on the `ButtonLabel` so it disappears with the text on mobile.

**Always-centered center buttons:** `NavbarCenter` changed from an in-flow flex item to `position: absolute; left: 50%; transform: translateX(-50%); z-index: 1`. `NavbarRow` gains `position: relative` as the containing block. This guarantees the center buttons are always at exactly 50% of the navbar width regardless of the widths of `NavbarLeft` and `NavbarRight`.

**Files changed:**
- `src/components/usePatternLock.ts` — `flashingPoints` state + `flashTimerRef` + cleanup
- `src/components/PatternLock.tsx` — `flashingPoints.has(i)` in `pop` prop
- `src/context/GameContext.tsx` — `showRevealModal` state, `onToggleRevealModal`, updated `onGiveUp`/`onFinishGame`
- `src/components/CodeRevealOverlay.tsx` — uses `showRevealModal` / `onToggleRevealModal`
- `src/components/Navbar.tsx` — `ButtonLabel` wrappers, `onToggleRevealModal`, icon-only on mobile
- `src/components/Navbar.styled.tsx` — `ButtonLabel`, absolute `NavbarCenter`, `position: relative` on `NavbarRow`

---

---

### Win Detection, Victory Modal & Stats System

**Decision:** Added automatic win detection, a victory overlay, persistent game stats with localStorage, and a stats modal accessible from the app icon.

**Win detection (`GameContext.tsx`):**
- `onGuessFinish` now calls `GuessValidator.isSolved(path)` after validating. If solved, sets `winner` to `currentPlayer`, transitions to `GamePhase.Revealing`, and shows the reveal modal.
- `currentPlayer: number` (1-based) tracks whose turn it is; advances `(prev % playerCount) + 1` after each non-winning guess.
- Both `winner` and `currentPlayer` reset to `null`/`1` in `onFinishGame` and `onLevelChange`.

**Victory message (`CodeRevealOverlay.tsx`):**
- When `winner !== null`, title shows "You win!" (single-player) or "Player X wins!" (multiplayer) with an `Award` feather icon.
- When `winner === null` (give-up), title remains "Secret Code".

**Stats persistence (`src/game/StatsService.ts`):**
- `GameRecord` type: `{ level, won, durationSeconds, date }`.
- `LevelStats` type: `{ gamesPlayed, wins, totalSeconds }`.
- `loadRecords()` / `saveRecord()` / `clearRecords()` — localStorage CRUD under key `"locker-hacker-stats"`.
- `computeLevelStats()` / `computeTotalStats()` — aggregation functions.
- `winPercent()` / `avgTimeSeconds()` / `formatStatsTime()` — display helpers (time formatted as `m:ss.d` with deciseconds).
- Fully tested in `StatsService.test.ts` (12 tests).

**Stats recording (`GameContext.tsx`):**
- `onFinishGame` saves a `GameRecord` to localStorage when `playerCount === PlayerCount.One` (single-player only).
- Sets `lastGameRecord` state so the stats modal can show the just-finished game's result.
- Sets `showStatsModal = true` to auto-open the stats modal.

**Stats modal (`StatsModal.tsx` + `StatsModal.styled.tsx`):**
- Bootstrap `Modal` with a table: Level / Win % / Avg Time / Games columns.
- Rows: Easy, Medium, Hard, **Total** (bold).
- If `lastGameRecord` is set, shows a game summary at top (won/lost icon + time).
- Empty state: "No stats available. Play some games to see stats here!" with `Info` icon.
- Icons: `Award` (title), `TrendingUp` (win %), `Clock` (time), `CheckCircle`/`XCircle` (won/lost), `Info` (empty).

**App icon interaction (`Navbar.tsx`):**
- Click → opens stats modal via `onToggleStatsModal()`.
- Long press (10 seconds) → calls `clearRecords()` to wipe localStorage stats. Uses `onMouseDown`/`onTouchStart` to start a timer, `onMouseUp`/`onTouchEnd`/`onMouseLeave` to cancel. If 10s elapses without release, stats are cleared.

**Context additions:**
- `winner: number | null`, `currentPlayer: number`, `lastGameRecord: GameRecord | null`
- `showStatsModal: boolean`, `onToggleStatsModal: () => void`

**Files created:**
- `src/game/StatsService.ts` + `StatsService.test.ts`
- `src/components/StatsModal.tsx` + `StatsModal.styled.tsx`

**Files changed:**
- `src/context/GameContext.tsx` — win detection, stats recording, new state
- `src/components/CodeRevealOverlay.tsx` — victory message
- `src/components/Navbar.tsx` — stats modal, icon click/long-press

---

### Stats Modal & Completion Flash Refinements

**Stats modal cleanup:**
- Removed `lastGameRecord` prop and `GameSummary` component from `StatsModal`. The stats modal now shows only the aggregated stats table or the empty state. The "You won!"/"You lost" per-game summary was confusing when there was no data yet.
- Removed `lastGameRecord` from `GameContextValue` and `GameProvider` state — no component needs it anymore.
- Added `moves: number` to `GameRecord` and `totalMoves: number` to `LevelStats`.
- Added `avgMoves(stats)` helper to `StatsService.ts`.
- Stats table columns updated: `Level` (with `BarChart2` icon), `Games` (with `Hash` icon), `Win %` (with `TrendingUp` icon), `Avg (m:ss)` (with `Clock` icon), `Moves` (with `MousePointer` icon).

**Victory overlay stats:**
- When `winner !== null`, `CodeRevealOverlay` now shows elapsed time (`Clock` icon) and move count (`MousePointer` icon) below the victory title via `RevealStats`/`RevealStat` styled-components.

**Completion flash fix — reactive instead of timer-based:**
- `completionFlash` in `usePatternLock` is now a **derived value** (`isMouseDown && !!targetLength && path.length >= targetLength`) instead of timer-driven state. Dots scale up when the user reaches the target length and **stay scaled up** until the mouse is released.
- `complete` CSS class changed from `animation: popComplete 500ms` to `transform: scale(2.5); transition: transform 200ms ease` — a persistent transform, not a one-shot animation.
- Only the first N dots (where N = `targetLength`) get the `complete` class. Dots selected after position N still receive the normal `pop` animation.
- Removed `completionTimerRef` and the `useEffect` that managed it.

**Files changed:**
- `src/game/StatsService.ts` — `moves` in `GameRecord`, `totalMoves` in `LevelStats`, `avgMoves()`
- `src/game/StatsService.test.ts` — updated test factories + new `avgMoves` tests
- `src/components/StatsModal.tsx` — removed `GameSummary`, added icons to all columns, added `Moves` column
- `src/components/StatsModal.styled.tsx` — removed `GameSummary` styled-component
- `src/context/GameContext.tsx` — removed `lastGameRecord`, added `moves` to record, removed `GameRecord` import
- `src/components/CodeRevealOverlay.tsx` — added time + moves stats on victory
- `src/components/CodeRevealOverlay.styled.tsx` — added `RevealStats`/`RevealStat`
- `src/components/usePatternLock.ts` — reactive `completionFlash`, removed timer
- `src/components/PatternLock.css` — `complete` class: persistent transform instead of animation
- `src/components/PatternLock.tsx` — `complete` limited to first `targetLength` dots

---

### Multiplayer Player Colors, Sidebar Title, and Turn Announcement

**Decision:** Implemented full multiplayer visual identity: player-specific colors, sidebar title, turn announcement modal, footer player indicator, and colored victory text.

**Player Colors (`src/game/playerColors.ts`):**
- Maps player number (1–4) to Bootstrap CSS vars: `primary`, `success`, `warning`, `info`.
- `getPlayerColor(player)` falls back to `white` for unknown players.
- Colors apply only in multiplayer (`playerCount > PlayerCount.One`).

**`pathColor` prop (PatternLock, Connectors, Point):**
- New optional `pathColor?: string` prop on `PatternLock`, forwarded to `Connectors` and `Point`.
- `PatternLock.tsx` passes `disabled ? undefined : pathColor` to both children, ensuring disabled history locks are never colored.
- `Connectors.tsx` applies `background: pathColor` inline on connector divs and `borderLeftColor: pathColor` on arrowheads.
- `Point.tsx` applies `background: pathColor` inline only on selected points (via `pathColor && selected`).
- `App.tsx` computes `pathColor` from current player color when multiplayer, else `undefined`.

**History entry player indicator (`PatternHistory`, `PatternHistory.styled.tsx`):**
- `HistoryEntry` gains a `$playerColor?: string` transient prop → 3px colored left border.
- `GameContext` now tracks `playerHistory: number[]` (parallel to `pathHistory`), recording which player made each guess.
- `PatternHistory` reads `playerHistory` and `playerCount` from context; passes player color only in multiplayer. The PatternLock preview colors inside entries remain unchanged.

**Sidebar title:**
- `HistoryTitle` styled-component added to `PatternHistory.styled.tsx`.
- `PatternHistory.tsx` renders the title with a `List` icon from `react-feather`.

**Footer current player (`Footer.tsx`, `Footer.styled.tsx`):**
- `PlayerLabel` styled-component: absolutely centered via `position: absolute; left: 50%; transform: translateX(-50%)`.
- `FooterContainer` gains `position: relative` as containing block.
- Shows `User` icon + "Player N" in player color only when multiplayer.

**Victory text coloring (`CodeRevealOverlay.tsx`):**
- `renderTitle()` helper: in multiplayer wins, wraps "Player N" in a `<span>` with inline player color; leaves " wins!" white. Single-player and give-up cases unchanged.

**Turn Announcement modal (`TurnAnnouncement.tsx`, `.styled.tsx`, `.utils.ts`):**
- Shows "Player N's Turn" when `showTurnModal` is true and `playerCount > PlayerCount.One`.
- Auto-dismisses after 2 seconds via `setTimeout` in a `useEffect`. Dismiss button (X) and backdrop click also dismiss.
- `showTurnModal` set to `true` in `GameContext`: after each non-winning guess (turn switches), on `onPlayerCountChange(> 1)`, on `onLevelChange` (if multiplayer), on `onFinishGame` (if multiplayer).
- `onDismissTurnModal` sets it to `false`. Added to `GameContextValue`.
- `TurnBackdrop` uses `z-index: 2000` (above reveal overlay at 1000).

**Files created:**
- `src/game/playerColors.ts` + `playerColors.test.ts`
- `src/components/TurnAnnouncement.tsx` + `TurnAnnouncement.styled.tsx` + `TurnAnnouncement.utils.ts` + `TurnAnnouncement.test.ts`

**Files changed:**
- `src/components/PatternLock.tsx` — `pathColor` prop
- `src/components/Connectors.tsx` — `pathColor` prop + inline styles
- `src/components/Point.tsx` — `pathColor` prop + conditional inline background
- `src/context/GameContext.tsx` — `playerHistory`, `showTurnModal`, `onDismissTurnModal`
- `src/components/PatternHistory.tsx` — sidebar title + player color on entries
- `src/components/PatternHistory.styled.tsx` — `HistoryTitle`, `HistoryEntry` with `$playerColor`
- `src/components/Footer.tsx` — current player display
- `src/components/Footer.styled.tsx` — `PlayerLabel` + `position: relative` on container
- `src/components/CodeRevealOverlay.tsx` — colored winner text via `renderTitle()`
- `src/App.tsx` — `pathColor` computed + `TurnAnnouncement` rendered

