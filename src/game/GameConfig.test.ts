import {
    LEVEL_CONFIGS,
    LEVEL_LABELS,
    LEVEL_LABELS_SHORT,
    PLAYER_LABELS,
    ALL_LEVELS,
    ALL_PLAYER_COUNTS,
    ALL_GAME_PHASES,
    DEFAULT_LEVEL,
    DEFAULT_PLAYER_COUNT,
    Level,
    PlayerCount,
    GamePhase,
} from "./GameConfig.ts";

describe("GameConfig", () => {
    describe("LEVEL_CONFIGS", () => {
        it("has entries for all levels", () => {
            for (const level of ALL_LEVELS) {
                expect(LEVEL_CONFIGS[level]).toBeDefined();
            }
        });

        it("easy has cols=3, rows=2, length=3", () => {
            expect(LEVEL_CONFIGS[Level.Easy]).toEqual({ cols: 3, rows: 2, length: 3 });
        });

        it("medium has cols=3, rows=3, length=4", () => {
            expect(LEVEL_CONFIGS[Level.Medium]).toEqual({ cols: 3, rows: 3, length: 4 });
        });

        it("hard has cols=4, rows=4, length=5", () => {
            expect(LEVEL_CONFIGS[Level.Hard]).toEqual({ cols: 4, rows: 4, length: 5 });
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

    describe("LEVEL_LABELS_SHORT", () => {
        it("has a short label for each level", () => {
            for (const level of ALL_LEVELS) {
                expect(typeof LEVEL_LABELS_SHORT[level]).toBe("string");
                expect(LEVEL_LABELS_SHORT[level].length).toBe(1);
            }
        });

        it("short labels are distinct", () => {
            const labels = ALL_LEVELS.map(l => LEVEL_LABELS_SHORT[l]);
            expect(new Set(labels).size).toBe(labels.length);
        });

        it("maps easy=E, medium=M, hard=H", () => {
            expect(LEVEL_LABELS_SHORT[Level.Easy]).toBe("E");
            expect(LEVEL_LABELS_SHORT[Level.Medium]).toBe("M");
            expect(LEVEL_LABELS_SHORT[Level.Hard]).toBe("H");
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
            expect(ALL_LEVELS).toEqual([Level.Easy, Level.Medium, Level.Hard]);
        });
    });

    describe("ALL_PLAYER_COUNTS", () => {
        it("contains 1 through 4", () => {
            expect(ALL_PLAYER_COUNTS).toEqual([
                PlayerCount.One,
                PlayerCount.Two,
                PlayerCount.Three,
                PlayerCount.Four,
            ]);
        });
    });

    describe("ALL_GAME_PHASES", () => {
        it("contains playing and revealing", () => {
            expect(ALL_GAME_PHASES).toEqual([
                GamePhase.Playing,
                GamePhase.Revealing,
            ]);
        });

        it("phases are distinct", () => {
            expect(new Set(ALL_GAME_PHASES).size).toBe(ALL_GAME_PHASES.length);
        });
    });

    describe("defaults", () => {
        it("default level is medium", () => {
            expect(DEFAULT_LEVEL).toBe(Level.Medium);
        });

        it("default player count is 1", () => {
            expect(DEFAULT_PLAYER_COUNT).toBe(PlayerCount.One);
        });
    });
});
