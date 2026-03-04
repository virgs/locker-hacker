import { InferenceEngine } from "../ai/InferenceEngine.ts";
import { GuessValidator } from "../game/GuessValidator.ts";
import type { GridConfig } from "../game/GameConfig.ts";
import type { Observation } from "../ai/types.ts";
import {
    getAiIndicatorColor,
    AI_COLOR_SUCCESS,
    AI_COLOR_DANGER,
} from "./Footer.utils.ts";

/**
 * Tests for the AI progress computation logic used by useInferenceEngine.
 * We test the underlying InferenceEngine integration rather than the React hook.
 */

const buildObservations = (code: number[], history: number[][]): Observation[] => {
    const validator = new GuessValidator(code);
    return history.map(guess => ({
        guess,
        feedback: validator.validate([...guess]),
    }));
};

const computeAiProgress = (
    gridConfig: GridConfig,
    code: number[],
    pathHistory: number[][],
): { percent: number; candidates: number; isSolved: boolean; lastGuessUseless: boolean } => {
    if (pathHistory.length === 0) return { percent: 0, candidates: 0, isSolved: false, lastGuessUseless: false };

    const engine = new InferenceEngine(gridConfig);
    const observations = buildObservations(code, pathHistory);
    const summary = engine.applyAll(observations);
    const currentCandidates = summary.progress.candidateCount;
    const isSolved = currentCandidates <= 1;
    const percent = isSolved ? 100 : summary.progress.reducedPercent;

    let lastGuessUseless = false;
    if (pathHistory.length >= 2) {
        const prevObservations = observations.slice(0, -1);
        const prevSummary = engine.applyAll(prevObservations);
        lastGuessUseless = currentCandidates >= prevSummary.progress.candidateCount;
    }

    return { percent, candidates: currentCandidates, isSolved, lastGuessUseless };
};

describe("AI progress computation", () => {
    const config: GridConfig = { cols: 2, rows: 2, length: 2 };
    // 2x2 grid, length 2 → 12 total candidates

    it("returns 0% with 0 candidates when no guesses made", () => {
        const result = computeAiProgress(config, [0, 1], []);
        expect(result.percent).toBe(0);
        expect(result.candidates).toBe(0);
        expect(result.isSolved).toBe(false);
        expect(result.lastGuessUseless).toBe(false);
    });

    it("reduces candidates after a guess", () => {
        const code = [0, 3]; // top-left → bottom-right
        const result = computeAiProgress(config, code, [[0, 1]]);
        expect(result.candidates).toBeLessThan(12);
        expect(result.percent).toBeGreaterThan(0);
    });

    it("reaches exactly 100% and isSolved when the exact code is guessed", () => {
        const code = [0, 3];
        const result = computeAiProgress(config, code, [[0, 3]]);
        expect(result.candidates).toBe(1);
        expect(result.percent).toBe(100);
        expect(result.isSolved).toBe(true);
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
        expect(fresh.isSolved).toBe(false);
    });

    it("works with medium grid (3x3, length 4)", () => {
        const medConfig: GridConfig = { cols: 3, rows: 3, length: 4 };
        const code = [0, 1, 4, 3];
        const result = computeAiProgress(medConfig, code, [[0, 1, 2, 5]]);
        expect(result.candidates).toBeGreaterThan(0);
        expect(result.percent).toBeGreaterThan(0);
    });

    it("detects lastGuessUseless when a duplicate guess is made", () => {
        const code = [0, 3];
        // Two identical guesses — the second can't reduce candidates further
        const result = computeAiProgress(config, code, [[0, 1], [0, 1]]);
        expect(result.lastGuessUseless).toBe(true);
    });

    it("lastGuessUseless is false when a guess helps", () => {
        const code = [0, 3];
        const result = computeAiProgress(config, code, [[1, 2], [0, 1]]);
        expect(result.lastGuessUseless).toBe(false);
    });

    it("lastGuessUseless is false on the first guess", () => {
        const code = [0, 3];
        const result = computeAiProgress(config, code, [[0, 1]]);
        expect(result.lastGuessUseless).toBe(false);
    });
});

describe("getAiIndicatorColor", () => {
    it("returns success color when solved", () => {
        expect(getAiIndicatorColor(true, false)).toBe(AI_COLOR_SUCCESS);
    });

    it("returns success color even when flashRed is also true (solved takes priority)", () => {
        expect(getAiIndicatorColor(true, true)).toBe(AI_COLOR_SUCCESS);
    });

    it("returns danger color when flashRed is true and not solved", () => {
        expect(getAiIndicatorColor(false, true)).toBe(AI_COLOR_DANGER);
    });

    it("returns undefined when neither solved nor flashing", () => {
        expect(getAiIndicatorColor(false, false)).toBeUndefined();
    });
});

