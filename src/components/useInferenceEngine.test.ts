import { InferenceEngine } from "../ai/InferenceEngine.ts";
import { GuessValidator } from "../game/GuessValidator.ts";
import type { GridConfig } from "../game/GameConfig.ts";
import type { Observation } from "../ai/types.ts";

/**
 * Tests for the AI progress computation logic used by useInferenceEngine.
 * We test the underlying InferenceEngine integration rather than the React hook.
 */

const computeAiProgress = (
    gridConfig: GridConfig,
    code: number[],
    pathHistory: number[][],
): { percent: number; candidates: number } => {
    if (pathHistory.length === 0) return { percent: 0, candidates: 0 };

    const engine = new InferenceEngine(gridConfig);
    const validator = new GuessValidator(code);
    const observations: Observation[] = pathHistory.map(guess => ({
        guess,
        feedback: validator.validate([...guess]),
    }));

    const summary = engine.applyAll(observations);
    return {
        percent: summary.progress.reducedPercent,
        candidates: summary.progress.candidateCount,
    };
};

describe("AI progress computation", () => {
    const config: GridConfig = { cols: 2, rows: 2, length: 2 };
    // 2x2 grid, length 2 → 12 total candidates

    it("returns 0% with 0 candidates when no guesses made", () => {
        const result = computeAiProgress(config, [0, 1], []);
        expect(result.percent).toBe(0);
        expect(result.candidates).toBe(0);
    });

    it("reduces candidates after a guess", () => {
        const code = [0, 3]; // top-left → bottom-right
        const result = computeAiProgress(config, code, [[0, 1]]);
        expect(result.candidates).toBeLessThan(12);
        expect(result.percent).toBeGreaterThan(0);
    });

    it("reaches near 100% when the exact code is guessed", () => {
        const code = [0, 3];
        const result = computeAiProgress(config, code, [[0, 3]]);
        // Guessing the exact code → bulls=2, cows=0 → only 1 candidate remains
        expect(result.candidates).toBe(1);
        expect(result.percent).toBeGreaterThan(90);
    });

    it("accumulates progress across multiple guesses", () => {
        const code = [0, 3];
        const after1 = computeAiProgress(config, code, [[1, 2]]);
        const after2 = computeAiProgress(config, code, [[1, 2], [0, 1]]);
        expect(after2.candidates).toBeLessThanOrEqual(after1.candidates);
        expect(after2.percent).toBeGreaterThanOrEqual(after1.percent);
    });

    it("resets to 0% for a fresh game (empty history)", () => {
        const code = [0, 3];
        const withGuesses = computeAiProgress(config, code, [[0, 1]]);
        expect(withGuesses.percent).toBeGreaterThan(0);

        const fresh = computeAiProgress(config, code, []);
        expect(fresh.percent).toBe(0);
        expect(fresh.candidates).toBe(0);
    });

    it("works with medium grid (3x3, length 4)", () => {
        const medConfig: GridConfig = { cols: 3, rows: 3, length: 4 };
        const code = [0, 1, 4, 3];
        const result = computeAiProgress(medConfig, code, [[0, 1, 2, 5]]);
        expect(result.candidates).toBeGreaterThan(0);
        expect(result.percent).toBeGreaterThan(0);
    });
});

