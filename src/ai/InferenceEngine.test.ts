import { InferenceEngine } from "./InferenceEngine.ts";
import type { GridConfig } from "../game/GameConfig.ts";
import type { Observation } from "./types.ts";

// Use a small grid to keep tests fast
const config: GridConfig = { cols: 2, rows: 2, length: 2 };

describe("InferenceEngine", () => {
    it("initialSummary returns all valid candidates", () => {
        const engine = new InferenceEngine(config);
        const summary = engine.initialSummary();
        // 2x2 grid, length 2 → 4*3 = 12 ordered pairs
        expect(summary.candidates).toHaveLength(12);
        expect(summary.progress.candidateCount).toBe(12);
        expect(summary.progress.initialCandidateCount).toBe(12);
    });

    it("applyObservation reduces candidates correctly", () => {
        const engine = new InferenceEngine(config);
        const initial = engine.initialSummary();

        const observation: Observation = {
            guess: [0, 1],
            feedback: { bulls: 1, cows: 0 },
        };
        const updated = engine.applyObservation(initial, observation);
        expect(updated.candidates.length).toBeLessThan(initial.candidates.length);
        expect(updated.progress.initialCandidateCount).toBe(12);
    });

    it("applyAll reduces candidates through multiple observations", () => {
        const engine = new InferenceEngine(config);
        const secret = [0, 3]; // top-left → bottom-right

        const obs1: Observation = {
            guess: [0, 1],
            feedback: { bulls: 1, cows: 0 },
        };
        const obs2: Observation = {
            guess: [0, 3],
            feedback: { bulls: 2, cows: 0 },
        };

        const summary = engine.applyAll([obs1, obs2]);
        expect(summary.candidates).toHaveLength(1);
        expect(summary.candidates[0]).toEqual(secret);
        expect(summary.progress.solvedPercent).toBeCloseTo(100);
    });

    it("preserves initialCandidateCount across observations", () => {
        const engine = new InferenceEngine(config);
        const obs: Observation = {
            guess: [0, 1],
            feedback: { bulls: 0, cows: 0 },
        };
        const summary = engine.applyAll([obs]);
        expect(summary.progress.initialCandidateCount).toBe(12);
    });

    it("mustHave and mustNotHave converge as observations are added", () => {
        const engine = new InferenceEngine(config);
        const initial = engine.initialSummary();
        expect(initial.mustHave.size).toBe(0); // no dot is in ALL 12 candidates
        expect(initial.mustNotHave.size).toBe(0); // all dots appear somewhere

        const obs: Observation = {
            guess: [0, 1],
            feedback: { bulls: 2, cows: 0 },
        };
        const solved = engine.applyAll([obs]);
        expect(solved.mustHave).toEqual(new Set([0, 1]));
        expect(solved.mustNotHave).toEqual(new Set([2, 3]));
    });
});

