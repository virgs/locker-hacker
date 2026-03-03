export const COLORS = {
    bull: "#22c55e",
    cow:  "#eab308",
    miss: "#6b7280",
} as const;

export const dotColor = (index: number, bulls: number, cows: number): string => {
    if (index < bulls)        return COLORS.bull;
    if (index < bulls + cows) return COLORS.cow;
    return COLORS.miss;
};
