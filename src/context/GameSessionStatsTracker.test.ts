import { describe, expect, it } from "@jest/globals";
import { GameSessionStatsTracker } from "./GameSessionStatsTracker.ts";
import { PlayerCount } from "../game/GameConfig.ts";

describe("GameSessionStatsTracker", () => {
    it("does not persist before a game starts", () => {
        const tracker = new GameSessionStatsTracker();
        expect(tracker.canPersist(PlayerCount.One)).toBe(false);
    });

    it("allows single-player persistence after start", () => {
        const tracker = new GameSessionStatsTracker();
        tracker.start();
        expect(tracker.canPersist(PlayerCount.One)).toBe(true);
    });

    it("prevents persistence after marking persisted", () => {
        const tracker = new GameSessionStatsTracker();
        tracker.start();
        tracker.markPersisted();
        expect(tracker.canPersist(PlayerCount.One)).toBe(false);
    });

    it("prevents persistence in multiplayer", () => {
        const tracker = new GameSessionStatsTracker();
        tracker.start();
        expect(tracker.canPersist(PlayerCount.Two)).toBe(false);
    });

    it("resets state between games", () => {
        const tracker = new GameSessionStatsTracker();
        tracker.start();
        tracker.markPersisted();
        tracker.reset();

        expect(tracker.canPersist(PlayerCount.One)).toBe(false);
        tracker.start();
        expect(tracker.canPersist(PlayerCount.One)).toBe(true);
    });
});
