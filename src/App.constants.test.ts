import {
    MOBILE_MAIN_AREA_PADDING_PX,
    MOBILE_SIDEBAR_COLLAPSED_HEIGHT_PX,
    getMobileMainAreaPaddingBottom,
} from "./App.constants.ts";

describe("App mobile layout constants", () => {
    it("keeps enough collapsed sidebar height to preview at least four guesses", () => {
        expect(MOBILE_SIDEBAR_COLLAPSED_HEIGHT_PX).toBeGreaterThanOrEqual(240);
    });

    it("uses the collapsed sidebar height in the mobile main-area bottom padding", () => {
        expect(getMobileMainAreaPaddingBottom()).toBe(
            `calc(${MOBILE_SIDEBAR_COLLAPSED_HEIGHT_PX}px + ${MOBILE_MAIN_AREA_PADDING_PX}px)`,
        );
    });
});
