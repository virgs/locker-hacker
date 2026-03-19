import {
    getAnnotationMenuOffsetStyle,
    getConfirmedLabelStyle,
    getConfirmedRingSegments,
    getPointInnerClassName,
} from "./Point.utils.ts";

describe("Point class selection", () => {
    it("marks hint-hidden dots as hidden without the eliminated highlight class", () => {
        expect(getPointInnerClassName({
            complete: false,
            pop: false,
            highlighted: true,
            hidden: true,
            selected: false,
        })).toBe("react-pattern-lock__point-inner hidden");
    });

    it("keeps the eliminated highlight class for visible manual annotations", () => {
        expect(getPointInnerClassName({
            complete: false,
            pop: false,
            highlighted: true,
            hidden: false,
            selected: false,
        })).toBe("react-pattern-lock__point-inner highlighted");
    });

    it("preserves the active/complete precedence while allowing hidden dots", () => {
        expect(getPointInnerClassName({
            complete: true,
            pop: true,
            highlighted: false,
            hidden: true,
            selected: true,
        })).toBe("react-pattern-lock__point-inner complete hidden");
    });

    it("positions confirmation numbers around the ring by code segment", () => {
        expect(getConfirmedLabelStyle(1, 4)).toEqual({ transform: "translate(-50%, -50%) translate(-16.97px, -16.97px)" });
        expect(getConfirmedLabelStyle(2, 4)).toEqual({ transform: "translate(-50%, -50%) translate(16.97px, -16.97px)" });
        expect(getConfirmedLabelStyle(3, 4)).toEqual({ transform: "translate(-50%, -50%) translate(16.97px, 16.97px)" });
    });

    it("cuts only small gaps from the confirmed ring behind numbered labels", () => {
        expect(getConfirmedRingSegments([2], 4)).toEqual([
            { start: 90, end: 360 },
        ]);
    });

    it("keeps annotation menu offset separate from option positioning", () => {
        expect(getAnnotationMenuOffsetStyle(18, -24)).toEqual({
            transform: "translate(18px, -24px)",
        });
    });
});
