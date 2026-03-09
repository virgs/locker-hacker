import { GuessQuality } from "./useInferenceEngine.ts";
import {AI_COLOR_DANGER, AI_COLOR_SUCCESS, AI_COLOR_WARNING} from "../theme/colors.ts";

export const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const formatPercentDelta = (delta: number): string => {
    const sign = delta >= 0 ? "+" : "";
    return `${sign}${delta.toFixed(1)}%`;
};

export const getAiIndicatorColor = (
    isSolved: boolean,
    flashQuality: GuessQuality,
): string | undefined => {
    if (flashQuality !== GuessQuality.Neutral) {
        switch (flashQuality) {
            case GuessQuality.Good:     return AI_COLOR_SUCCESS;
            case GuessQuality.Mediocre: return AI_COLOR_WARNING;
            case GuessQuality.Bad:      return AI_COLOR_DANGER;
        }
    }
    if (isSolved) return AI_COLOR_SUCCESS;
    return undefined;
};

