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

### Per-Connector Opacity with `dynamicLineWidth`

**Decision:** When `dynamicLineWidth=true`, each connector gets per-connector opacity `(i+1)/N` (oldest = `1/N`, newest = `1`). When `dynamicLineWidth=false`, all connectors have `opacity: 1` — no visual change at all.

**Rationale:** Opacity variation makes older path segments fade, reinforcing the sense of direction. Without the `dynamicLineWidth` guard, semi-transparent older lines visually appeared thinner even though their CSS `height` was unchanged — the fix ensures both thickness *and* opacity are static when `dynamicLineWidth=false`.

**Cyclic bug prevention:** The formula `(i+1)/N` is strictly monotonic in `[1/N, 1]` with no modular arithmetic, so it never wraps around regardless of path length.

**`getConnectorOpacity`** extracted to `math.ts` and fully tested.

---

### Arrow Head Always on Last Connector

**Decision:** The arrow head (`arrowHeadIndex`) now shows on the last connector in the array regardless of whether it is a live trailing connector or the final path segment. Previously it only showed on the live connector, making the arrow invisible when the component is disabled (no mouse interaction → no live connector).

---

### `dynamicLineWidth` and `minConnectorThickness` Props

**Decision:** Added `dynamicLineWidth?: boolean` (default `false`) and `minConnectorThickness?: number` (default `2`) to `PatternLockProps`. When `dynamicLineWidth=true`, connector thickness scales linearly from `connectorThickness` (1 line) down to `minConnectorThickness` (max possible lines for the grid). When `false`, thickness is always `connectorThickness`.

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

## Trade-offs

- `containerSize` default of `"100%"` means the CSS height is also `"100%"` when neither `width` nor `height` is provided. This differs from the old behavior where height was always set to a pixel value equal to `offsetWidth`. In practice all current usages pass an explicit pixel value so this has no visible impact.
