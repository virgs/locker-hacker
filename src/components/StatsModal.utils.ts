export const BUILD_LABEL_RESET_TAP_TARGET = 7;
export const BUILD_LABEL_RESET_WINDOW_MS = 5_000;

export const shouldClearStatsFromBuildTaps = (
    tapCount: number,
    requiredTapCount = BUILD_LABEL_RESET_TAP_TARGET,
): boolean => tapCount >= requiredTapCount;
