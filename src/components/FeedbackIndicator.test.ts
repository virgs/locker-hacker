import { dotColor, COLORS } from "./FeedbackIndicator.utils.ts";

describe("dotColor", () => {
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
