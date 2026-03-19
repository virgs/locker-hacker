import {
    FIRST_DOT_POP_MOVE_PX,
    getAvailableImplicitDots,
    isStationaryGesture,
    isBlockedPoint,
    shouldDeferTouchPathStart,
    shouldIgnoreEmulatedMouseEvent,
    shouldActivateFirstDotPop,
    shouldPreventTouchStartDefault,
    shouldTrackAnnotationTap,
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

    it("prevents the browser touchstart default only for active lock touches", () => {
        expect(shouldPreventTouchStartDefault(false, 1)).toBe(true);
        expect(shouldPreventTouchStartDefault(false, 2)).toBe(true);
        expect(shouldPreventTouchStartDefault(false, 0)).toBe(false);
        expect(shouldPreventTouchStartDefault(true, 1)).toBe(false);
    });

    it("defers touch path start only when a dot can open the annotation menu", () => {
        expect(shouldDeferTouchPathStart(4, 5, true)).toBe(true);
        expect(shouldDeferTouchPathStart(-1, 5, true)).toBe(false);
        expect(shouldDeferTouchPathStart(4, undefined, true)).toBe(false);
        expect(shouldDeferTouchPathStart(4, 5, false)).toBe(false);
    });

    it("tracks stationary annotation taps only for mouse input", () => {
        expect(shouldTrackAnnotationTap("mouse", 1, false)).toBe(true);
        expect(shouldTrackAnnotationTap("mouse", 2, false)).toBe(false);
        expect(shouldTrackAnnotationTap("mouse", 1, true)).toBe(false);
        expect(shouldTrackAnnotationTap("touch", 1, false)).toBe(false);
        expect(shouldTrackAnnotationTap(null, 1, false)).toBe(false);
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
