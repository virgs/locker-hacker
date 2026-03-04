import { useCallback, useSyncExternalStore } from "react";

/**
 * Returns `true` when the given CSS media query matches.
 *
 * @example
 * import { BREAKPOINT_QUERIES } from "../theme/breakpoints";
 * const isMobile = useMediaQuery(BREAKPOINT_QUERIES.mobile);
 */
const useMediaQuery = (query: string): boolean => {
    const subscribe = useCallback(
        (onStoreChange: () => void): (() => void) => {
            const mql = window.matchMedia(query);
            mql.addEventListener("change", onStoreChange);
            return () => mql.removeEventListener("change", onStoreChange);
        },
        [query],
    );

    const getSnapshot = (): boolean => window.matchMedia(query).matches;

    return useSyncExternalStore(subscribe, getSnapshot);
};

export default useMediaQuery;

