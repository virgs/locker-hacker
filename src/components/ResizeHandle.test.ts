import {
    RESIZE_HANDLE_TOOLTIP,
    DRAG_THRESHOLD_PX,
    HANDLE_SIZE_PX,
    GRAB_BAR_LENGTH_PX,
    GRAB_BAR_THICKNESS_PX,
} from "./ResizeHandle.constants.ts";

describe("ResizeHandle constants", () => {
    it("tooltip text is a non-empty string", () => {
        expect(RESIZE_HANDLE_TOOLTIP.length).toBeGreaterThan(0);
    });

    it("drag threshold is a positive number", () => {
        expect(DRAG_THRESHOLD_PX).toBeGreaterThan(0);
    });

    it("handle size is a positive number", () => {
        expect(HANDLE_SIZE_PX).toBeGreaterThan(0);
    });

    it("grab bar length is greater than grab bar thickness", () => {
        expect(GRAB_BAR_LENGTH_PX).toBeGreaterThan(GRAB_BAR_THICKNESS_PX);
    });

    it("grab bar thickness is a positive number", () => {
        expect(GRAB_BAR_THICKNESS_PX).toBeGreaterThan(0);
    });
});

