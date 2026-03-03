import { getPlayerColor, PLAYER_COLORS } from "./playerColors.ts";

describe("PLAYER_COLORS", () => {
    it("defines colors for all 4 players", () => {
        expect(Object.keys(PLAYER_COLORS)).toHaveLength(4);
    });

    it("all colors are Bootstrap CSS variable strings", () => {
        Object.values(PLAYER_COLORS).forEach(color => {
            expect(color).toMatch(/^var\(--bs-/);
        });
    });

    it("uses distinct colors for each player", () => {
        const colors = Object.values(PLAYER_COLORS);
        expect(new Set(colors).size).toBe(colors.length);
    });
});

describe("getPlayerColor", () => {
    it("returns the correct color for each valid player", () => {
        expect(getPlayerColor(1)).toBe(PLAYER_COLORS[1]);
        expect(getPlayerColor(2)).toBe(PLAYER_COLORS[2]);
        expect(getPlayerColor(3)).toBe(PLAYER_COLORS[3]);
        expect(getPlayerColor(4)).toBe(PLAYER_COLORS[4]);
    });

    it("falls back to white for unknown player number", () => {
        expect(getPlayerColor(0)).toBe("white");
        expect(getPlayerColor(99)).toBe("white");
    });
});
