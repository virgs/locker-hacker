import { Level } from "./GameConfig.ts";
import {
    type GameRecord,
    computeLevelStats,
    computeTotalStats,
    winPercent,
    avgTimeSeconds,
    avgMoves,
    formatStatsTime,
} from "./StatsService.ts";

const record = (level: Level, won: boolean, dur: number, moves = 5): GameRecord => ({
    level, won, durationSeconds: dur, moves, date: "2025-01-01",
});

describe("StatsService", () => {
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
            expect(stats[Level.Hard].gamesPlayed).toBe(1);
            expect(stats[Level.Medium].gamesPlayed).toBe(0);
        });
    });

    describe("computeTotalStats", () => {
        it("aggregates all records", () => {
            const records = [
                record(Level.Easy, true, 10),
                record(Level.Medium, false, 20),
            ];
            const total = computeTotalStats(records);
            expect(total.gamesPlayed).toBe(2);
            expect(total.wins).toBe(1);
            expect(total.totalSeconds).toBe(30);
        });

        it("returns zero for empty records", () => {
            const total = computeTotalStats([]);
            expect(total.gamesPlayed).toBe(0);
            expect(total.wins).toBe(0);
            expect(total.totalSeconds).toBe(0);
        });
    });

    describe("winPercent", () => {
        it("returns 0 for no games", () => {
            expect(winPercent({ gamesPlayed: 0, wins: 0, totalSeconds: 0, totalMoves: 0 })).toBe(0);
        });

        it("calculates correct percentage", () => {
            expect(winPercent({ gamesPlayed: 4, wins: 3, totalSeconds: 0, totalMoves: 0 })).toBe(75);
        });

        it("rounds to nearest integer", () => {
            expect(winPercent({ gamesPlayed: 3, wins: 1, totalSeconds: 0, totalMoves: 0 })).toBe(33);
        });
    });

    describe("avgTimeSeconds", () => {
        it("returns 0 for no games", () => {
            expect(avgTimeSeconds({ gamesPlayed: 0, wins: 0, totalSeconds: 0, totalMoves: 0 })).toBe(0);
        });

        it("calculates average", () => {
            expect(avgTimeSeconds({ gamesPlayed: 2, wins: 0, totalSeconds: 60, totalMoves: 0 })).toBe(30);
        });
    });

    describe("avgMoves", () => {
        it("returns 0 for no games", () => {
            expect(avgMoves({ gamesPlayed: 0, wins: 0, totalSeconds: 0, totalMoves: 0 })).toBe(0);
        });

        it("calculates average rounded to one decimal", () => {
            expect(avgMoves({ gamesPlayed: 3, wins: 0, totalSeconds: 0, totalMoves: 10 })).toBe(3.3);
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

