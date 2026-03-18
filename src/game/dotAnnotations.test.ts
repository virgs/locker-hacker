import {
    cycleDotAnnotation,
    getConfirmedDotAnnotations,
    getAnnotatedDotIndices,
    toggleDotAnnotation,
    type DotAnnotations,
} from "./dotAnnotations.ts";

describe("dotAnnotations", () => {
    it("cycles from none to eliminated to confirmed through all numbered confirmations and back to none", () => {
        expect(cycleDotAnnotation(undefined, 4)).toBe("eliminated");
        expect(cycleDotAnnotation("eliminated", 4)).toBe("confirmed");
        expect(cycleDotAnnotation("confirmed", 4)).toBe("confirmed-1");
        expect(cycleDotAnnotation("confirmed-1", 4)).toBe("confirmed-2");
        expect(cycleDotAnnotation("confirmed-4", 4)).toBeUndefined();
    });

    it("toggles a dot annotation without mutating other dots", () => {
        const annotations: DotAnnotations = { 1: "eliminated", 4: "confirmed-2" };

        expect(toggleDotAnnotation(annotations, 1, 3)).toEqual({ 1: "confirmed", 4: "confirmed-2" });
        expect(toggleDotAnnotation(annotations, 4, 3)).toEqual({ 1: "eliminated", 4: "confirmed-3" });
    });

    it("returns eliminated dot indices", () => {
        const annotations: DotAnnotations = { 0: "eliminated", 2: "confirmed-1", 5: "eliminated" };

        expect(getAnnotatedDotIndices(annotations, "eliminated")).toEqual([0, 5]);
    });

    it("returns confirmed annotations with optional positions", () => {
        const annotations: DotAnnotations = { 1: "confirmed", 2: "confirmed-3", 5: "eliminated" };

        expect(getConfirmedDotAnnotations(annotations)).toEqual([
            { index: 1, position: null },
            { index: 2, position: 3 },
        ]);
    });
});
