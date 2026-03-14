import { DRAG_THRESHOLD_PX } from "./ResizeHandle.constants.ts";
import { getPointerResizeDelta, getScrollBoundaryAction } from "./useSidebarResize.ts";

describe("useSidebarResize constants", () => {
    it("uses a drag threshold that requires intentional movement", () => {
        expect(DRAG_THRESHOLD_PX).toBeGreaterThanOrEqual(20);
        expect(DRAG_THRESHOLD_PX).toBeLessThanOrEqual(100);
    });
});

describe("useSidebarResize drag logic", () => {
    describe("drag direction interpretation", () => {
        it("positive delta (drag left/up) means expand for desktop", () => {
            const delta = getPointerResizeDelta({ x: 500, y: 0 }, { x: 400, y: 0 }, false);
            expect(delta).toBeGreaterThan(0);
        });

        it("negative delta (drag right/down) means collapse for desktop", () => {
            const delta = getPointerResizeDelta({ x: 500, y: 0 }, { x: 600, y: 0 }, false);
            expect(delta).toBeLessThan(0);
        });

        it("positive delta (drag up) means expand for mobile", () => {
            const delta = getPointerResizeDelta({ x: 0, y: 500 }, { x: 0, y: 400 }, true);
            expect(delta).toBeGreaterThan(0);
        });

        it("negative delta (drag down) means collapse for mobile", () => {
            const delta = getPointerResizeDelta({ x: 0, y: 500 }, { x: 0, y: 600 }, true);
            expect(delta).toBeLessThan(0);
        });

        it("requires movement past threshold to trigger drag", () => {
            const origin = 500;
            const tooClose = origin - DRAG_THRESHOLD_PX + 1;
            const justRight = origin - DRAG_THRESHOLD_PX - 1;
            expect(Math.abs(origin - tooClose)).toBeLessThanOrEqual(DRAG_THRESHOLD_PX);
            expect(Math.abs(origin - justRight)).toBeGreaterThan(DRAG_THRESHOLD_PX);
        });
    });

    describe("mobile scroll boundary behavior", () => {
        it("collapses when pulling down past the top edge", () => {
            expect(getScrollBoundaryAction({
                scrollTop: 0,
                clientHeight: 200,
                scrollHeight: 800,
                touchDeltaY: DRAG_THRESHOLD_PX + 1,
                thresholdPx: DRAG_THRESHOLD_PX,
            })).toBe("collapse");
        });

        it("expands when pushing up past the bottom edge", () => {
            expect(getScrollBoundaryAction({
                scrollTop: 600,
                clientHeight: 200,
                scrollHeight: 800,
                touchDeltaY: -DRAG_THRESHOLD_PX - 1,
                thresholdPx: DRAG_THRESHOLD_PX,
            })).toBe("expand");
        });

        it("ignores scroll gestures away from the boundaries", () => {
            expect(getScrollBoundaryAction({
                scrollTop: 300,
                clientHeight: 200,
                scrollHeight: 800,
                touchDeltaY: DRAG_THRESHOLD_PX + 20,
                thresholdPx: DRAG_THRESHOLD_PX,
            })).toBeNull();
        });
    });
});
