import {
    applyDotAnnotationSelection,
    getAnnotationSelections,
    getConfirmedDotAnnotations,
    getAnnotatedDotIndices,
    type DotAnnotations,
} from "./dotAnnotations.ts";

describe("dotAnnotations", () => {
    it("toggles eliminated dots on and off", () => {
        expect(applyDotAnnotationSelection({}, 2, "eliminate", 4)).toEqual({
            2: { eliminated: true, positions: [] },
        });
        expect(applyDotAnnotationSelection({
            2: { eliminated: true, positions: [] },
        }, 2, "eliminate", 4)).toEqual({});
    });

    it("toggles numbered confirmations independently on the same dot", () => {
        const annotations = applyDotAnnotationSelection({}, 4, "position-2", 4);
        const withSecond = applyDotAnnotationSelection(annotations, 4, "position-4", 4);
        const clearedOne = applyDotAnnotationSelection(withSecond, 4, "position-2", 4);

        expect(withSecond).toEqual({
            4: { eliminated: false, positions: [2, 4] },
        });
        expect(clearedOne).toEqual({
            4: { eliminated: false, positions: [4] },
        });
    });

    it("treats all as a toggle for every numbered confirmation", () => {
        const selected = applyDotAnnotationSelection({}, 1, "all", 3);
        const cleared = applyDotAnnotationSelection(selected, 1, "all", 3);

        expect(selected).toEqual({
            1: { eliminated: false, positions: [1, 2, 3] },
        });
        expect(cleared).toEqual({});
    });

    it("clears elimination when a numbered confirmation is selected", () => {
        const annotations: DotAnnotations = {
            5: { eliminated: true, positions: [] },
        };

        expect(applyDotAnnotationSelection(annotations, 5, "position-3", 4)).toEqual({
            5: { eliminated: false, positions: [3] },
        });
    });

    it("returns eliminated dot indices", () => {
        const annotations: DotAnnotations = {
            0: { eliminated: true, positions: [] },
            2: { eliminated: false, positions: [1, 3] },
            5: { eliminated: true, positions: [] },
        };

        expect(getAnnotatedDotIndices(annotations, "eliminated")).toEqual([0, 5]);
    });

    it("returns confirmed annotations with multiple positions", () => {
        const annotations: DotAnnotations = {
            1: { eliminated: false, positions: [1, 4] },
            2: { eliminated: false, positions: [3] },
            5: { eliminated: true, positions: [] },
        };

        expect(getConfirmedDotAnnotations(annotations)).toEqual([
            { index: 1, positions: [1, 4] },
            { index: 2, positions: [3] },
        ]);
    });

    it("returns reusable selection ids for the radial menu", () => {
        expect(getAnnotationSelections({ eliminated: true, positions: [] }, 4)).toEqual(["eliminate"]);
        expect(getAnnotationSelections({ eliminated: false, positions: [2, 4] }, 4)).toEqual(["position-2", "position-4"]);
        expect(getAnnotationSelections({ eliminated: false, positions: [1, 2, 3, 4] }, 4)).toEqual([
            "all",
            "position-1",
            "position-2",
            "position-3",
            "position-4",
        ]);
    });
});
