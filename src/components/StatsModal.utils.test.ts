import {
    buildStatsSummaryParts,
    BUILD_LABEL_RESET_TAP_TARGET,
    BUILD_LABEL_RESET_WINDOW_MS,
    formatPlayTime,
    formatStatsSummary,
    shouldClearStatsFromBuildTaps,
} from "./StatsModal.utils.ts";

describe("StatsModal hidden reset gesture", () => {
    it("uses a hidden but reachable tap target", () => {
        expect(BUILD_LABEL_RESET_TAP_TARGET).toBe(7);
        expect(BUILD_LABEL_RESET_WINDOW_MS).toBe(5_000);
    });

    it("clears stats only after enough build-label taps", () => {
        expect(shouldClearStatsFromBuildTaps(BUILD_LABEL_RESET_TAP_TARGET - 1)).toBe(false);
        expect(shouldClearStatsFromBuildTaps(BUILD_LABEL_RESET_TAP_TARGET)).toBe(true);
        expect(shouldClearStatsFromBuildTaps(BUILD_LABEL_RESET_TAP_TARGET + 1)).toBe(true);
    });

    it("formats the footer summary as a readable sentence", () => {
        expect(formatStatsSummary({
            gamesPlayed: 12,
            wins: 7,
            totalSeconds: 5_400,
        })).toBe("Across 12 games, you won 7, abandoned 5, and spent 1 hour and 30 minutes playing. Your overall win rate is 58.3%.");
    });

    it("uses an inviting empty-state sentence for zero stats", () => {
        expect(formatStatsSummary({
            gamesPlayed: 0,
            wins: 0,
            totalSeconds: 0,
        })).toBe("No completed games yet. Play a round to start building your stats.");
    });

    it("formats play time as hours and minutes", () => {
        expect(formatPlayTime(1_440)).toBe("24 minutes");
        expect(formatPlayTime(5_400)).toBe("1 hour and 30 minutes");
    });

    it("builds reusable highlighted fact strings", () => {
        expect(buildStatsSummaryParts({
            gamesPlayed: 3,
            wins: 2,
            totalSeconds: 3_660,
        })).toEqual({
            games: "3 games",
            wins: 2,
            abandoned: 1,
            winRate: "66.7%",
            playTime: "1 hour and 1 minute",
        });
    });
});
