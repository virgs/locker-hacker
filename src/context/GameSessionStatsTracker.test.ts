import { GameSessionStatsTracker } from "./GameSessionStatsTracker.ts";
import { PlayerCount } from "../game/GameConfig.ts";

describe("GameSessionStatsTracker", () => {
    it("does not expose an active record before a game starts", () => {
        const tracker = new GameSessionStatsTracker();
        expect(tracker.hasStarted()).toBe(false);
        expect(tracker.getActiveRecordId(PlayerCount.One)).toBeNull();
    });

    it("stores the active record id after start", () => {
        const tracker = new GameSessionStatsTracker();
        tracker.start("record-1");
        expect(tracker.hasStarted()).toBe(true);
        expect(tracker.getActiveRecordId(PlayerCount.One)).toBe("record-1");
    });

    it("hides the active record in multiplayer", () => {
        const tracker = new GameSessionStatsTracker();
        tracker.start("record-1");
        expect(tracker.getActiveRecordId(PlayerCount.Two)).toBeNull();
    });

    it("resets state between games", () => {
        const tracker = new GameSessionStatsTracker();
        tracker.start("record-1");
        tracker.reset();

        expect(tracker.hasStarted()).toBe(false);
        expect(tracker.getActiveRecordId(PlayerCount.One)).toBeNull();

        tracker.start("record-2");
        expect(tracker.getActiveRecordId(PlayerCount.One)).toBe("record-2");
    });
});
