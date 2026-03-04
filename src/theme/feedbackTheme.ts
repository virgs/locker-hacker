export interface FeedbackEntry {
    readonly color:  string;
    readonly symbol: string;
    readonly label:  string;
}

export const FEEDBACK_THEME = {
    bull: { color: "#22c55e", symbol: "+", label: "correct position" } as FeedbackEntry,
    cow:  { color: "#eab308", symbol: "−", label: "wrong position"   } as FeedbackEntry,
    miss: { color: "#6b7280", symbol: "○", label: "not in the code"  } as FeedbackEntry,
} as const;

export const feedbackEntry = (index: number, bulls: number, cows: number): FeedbackEntry => {
    if (index < bulls)        return FEEDBACK_THEME.bull;
    if (index < bulls + cows) return FEEDBACK_THEME.cow;
    return FEEDBACK_THEME.miss;
};

