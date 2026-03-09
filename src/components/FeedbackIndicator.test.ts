import { dotColor, COLORS, FEEDBACK_THEME, feedbackEntry } from "./FeedbackIndicator.utils.ts";

describe("feedbackEntry", () => {
    describe("bull positions", () => {
        it("returns bull entry for indices below bulls count", () => {
            expect(feedbackEntry(0, 2, 1)).toBe(FEEDBACK_THEME.bull);
            expect(feedbackEntry(1, 2, 1)).toBe(FEEDBACK_THEME.bull);
        });

        it("does not return bull entry at the bulls boundary", () => {
            expect(feedbackEntry(2, 2, 1)).not.toBe(FEEDBACK_THEME.bull);
        });
    });

    describe("cow positions", () => {
        it("returns cow entry for indices in [bulls, bulls+cows)", () => {
            expect(feedbackEntry(2, 2, 2)).toBe(FEEDBACK_THEME.cow);
            expect(feedbackEntry(3, 2, 2)).toBe(FEEDBACK_THEME.cow);
        });

        it("does not return cow entry at the cows boundary", () => {
            expect(feedbackEntry(4, 2, 2)).not.toBe(FEEDBACK_THEME.cow);
        });
    });

    describe("miss positions", () => {
        it("returns miss entry for indices at or above bulls + cows", () => {
            expect(feedbackEntry(3, 1, 2)).toBe(FEEDBACK_THEME.miss);
            expect(feedbackEntry(10, 0, 0)).toBe(FEEDBACK_THEME.miss);
        });
    });

    describe("zero bulls and cows", () => {
        it("returns miss for all positions when no bulls or cows", () => {
            expect(feedbackEntry(0, 0, 0)).toBe(FEEDBACK_THEME.miss);
            expect(feedbackEntry(3, 0, 0)).toBe(FEEDBACK_THEME.miss);
        });
    });

    describe("all bulls", () => {
        it("returns bull for all positions when fully solved", () => {
            expect(feedbackEntry(0, 4, 0)).toBe(FEEDBACK_THEME.bull);
            expect(feedbackEntry(3, 4, 0)).toBe(FEEDBACK_THEME.bull);
        });
    });
});

describe("FEEDBACK_THEME", () => {
    it("defines distinct colors for bull, cow, and miss", () => {
        const colors = [FEEDBACK_THEME.bull.color, FEEDBACK_THEME.cow.color, FEEDBACK_THEME.miss.color];
        expect(new Set(colors).size).toBe(3);
    });

    it("defines distinct symbols for bull, cow, and miss", () => {
        const symbols = [FEEDBACK_THEME.bull.symbol, FEEDBACK_THEME.cow.symbol, FEEDBACK_THEME.miss.symbol];
        expect(new Set(symbols).size).toBe(3);
    });

    it("uses + for bull, − for cow, and ○ for miss", () => {
        expect(FEEDBACK_THEME.bull.symbol).toBe("+");
        expect(FEEDBACK_THEME.cow.symbol).toBe("−");
        expect(FEEDBACK_THEME.miss.symbol).toBe("○");
    });

    it("each entry has a non-empty label", () => {
        for (const entry of Object.values(FEEDBACK_THEME)) {
            expect(entry.label.length).toBeGreaterThan(0);
        }
    });
});

describe("dotColor (deprecated)", () => {
    describe("bull positions", () => {
        it("returns bull color for indices below bulls count", () => {
            expect(dotColor(0, 2, 1)).toBe(COLORS.bull);
            expect(dotColor(1, 2, 1)).toBe(COLORS.bull);
        });

        it("does not return bull color at the bulls boundary", () => {
            expect(dotColor(2, 2, 1)).not.toBe(COLORS.bull);
        });
    });

    describe("cow positions", () => {
        it("returns cow color for indices in [bulls, bulls+cows)", () => {
            expect(dotColor(2, 2, 2)).toBe(COLORS.cow);
            expect(dotColor(3, 2, 2)).toBe(COLORS.cow);
        });

        it("does not return cow color at the cows boundary", () => {
            expect(dotColor(4, 2, 2)).not.toBe(COLORS.cow);
        });
    });

    describe("miss positions", () => {
        it("returns miss color for indices at or above bulls + cows", () => {
            expect(dotColor(3, 1, 2)).toBe(COLORS.miss);
            expect(dotColor(10, 0, 0)).toBe(COLORS.miss);
        });
    });

    describe("zero bulls and cows", () => {
        it("returns miss for all positions when no bulls or cows", () => {
            expect(dotColor(0, 0, 0)).toBe(COLORS.miss);
            expect(dotColor(3, 0, 0)).toBe(COLORS.miss);
        });
    });

    describe("all bulls", () => {
        it("returns bull for all positions when fully solved", () => {
            expect(dotColor(0, 4, 0)).toBe(COLORS.bull);
            expect(dotColor(3, 4, 0)).toBe(COLORS.bull);
        });
    });

    describe("COLORS constants", () => {
        it("defines distinct colors for bull, cow, and miss", () => {
            const values = Object.values(COLORS);
            const unique  = new Set(values);
            expect(unique.size).toBe(values.length);
        });

        it("colors are valid hex strings", () => {
            for (const color of Object.values(COLORS)) {
                expect(color).toMatch(/^#[0-9a-f]{6}$/i);
            }
        });
    });
});
