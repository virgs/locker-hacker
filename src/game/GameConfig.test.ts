import {
    LEVEL_CONFIGS,
    LEVEL_LABELS,
    PLAYER_LABELS,
    ALL_LEVELS,
    ALL_PLAYER_COUNTS,
    DEFAULT_LEVEL,
    DEFAULT_PLAYER_COUNT,
    type Level,
    type PlayerCount,
} from "./GameConfig.ts";

describe("GameConfig", () => {
    describe("LEVEL_CONFIGS", () => {
        it("has entries for all levels", () => {
            for (const level of ALL_LEVELS) {
                expect(LEVEL_CONFIGS[level]).toBeDefined();
            }
        });

        it("easy has cols=3, rows=2, length=3", () => {
            expect(LEVEL_CONFIGS.easy).toEqual({ cols: 3, rows: 2, length: 3 });
        });

        it("medium has cols=3, rows=3, length=4", () => {
            expect(LEVEL_CONFIGS.medium).toEqual({ cols: 3, rows: 3, length: 4 });
        });

        it("hard has cols=4, rows=4, length=5", () => {
            expect(LEVEL_CONFIGS.hard).toEqual({ cols: 4, rows: 4, length: 5 });
        });

        it("code length never exceeds total dots", () => {
            for (const level of ALL_LEVELS) {
                const { cols, rows, length } = LEVEL_CONFIGS[level];
                expect(length).toBeLessThanOrEqual(cols * rows);
            }
        });
    });

    describe("LEVEL_LABELS", () => {
        it("has a label for each level", () => {
            for (const level of ALL_LEVELS) {
                expect(typeof LEVEL_LABELS[level]).toBe("string");
                expect(LEVEL_LABELS[level].length).toBeGreaterThan(0);
            }
        });
    });

    describe("PLAYER_LABELS", () => {
        it("has a label for each player count", () => {
            for (const count of ALL_PLAYER_COUNTS) {
                expect(typeof PLAYER_LABELS[count]).toBe("string");
                expect(PLAYER_LABELS[count].length).toBeGreaterThan(0);
            }
        });

        it("labels are distinct", () => {
            const labels = ALL_PLAYER_COUNTS.map(c => PLAYER_LABELS[c]);
            expect(new Set(labels).size).toBe(labels.length);
        });
    });

    describe("ALL_LEVELS", () => {
        it("contains exactly easy, medium, hard", () => {
            expect(ALL_LEVELS).toEqual(["easy", "medium", "hard"]);
        });
    });

    describe("ALL_PLAYER_COUNTS", () => {
        it("contains 1 through 4", () => {
            expect(ALL_PLAYER_COUNTS).toEqual([1, 2, 3, 4]);
        });
    });

    describe("defaults", () => {
        it("default level is medium", () => {
            expect(DEFAULT_LEVEL).toBe<Level>("medium");
        });

        it("default player count is 1", () => {
            expect(DEFAULT_PLAYER_COUNT).toBe<PlayerCount>(1);
        });
    });
});

