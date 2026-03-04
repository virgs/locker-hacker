import { filterCandidates } from "./CandidateFilter.ts";
import type { Observation, Path } from "./types.ts";

describe("filterCandidates", () => {
    const candidates: Path[] = [
        [0, 1, 2],
        [0, 2, 1],
        [1, 0, 2],
        [2, 1, 0],
        [3, 4, 5],
    ];

    it("keeps candidates that match the feedback exactly", () => {
        // secret [0,1,2], guess [0,2,1] → bulls=1, cows=2
        const observation: Observation = {
            guess: [0, 2, 1],
            feedback: { bulls: 1, cows: 2 },
        };
        const result = filterCandidates(candidates, observation);
        // Only [0,1,2] matches: validate([0,2,1]) → bulls=1 (pos 0), cows=2
        expect(result).toContainEqual([0, 1, 2]);
    });

    it("removes candidates that produce different feedback", () => {
        const observation: Observation = {
            guess: [0, 2, 1],
            feedback: { bulls: 1, cows: 2 },
        };
        const result = filterCandidates(candidates, observation);
        expect(result).not.toContainEqual([3, 4, 5]);
    });

    it("returns empty when no candidate matches", () => {
        const observation: Observation = {
            guess: [6, 7, 8],
            feedback: { bulls: 3, cows: 0 },
        };
        const result = filterCandidates(candidates, observation);
        expect(result).toHaveLength(0);
    });

    it("keeps all candidates when feedback is all misses for unrelated guess", () => {
        const observation: Observation = {
            guess: [6, 7, 8],
            feedback: { bulls: 0, cows: 0 },
        };
        const result = filterCandidates(candidates, observation);
        // [3,4,5] also has no overlap with [6,7,8], so kept too
        expect(result.length).toBeGreaterThanOrEqual(candidates.length - 0);
    });

    it("returns exact match when feedback is all bulls", () => {
        const observation: Observation = {
            guess: [0, 1, 2],
            feedback: { bulls: 3, cows: 0 },
        };
        const result = filterCandidates(candidates, observation);
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual([0, 1, 2]);
    });
});

