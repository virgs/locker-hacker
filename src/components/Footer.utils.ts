export const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const AI_COLOR_SUCCESS = "var(--bs-success)";
export const AI_COLOR_DANGER  = "var(--bs-danger)";

export const getAiIndicatorColor = (
    isSolved: boolean,
    flashRed: boolean,
): string | undefined => {
    if (isSolved) return AI_COLOR_SUCCESS;
    if (flashRed) return AI_COLOR_DANGER;
    return undefined;
};

