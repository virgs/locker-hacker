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

