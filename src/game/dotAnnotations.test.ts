import {
    cycleDotAnnotation,
    getAnnotatedDotIndices,
    toggleDotAnnotation,
    type DotAnnotations,
} from "./dotAnnotations.ts";

describe("dotAnnotations", () => {
    it("cycles from none to confirmed to eliminated and back to none", () => {
        expect(cycleDotAnnotation(undefined)).toBe("confirmed");
        expect(cycleDotAnnotation("confirmed")).toBe("eliminated");
        expect(cycleDotAnnotation("eliminated")).toBeUndefined();
    });

    it("toggles a dot annotation without mutating other dots", () => {
        const annotations: DotAnnotations = { 1: "eliminated", 4: "confirmed" };

        expect(toggleDotAnnotation(annotations, 1)).toEqual({ 4: "confirmed" });
        expect(toggleDotAnnotation(annotations, 4)).toEqual({ 1: "eliminated", 4: "eliminated" });
    });

    it("returns dot indices by annotation type", () => {
        const annotations: DotAnnotations = { 0: "eliminated", 2: "confirmed", 5: "eliminated" };

        expect(getAnnotatedDotIndices(annotations, "eliminated")).toEqual([0, 5]);
        expect(getAnnotatedDotIndices(annotations, "confirmed")).toEqual([2]);
    });
});
