import {
    FIRST_DOT_POP_MOVE_PX,
    getAvailableImplicitDots,
    isStationaryGesture,
    isBlockedPoint,
    shouldIgnoreEmulatedMouseEvent,
    shouldActivateFirstDotPop,
} from "./usePatternLock.ts";

describe("usePatternLock helpers", () => {
    it("treats tiny movement as stationary", () => {
        expect(isStationaryGesture({ x: 10, y: 12 }, { x: 16, y: 17 })).toBe(true);
        expect(isStationaryGesture({ x: 10, y: 12 }, { x: 24, y: 17 })).toBe(false);
    });

    it("activates the first-dot pop only after the configured movement threshold", () => {
        expect(shouldActivateFirstDotPop({ x: 10, y: 12 }, { x: 10, y: 12 })).toBe(false);
        expect(shouldActivateFirstDotPop({ x: 10, y: 12 }, { x: 10 + FIRST_DOT_POP_MOVE_PX - 1, y: 12 })).toBe(false);
        expect(shouldActivateFirstDotPop({ x: 10, y: 12 }, { x: 10 + FIRST_DOT_POP_MOVE_PX, y: 12 })).toBe(true);
        expect(isStationaryGesture({ x: 10, y: 12 }, { x: 10 + FIRST_DOT_POP_MOVE_PX, y: 12 })).toBe(true);
    });

    it("ignores emulated mouse events immediately after touch input", () => {
        expect(shouldIgnoreEmulatedMouseEvent(1_000, 1_200)).toBe(true);
        expect(shouldIgnoreEmulatedMouseEvent(1_000, 1_800)).toBe(false);
    });

    it("treats hidden hint dots as blocked input targets", () => {
        expect(isBlockedPoint(4, [1, 4, 7])).toBe(true);
        expect(isBlockedPoint(5, [1, 4, 7])).toBe(false);
        expect(isBlockedPoint(-1, [1, 4, 7])).toBe(false);
    });

    it("filters blocked middle dots out of implicit path insertion", () => {
        expect(getAvailableImplicitDots([1, 2, 3], [0], false, [2])).toEqual([1, 3]);
        expect(getAvailableImplicitDots([1, 2, 3], [0, 1], false, [2])).toEqual([3]);
        expect(getAvailableImplicitDots([1, 2, 3], [0, 1], true, [2])).toEqual([1, 3]);
    });
});
