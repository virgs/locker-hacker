import { Level } from "./GameConfig.ts";
import {
    type GameRecord,
    loadRecords,
    saveRecord,
    updateRecord,
    filterVisibleStatsRecords,
    computeLevelStats,
    computeTotalStats,
    winPercent,
    avgTimeSeconds,
    avgMoves,
    avgHints,
    formatStatsTime,
} from "./StatsService.ts";

const STORAGE_KEY = "locker-hacker-stats";

const createStorageMock = (): Storage => {
    const store = new Map<string, string>();
    return {
        getItem: (key: string): string | null => store.get(key) ?? null,
        setItem: (key: string, value: string): void => {
            store.set(key, value);
        },
        removeItem: (key: string): void => {
            store.delete(key);
        },
        clear: (): void => {
            store.clear();
        },
        key: (index: number): string | null => Array.from(store.keys())[index] ?? null,
        get length(): number {
            return store.size;
        },
    };
};

const record = (level: Level, won: boolean, dur: number, moves = 5, hintsUsed = 0): GameRecord => ({
    id: `${level}-${won}-${dur}-${moves}-${hintsUsed}`,
    level,
    won,
    completed: true,
    durationSeconds: dur,
    moves,
    hintsUsed,
    date: "2025-01-01",
});

describe("StatsService", () => {
    beforeEach(() => {
        Object.defineProperty(globalThis, "localStorage", {
            value: createStorageMock(),
            configurable: true,
            writable: true,
        });
    });

    describe("record storage", () => {
        it("normalizes legacy records without id/completed fields", () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([
                { level: Level.Easy, won: true, durationSeconds: 12, moves: 3, hintsUsed: 0, date: "2025-01-01" },
            ]));

            expect(loadRecords()).toEqual([
                {
                    id: "legacy-0-2025-01-01",
                    level: Level.Easy,
                    won: true,
                    completed: true,
                    durationSeconds: 12,
                    moves: 3,
                    hintsUsed: 0,
                    date: "2025-01-01",
                },
            ]);
        });

        it("updates an existing record in place", () => {
            saveRecord(record(Level.Medium, false, 10));

            updateRecord("medium-false-10-5-0", { won: true, completed: false, moves: 7 });

            expect(loadRecords()[0]).toMatchObject({
                id: "medium-false-10-5-0",
                won: true,
                completed: false,
                moves: 7,
            });
        });
    });

    describe("filterVisibleStatsRecords", () => {
        it("hides only the current unfinished active record", () => {
            const records = [
                { ...record(Level.Easy, false, 10), id: "active", completed: false },
                { ...record(Level.Easy, false, 20), id: "finished", completed: true },
                { ...record(Level.Hard, false, 30), id: "abandoned", completed: false },
            ];

            expect(filterVisibleStatsRecords(records, "active").map(entry => entry.id)).toEqual(["finished", "abandoned"]);
        });
    });

    describe("computeLevelStats", () => {
        it("returns zero stats for empty records", () => {
            const stats = computeLevelStats([]);
            expect(stats[Level.Easy].gamesPlayed).toBe(0);
            expect(stats[Level.Medium].gamesPlayed).toBe(0);
            expect(stats[Level.Hard].gamesPlayed).toBe(0);
        });

        it("groups records by level", () => {
            const records = [
                record(Level.Easy, true, 10),
                record(Level.Easy, false, 20),
                record(Level.Hard, true, 30),
            ];
            const stats = computeLevelStats(records);
            expect(stats[Level.Easy].gamesPlayed).toBe(2);
            expect(stats[Level.Easy].wins).toBe(1);
            expect(stats[Level.Easy].totalSeconds).toBe(30);
            expect(stats[Level.Easy].totalHints).toBe(0);
            expect(stats[Level.Hard].gamesPlayed).toBe(1);
            expect(stats[Level.Medium].gamesPlayed).toBe(0);
        });
    });

    describe("computeTotalStats", () => {
        it("aggregates all records", () => {
            const records = [
                record(Level.Easy, true, 10),
                record(Level.Medium, false, 20, 5, 2),
            ];
            const total = computeTotalStats(records);
            expect(total.gamesPlayed).toBe(2);
            expect(total.wins).toBe(1);
            expect(total.totalSeconds).toBe(30);
            expect(total.totalHints).toBe(2);
        });

        it("returns zero for empty records", () => {
            const total = computeTotalStats([]);
            expect(total.gamesPlayed).toBe(0);
            expect(total.wins).toBe(0);
            expect(total.totalSeconds).toBe(0);
            expect(total.totalHints).toBe(0);
        });
    });

    describe("winPercent", () => {
        it("returns 0 for no games", () => {
            expect(winPercent({ gamesPlayed: 0, wins: 0, totalSeconds: 0, totalMoves: 0, totalHints: 0 })).toBe(0);
        });

        it("calculates correct percentage", () => {
            expect(winPercent({ gamesPlayed: 4, wins: 3, totalSeconds: 0, totalMoves: 0, totalHints: 0 })).toBe(75);
        });

        it("returns precise fractional percentage", () => {
            expect(winPercent({ gamesPlayed: 3, wins: 1, totalSeconds: 0, totalMoves: 0, totalHints: 0 })).toBeCloseTo(33.33, 1);
        });
    });

    describe("avgTimeSeconds", () => {
        it("returns 0 for no games", () => {
            expect(avgTimeSeconds({ gamesPlayed: 0, wins: 0, totalSeconds: 0, totalMoves: 0, totalHints: 0 })).toBe(0);
        });

        it("calculates average", () => {
            expect(avgTimeSeconds({ gamesPlayed: 2, wins: 0, totalSeconds: 60, totalMoves: 0, totalHints: 0 })).toBe(30);
        });
    });

    describe("avgMoves", () => {
        it("returns 0 for no games", () => {
            expect(avgMoves({ gamesPlayed: 0, wins: 0, totalSeconds: 0, totalMoves: 0, totalHints: 0 })).toBe(0);
        });

        it("calculates precise average", () => {
            expect(avgMoves({ gamesPlayed: 3, wins: 0, totalSeconds: 0, totalMoves: 10, totalHints: 0 })).toBeCloseTo(3.33, 1);
        });
    });

    describe("avgHints", () => {
        it("returns 0 for no games", () => {
            expect(avgHints({ gamesPlayed: 0, wins: 0, totalSeconds: 0, totalMoves: 0, totalHints: 0 })).toBe(0);
        });

        it("calculates average hints", () => {
            expect(avgHints({ gamesPlayed: 4, wins: 1, totalSeconds: 20, totalMoves: 10, totalHints: 6 })).toBe(1.5);
        });
    });

    describe("formatStatsTime", () => {
        it("formats zero", () => {
            expect(formatStatsTime(0)).toBe("0:00");
        });

        it("formats whole seconds", () => {
            expect(formatStatsTime(65)).toBe("1:05");
        });

        it("formats fractional seconds", () => {
            expect(formatStatsTime(61.7)).toBe("1:01");
        });

        it("formats large values", () => {
            expect(formatStatsTime(3600)).toBe("60:00");
        });
    });
});
