import { getPointInnerClassName } from "./Point.utils.ts";

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
});
