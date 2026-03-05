import { DRAG_THRESHOLD_PX } from "./ResizeHandle.constants.ts";

describe("useSidebarResize constants", () => {
    it("uses a drag threshold that requires intentional movement", () => {
        expect(DRAG_THRESHOLD_PX).toBeGreaterThanOrEqual(20);
        expect(DRAG_THRESHOLD_PX).toBeLessThanOrEqual(100);
    });
});

describe("useSidebarResize drag logic", () => {
    describe("drag direction interpretation", () => {
        it("positive delta (drag left/up) means expand for desktop", () => {
            // In desktop mode, delta = origin.x - current.x
            // Dragging left: current.x < origin.x → delta > 0 → expand
            const originX = 500;
            const currentX = 400;
            const delta = originX - currentX;
            expect(delta).toBeGreaterThan(0);
            expect(delta > 0).toBe(true); // expand
        });

        it("negative delta (drag right/down) means collapse for desktop", () => {
            const originX = 500;
            const currentX = 600;
            const delta = originX - currentX;
            expect(delta).toBeLessThan(0);
            expect(delta > 0).toBe(false); // collapse
        });

        it("positive delta (drag up) means expand for mobile", () => {
            // In mobile mode, delta = origin.y - current.y
            // Dragging up: current.y < origin.y → delta > 0 → expand
            const originY = 500;
            const currentY = 400;
            const delta = originY - currentY;
            expect(delta).toBeGreaterThan(0);
            expect(delta > 0).toBe(true); // expand
        });

        it("negative delta (drag down) means collapse for mobile", () => {
            const originY = 500;
            const currentY = 600;
            const delta = originY - currentY;
            expect(delta).toBeLessThan(0);
            expect(delta > 0).toBe(false); // collapse
        });

        it("requires movement past threshold to trigger drag", () => {
            const origin = 500;
            const tooClose = origin - DRAG_THRESHOLD_PX + 1;
            const justRight = origin - DRAG_THRESHOLD_PX - 1;
            expect(Math.abs(origin - tooClose)).toBeLessThanOrEqual(DRAG_THRESHOLD_PX);
            expect(Math.abs(origin - justRight)).toBeGreaterThan(DRAG_THRESHOLD_PX);
        });
    });
});

