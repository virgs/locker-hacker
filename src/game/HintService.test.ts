import {
    getEliminationHintCandidates,
    hasEliminationHintCandidates,
    pickEliminationHint,
} from "./HintService.ts";

describe("HintService", () => {
    it("never returns a dot from the secret code", () => {
        const hint = pickEliminationHint({
            totalDots: 9,
            code: [0, 4, 8],
            alreadyEliminated: [],
            random: () => 0,
        });

        expect(hint).not.toBeNull();
        expect([0, 4, 8]).not.toContain(hint);
    });

    it("never returns an already eliminated dot", () => {
        const hint = pickEliminationHint({
            totalDots: 9,
            code: [0, 1, 2],
            alreadyEliminated: [3, 4, 5],
            random: () => 0,
        });

        expect([3, 4, 5]).not.toContain(hint);
    });

    it("returns null when no eligible dots remain", () => {
        const hint = pickEliminationHint({
            totalDots: 4,
            code: [0, 1],
            alreadyEliminated: [2, 3],
        });

        expect(hint).toBeNull();
    });

    it("selects by random index from eligible pool", () => {
        const first = pickEliminationHint({
            totalDots: 6,
            code: [0, 1],
            alreadyEliminated: [],
            random: () => 0,
        });
        const last = pickEliminationHint({
            totalDots: 6,
            code: [0, 1],
            alreadyEliminated: [],
            random: () => 0.999,
        });

        expect(first).toBe(2);
        expect(last).toBe(5);
    });

    it("returns candidates excluding secret and already eliminated dots", () => {
        const candidates = getEliminationHintCandidates({
            totalDots: 6,
            code: [1, 4],
            alreadyEliminated: [0, 5],
        });

        expect(candidates).toEqual([2, 3]);
    });

    it("reports availability only when candidates remain", () => {
        expect(hasEliminationHintCandidates({
            totalDots: 5,
            code: [1, 2],
            alreadyEliminated: [0],
        })).toBe(true);

        expect(hasEliminationHintCandidates({
            totalDots: 5,
            code: [1, 2],
            alreadyEliminated: [0, 3, 4],
        })).toBe(false);
    });
});
