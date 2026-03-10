import { getLiveCodeLengthColor } from "./useCodeLengthState.ts";

describe("getLiveCodeLengthColor", () => {
    it("returns inherit when no dots are selected", () => {
        expect(getLiveCodeLengthColor(0, 4)).toBe('inherit');
        expect(getLiveCodeLengthColor(0, 6)).toBe('inherit');
    });

    it("returns warning when some dots are selected but not all", () => {
        expect(getLiveCodeLengthColor(1, 4)).toBe('var(--bs-warning)');
        expect(getLiveCodeLengthColor(2, 4)).toBe('var(--bs-warning)');
        expect(getLiveCodeLengthColor(3, 4)).toBe('var(--bs-warning)');
    });

    it("returns success when selected count equals code length", () => {
        expect(getLiveCodeLengthColor(4, 4)).toBe('var(--bs-success)');
        expect(getLiveCodeLengthColor(6, 6)).toBe('var(--bs-success)');
        expect(getLiveCodeLengthColor(1, 1)).toBe('var(--bs-success)');
    });

    it("warning and success colors are distinct", () => {
        expect(getLiveCodeLengthColor(1, 4)).not.toBe(getLiveCodeLengthColor(4, 4));
    });

    it("neutral and warning colors are distinct", () => {
        expect(getLiveCodeLengthColor(0, 4)).not.toBe(getLiveCodeLengthColor(1, 4));
    });
});
