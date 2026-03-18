import {
    DOT_ANNOTATION_DOUBLE_PRESS_MS,
    DOT_ANNOTATION_MENU_RADIUS_PX,
    getDotAnnotationMenuOptions,
    getDotAnnotationSelectionAtPointer,
    isRepeatedAnnotationPress,
} from "./DotAnnotationMenu.utils.ts";

describe("DotAnnotationMenu helpers", () => {
    it("lays out numbered options across the top arc and actions across the bottom arc", () => {
        const options = getDotAnnotationMenuOptions(4);

        expect(options[0]).toMatchObject({ selection: "position-1", label: "1", tone: "success" });
        expect(options[3]).toMatchObject({ selection: "position-4", label: "4", tone: "success" });
        expect(options[4]).toMatchObject({ selection: "clear", label: "Clear", tone: "neutral" });
        expect(options[5]).toMatchObject({ selection: "eliminate", label: "Elim", tone: "danger" });
        expect(options[6]).toMatchObject({ selection: "all", label: "All", tone: "success" });
        expect(Math.round(Math.hypot(options[0].x, options[0].y))).toBe(DOT_ANNOTATION_MENU_RADIUS_PX);
    });

    it("detects a valid second press on the same dot within the timing window", () => {
        expect(isRepeatedAnnotationPress({ index: 4, timestamp: 1_000 }, 4, 1_250)).toBe(true);
        expect(isRepeatedAnnotationPress({ index: 4, timestamp: 1_000 }, 3, 1_250)).toBe(false);
        expect(isRepeatedAnnotationPress({ index: 4, timestamp: 1_000 }, 4, 1_000 + DOT_ANNOTATION_DOUBLE_PRESS_MS + 1)).toBe(false);
    });

    it("finds the hovered radial option from pointer position", () => {
        const center = { x: 100, y: 120 };

        expect(getDotAnnotationSelectionAtPointer({ x: 50, y: 91 }, center, 4)).toBe("position-1");
        expect(getDotAnnotationSelectionAtPointer({ x: 100, y: 178 }, center, 4)).toBe("eliminate");
        expect(getDotAnnotationSelectionAtPointer({ x: 100, y: 120 }, center, 4)).toBeNull();
    });
});
