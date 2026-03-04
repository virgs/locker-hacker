import { FEEDBACK_THEME, feedbackEntry, FeedbackEntry } from "./feedbackTheme.ts";

describe("FEEDBACK_THEME", () => {
    it("has bull, cow, and miss entries", () => {
        expect(FEEDBACK_THEME.bull).toBeDefined();
        expect(FEEDBACK_THEME.cow).toBeDefined();
        expect(FEEDBACK_THEME.miss).toBeDefined();
    });

    it("each entry has color, symbol, and label", () => {
        for (const entry of Object.values(FEEDBACK_THEME)) {
            expect(entry).toHaveProperty("color");
            expect(entry).toHaveProperty("symbol");
            expect(entry).toHaveProperty("label");
        }
    });

    it("colors are valid hex strings", () => {
        for (const entry of Object.values(FEEDBACK_THEME)) {
            expect(entry.color).toMatch(/^#[0-9a-f]{6}$/i);
        }
    });

    it("defines distinct colors", () => {
        const colors = Object.values(FEEDBACK_THEME).map((e: FeedbackEntry) => e.color);
        expect(new Set(colors).size).toBe(3);
    });

    it("defines distinct symbols", () => {
        const symbols = Object.values(FEEDBACK_THEME).map((e: FeedbackEntry) => e.symbol);
        expect(new Set(symbols).size).toBe(3);
    });

    it("uses correct symbols: + for bull, − for cow, ○ for miss", () => {
        expect(FEEDBACK_THEME.bull.symbol).toBe("+");
        expect(FEEDBACK_THEME.cow.symbol).toBe("−");
        expect(FEEDBACK_THEME.miss.symbol).toBe("○");
    });
});

describe("feedbackEntry", () => {
    it("returns bull for index < bulls", () => {
        expect(feedbackEntry(0, 3, 1)).toBe(FEEDBACK_THEME.bull);
        expect(feedbackEntry(2, 3, 1)).toBe(FEEDBACK_THEME.bull);
    });

    it("returns cow for index in [bulls, bulls + cows)", () => {
        expect(feedbackEntry(3, 3, 2)).toBe(FEEDBACK_THEME.cow);
        expect(feedbackEntry(4, 3, 2)).toBe(FEEDBACK_THEME.cow);
    });

    it("returns miss for index >= bulls + cows", () => {
        expect(feedbackEntry(5, 3, 2)).toBe(FEEDBACK_THEME.miss);
        expect(feedbackEntry(0, 0, 0)).toBe(FEEDBACK_THEME.miss);
    });

    it("returns all bulls when cows is 0 and index < bulls", () => {
        expect(feedbackEntry(0, 4, 0)).toBe(FEEDBACK_THEME.bull);
        expect(feedbackEntry(3, 4, 0)).toBe(FEEDBACK_THEME.bull);
    });

    it("returns miss for all when bulls and cows are 0", () => {
        expect(feedbackEntry(0, 0, 0)).toBe(FEEDBACK_THEME.miss);
        expect(feedbackEntry(5, 0, 0)).toBe(FEEDBACK_THEME.miss);
    });
});

