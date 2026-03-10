import * as React from "react";

const FREEZE_MS = 1500;

export const getLiveCodeLengthColor = (pathLength: number, codeLength: number): string => {
    if (pathLength === codeLength) return 'var(--bs-success)';
    if (pathLength > 0)            return 'var(--bs-warning)';
    return 'inherit';
};

interface FrozenState {
    count : number;
    color : string;
}

interface CodeLengthState {
    selectedCount       : number;
    color               : string;
    triggerInvalidGuess : (length: number) => void;
}

export const useCodeLengthState = (
    pathLength        : number,
    pathHistoryLength : number,
    codeLength        : number,
): CodeLengthState => {
    const [frozen, setFrozen] = React.useState<FrozenState | null>(null);
    const timerRef            = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const freeze = React.useCallback((count: number, color: string): void => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setFrozen({ count, color });
        timerRef.current = setTimeout(() => setFrozen(null), FREEZE_MS);
    }, []);

    // Valid guess: freeze at codeLength with success color
    React.useEffect(() => {
        if (pathHistoryLength === 0) { setFrozen(null); return; }
        freeze(codeLength, 'var(--bs-success)');
    }, [pathHistoryLength, codeLength, freeze]);

    // Cleanup on unmount
    React.useEffect(() => () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    }, []);

    const triggerInvalidGuess = React.useCallback((length: number): void => {
        freeze(length, 'var(--bs-danger)');
    }, [freeze]);

    const selectedCount = frozen ? frozen.count : pathLength;
    const color         = frozen ? frozen.color : getLiveCodeLengthColor(pathLength, codeLength);

    return { selectedCount, color, triggerInvalidGuess };
};
