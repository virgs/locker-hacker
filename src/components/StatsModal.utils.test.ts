import {
    BUILD_LABEL_RESET_TAP_TARGET,
    BUILD_LABEL_RESET_WINDOW_MS,
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
});
