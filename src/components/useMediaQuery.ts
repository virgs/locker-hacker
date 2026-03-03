import { useCallback, useSyncExternalStore } from "react";

/**
 * Returns `true` when the given CSS media query matches.
 *
 * @example
 * const isXL = useMediaQuery("(min-width: 1400px)");
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

