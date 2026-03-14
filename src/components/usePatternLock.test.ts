import { isDoublePressCandidate, isStationaryGesture } from "./usePatternLock.ts";

describe("usePatternLock helpers", () => {
    it("treats tiny movement as stationary", () => {
        expect(isStationaryGesture({ x: 10, y: 12 }, { x: 16, y: 17 })).toBe(true);
        expect(isStationaryGesture({ x: 10, y: 12 }, { x: 24, y: 17 })).toBe(false);
    });

    it("requires the same dot within the timing window for double press", () => {
        expect(isDoublePressCandidate({ index: 4, time: 1_000 }, 4, 1_200)).toBe(true);
        expect(isDoublePressCandidate({ index: 4, time: 1_000 }, 5, 1_200)).toBe(false);
        expect(isDoublePressCandidate({ index: 4, time: 1_000 }, 4, 1_500)).toBe(false);
    });
});
