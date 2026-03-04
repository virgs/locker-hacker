import { TOOLTIP_DELAY } from "./Tip.constants.ts";

describe("Tip constants", () => {
    it("has a show delay greater than 0", () => {
        expect(TOOLTIP_DELAY.show).toBeGreaterThan(0);
    });

    it("has a hide delay greater than 0", () => {
        expect(TOOLTIP_DELAY.hide).toBeGreaterThan(0);
    });

    it("show delay is longer than hide delay", () => {
        expect(TOOLTIP_DELAY.show).toBeGreaterThan(TOOLTIP_DELAY.hide);
    });
});

