import {AI_COLOR_MISS, AI_COLOR_SUCCESS, AI_COLOR_WARNING} from "./colors.ts";

export interface FeedbackEntry {
    readonly color: string;
    readonly symbol: string;
    readonly label: string;
}

export const FEEDBACK_THEME = {
    bull: {color: AI_COLOR_SUCCESS, symbol: "+", label: "correct position"} as FeedbackEntry,
    cow: {color: AI_COLOR_WARNING, symbol: "−", label: "wrong position"} as FeedbackEntry,
    miss: {color: AI_COLOR_MISS, symbol: "○", label: "not in the code"} as FeedbackEntry,
} as const;

export const feedbackEntry = (index: number, bulls: number, cows: number): FeedbackEntry => {
    if (index < bulls) return FEEDBACK_THEME.bull;
    if (index < bulls + cows) return FEEDBACK_THEME.cow;
    return FEEDBACK_THEME.miss;
};

