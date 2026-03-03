import {
    Level,
    PlayerCount,
    GamePhase,
    DEFAULT_LEVEL,
    DEFAULT_PLAYER_COUNT,
    LEVEL_CONFIGS,
} from "../game/GameConfig.ts";

describe("GameContext types", () => {
    describe("GamePhase", () => {
        it("has exactly Playing and Revealing", () => {
            const phases = Object.values(GamePhase);
            expect(phases).toHaveLength(2);
            expect(phases).toContain(GamePhase.Playing);
            expect(phases).toContain(GamePhase.Revealing);
        });
    });

    describe("defaults", () => {
        it("default level has a valid grid config", () => {
            const config = LEVEL_CONFIGS[DEFAULT_LEVEL];
            expect(config.cols).toBeGreaterThan(0);
            expect(config.rows).toBeGreaterThan(0);
            expect(config.length).toBeGreaterThan(0);
            expect(config.length).toBeLessThanOrEqual(config.cols * config.rows);
        });

        it("default player count is One", () => {
            expect(DEFAULT_PLAYER_COUNT).toBe(PlayerCount.One);
        });

        it("default level is Medium", () => {
            expect(DEFAULT_LEVEL).toBe(Level.Medium);
        });
    });
});
