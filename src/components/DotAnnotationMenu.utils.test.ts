import {
    DOT_ANNOTATION_DOUBLE_PRESS_MS,
    DOT_ANNOTATION_MENU_BACKDROP_PX,
    DOT_ANNOTATION_MENU_CLEAR_ANGLE_DEG,
    DOT_ANNOTATION_MENU_HIT_RADIUS_PX,
    DOT_ANNOTATION_MENU_MOBILE_MAX_RADIUS_PX,
    DOT_ANNOTATION_MENU_MOBILE_MIN_RADIUS_PX,
    DOT_ANNOTATION_MENU_RADIUS_PX,
    DOT_ANNOTATION_MENU_TOP_LEFT_ACTION_ANGLE_DEG,
    DOT_ANNOTATION_MENU_TOP_RIGHT_ACTION_ANGLE_DEG,
    DOT_ANNOTATION_MENU_VIEWPORT_PADDING_PX,
    getDotAnnotationMenuMetrics,
    getDotAnnotationMenuOffset,
    getDotAnnotationMenuOptions,
    getDotAnnotationSelectionAtPointer,
    isRepeatedAnnotationPress,
} from "./DotAnnotationMenu.utils.ts";

describe("DotAnnotationMenu helpers", () => {
    it("lays out actions around the top arc with clear centered on the bottom arc", () => {
        const options = getDotAnnotationMenuOptions(4);

        expect(options[0]).toMatchObject({
            selection: "eliminate",
            kind: "action",
            tone: "danger",
            angleDeg: DOT_ANNOTATION_MENU_TOP_LEFT_ACTION_ANGLE_DEG,
        });
        expect(options[1]).toMatchObject({ selection: "position-1", label: "1", kind: "position", tone: "success" });
        expect(options[4]).toMatchObject({ selection: "position-4", label: "4", kind: "position", tone: "success" });
        expect(options[5]).toMatchObject({
            selection: "all",
            kind: "action",
            tone: "success",
            angleDeg: DOT_ANNOTATION_MENU_TOP_RIGHT_ACTION_ANGLE_DEG,
        });
        expect(options[6]).toMatchObject({
            selection: "clear",
            kind: "action",
            tone: "neutral",
            angleDeg: DOT_ANNOTATION_MENU_CLEAR_ANGLE_DEG,
        });
        expect(Math.round(Math.hypot(options[6].x, options[6].y))).toBe(DOT_ANNOTATION_MENU_RADIUS_PX);
    });

    it("scales the annotation menu up on compact viewports", () => {
        expect(getDotAnnotationMenuMetrics(320, false)).toEqual({
            radiusPx: DOT_ANNOTATION_MENU_RADIUS_PX,
            hitRadiusPx: DOT_ANNOTATION_MENU_HIT_RADIUS_PX,
            backdropDiameterPx: DOT_ANNOTATION_MENU_BACKDROP_PX,
            footprintRadiusPx: 100,
        });

        const compactMetrics = getDotAnnotationMenuMetrics(320, true);

        expect(compactMetrics.radiusPx).toBeGreaterThan(DOT_ANNOTATION_MENU_RADIUS_PX);
        expect(compactMetrics.radiusPx).toBeGreaterThanOrEqual(DOT_ANNOTATION_MENU_MOBILE_MIN_RADIUS_PX);
        expect(compactMetrics.radiusPx).toBeLessThanOrEqual(DOT_ANNOTATION_MENU_MOBILE_MAX_RADIUS_PX);
        expect(compactMetrics.backdropDiameterPx).toBeGreaterThan(DOT_ANNOTATION_MENU_BACKDROP_PX);
        expect(compactMetrics.hitRadiusPx).toBeGreaterThan(DOT_ANNOTATION_MENU_HIT_RADIUS_PX);
        expect(compactMetrics.footprintRadiusPx).toBeGreaterThan(compactMetrics.backdropDiameterPx / 2);
        expect(compactMetrics.radiusPx).toBe(112);
    });

    it("detects a valid second press on the same dot within the timing window", () => {
        expect(isRepeatedAnnotationPress({ index: 4, timestamp: 1_000 }, 4, 1_250)).toBe(true);
        expect(isRepeatedAnnotationPress({ index: 4, timestamp: 1_000 }, 3, 1_250)).toBe(false);
        expect(isRepeatedAnnotationPress({ index: 4, timestamp: 1_000 }, 4, 1_000 + DOT_ANNOTATION_DOUBLE_PRESS_MS + 1)).toBe(false);
    });

    it("finds the pointed radial option from pointer angle instead of direct overlap", () => {
        const center = { x: 100, y: 120 };

        expect(getDotAnnotationSelectionAtPointer({ x: 20, y: 106 }, center, 4)).toBe("eliminate");
        expect(getDotAnnotationSelectionAtPointer({ x: 78, y: 42 }, center, 4)).toBe("position-2");
        expect(getDotAnnotationSelectionAtPointer({ x: 180, y: 106 }, center, 4)).toBe("all");
        expect(getDotAnnotationSelectionAtPointer({ x: 100, y: 178 }, center, 4)).toBe("clear");
        expect(getDotAnnotationSelectionAtPointer({ x: 112, y: 126 }, center, 4)).toBeNull();
    });

    it("uses the provided radius and hit target for compact menus", () => {
        const center = { x: 100, y: 120 };
        const compactMetrics = getDotAnnotationMenuMetrics(320, true);

        expect(
            getDotAnnotationSelectionAtPointer(
                { x: center.x, y: center.y + compactMetrics.radiusPx },
                center,
                4,
                compactMetrics.radiusPx,
                compactMetrics.hitRadiusPx,
            ),
        ).toBe("clear");
    });

    it("pushes the menu back inside the viewport when it would be clipped", () => {
        expect(
            getDotAnnotationMenuOffset(
                { x: 40, y: 44 },
                120,
                { width: 360, height: 640 },
            ),
        ).toEqual({
            x: DOT_ANNOTATION_MENU_VIEWPORT_PADDING_PX + 120 - 40,
            y: DOT_ANNOTATION_MENU_VIEWPORT_PADDING_PX + 120 - 44,
        });

        expect(
            getDotAnnotationMenuOffset(
                { x: 180, y: 320 },
                120,
                { width: 360, height: 640 },
            ),
        ).toEqual({ x: 0, y: 0 });
    });
});
