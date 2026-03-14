import { parseConfig } from "./ConfigService.ts";
import { Level, PlayerCount } from "./GameConfig.ts";

describe("parseConfig", () => {
    it("returns empty object for null input", () => {
        expect(parseConfig(null)).toEqual({});
    });

    it("returns empty object for invalid JSON", () => {
        expect(parseConfig("not-valid-json{")).toEqual({});
    });

    it("returns empty object for empty string", () => {
        expect(parseConfig("")).toEqual({});
    });

    it("parses valid level and playerCount", () => {
        const raw = JSON.stringify({ level: Level.Hard, playerCount: PlayerCount.Two });
        expect(parseConfig(raw)).toEqual({ level: Level.Hard, playerCount: PlayerCount.Two });
    });

    it("accepts all valid levels", () => {
        for (const level of [Level.Easy, Level.Medium, Level.Hard, Level.Expert]) {
            const raw = JSON.stringify({ level, playerCount: PlayerCount.One });
            expect(parseConfig(raw).level).toBe(level);
        }
    });

    it("accepts all valid player counts", () => {
        for (const playerCount of [PlayerCount.One, PlayerCount.Two, PlayerCount.Three, PlayerCount.Four]) {
            const raw = JSON.stringify({ level: Level.Easy, playerCount });
            expect(parseConfig(raw).playerCount).toBe(playerCount);
        }
    });

    it("rejects an invalid level, keeps valid playerCount", () => {
        const raw = JSON.stringify({ level: "ultra", playerCount: PlayerCount.Three });
        const result = parseConfig(raw);
        expect(result.level).toBeUndefined();
        expect(result.playerCount).toBe(PlayerCount.Three);
    });

    it("rejects an invalid playerCount, keeps valid level", () => {
        const raw = JSON.stringify({ level: Level.Easy, playerCount: 99 });
        const result = parseConfig(raw);
        expect(result.level).toBe(Level.Easy);
        expect(result.playerCount).toBeUndefined();
    });

    it("returns empty object when both values are invalid", () => {
        const raw = JSON.stringify({ level: "unknown", playerCount: 0 });
        expect(parseConfig(raw)).toEqual({});
    });
});
