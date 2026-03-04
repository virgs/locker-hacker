/**
 * Centralized media-query breakpoints.
 *
 * Values intentionally mirror Bootstrap 5 grid tiers so the app's
 * responsive behaviour stays consistent with the Cyborg/Bootstrap theme.
 *
 * Usage in styled-components:
 *   import { BREAKPOINTS } from "../theme/breakpoints";
 *   const Foo = styled.div`
 *       ${BREAKPOINTS.mobile} { font-size: 12px; }
 *   `;
 *
 * Usage with useMediaQuery hook:
 *   import { BREAKPOINT_QUERIES } from "../theme/breakpoints";
 *   const isMobile = useMediaQuery(BREAKPOINT_QUERIES.mobile);
 */

/** Raw pixel values (exported for tests / programmatic use). */
export const BREAKPOINT_VALUES = {
    mobile: 600,
    xl:     1400,
} as const;

/**
 * Bare media-query conditions (no `@media` prefix).
 * Use with `useMediaQuery()` or `window.matchMedia()`.
 */
export const BREAKPOINT_QUERIES = {
    mobile: `(max-width: ${BREAKPOINT_VALUES.mobile}px)`,
    xl:     `(min-width: ${BREAKPOINT_VALUES.xl}px)`,
} as const;

/**
 * Full `@media (…)` strings for use inside styled-components template literals.
 */
export const BREAKPOINTS = {
    mobile: `@media ${BREAKPOINT_QUERIES.mobile}`,
    xl:     `@media ${BREAKPOINT_QUERIES.xl}`,
} as const;

