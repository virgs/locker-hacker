import { InferenceEngine } from "../ai/InferenceEngine.ts";
import { GuessValidator } from "../game/GuessValidator.ts";
import type { GridConfig } from "../game/GameConfig.ts";
import type { Observation } from "../ai/types.ts";
import {
    getAiIndicatorColor,
    AI_COLOR_SUCCESS,
    AI_COLOR_DANGER,
    AI_COLOR_WARNING,
} from "./Footer.utils.ts";
import { GuessQuality, classifyGuessQuality } from "./useInferenceEngine.ts";

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
): { percent: number; candidates: number; isSolved: boolean; lastGuessQuality: GuessQuality } => {
    if (pathHistory.length === 0) {
        return { percent: 0, candidates: 0, isSolved: false, lastGuessQuality: GuessQuality.Neutral };
    }

    const engine = new InferenceEngine(gridConfig);
    const observations = buildObservations(code, pathHistory);
    const summary = engine.applyAll(observations);
    const currentCandidates = summary.progress.candidateCount;
    const isSolved = currentCandidates <= 1;
    const percent = isSolved ? 100 : summary.progress.reducedPercent;

    let lastGuessQuality = GuessQuality.Neutral;
    if (pathHistory.length >= 2) {
        const prevObservations = observations.slice(0, -1);
        const prevSummary = engine.applyAll(prevObservations);
        lastGuessQuality = classifyGuessQuality(
            prevSummary.progress.candidateCount,
            currentCandidates,
        );
    }

    return { percent, candidates: currentCandidates, isSolved, lastGuessQuality };
};

describe("AI progress computation", () => {
    const config: GridConfig = { cols: 2, rows: 2, length: 2 };

    it("returns 0% with 0 candidates when no guesses made", () => {
        const result = computeAiProgress(config, [0, 1], []);
        expect(result.percent).toBe(0);
        expect(result.candidates).toBe(0);
        expect(result.isSolved).toBe(false);
        expect(result.lastGuessQuality).toBe(GuessQuality.Neutral);
    });

    it("reduces candidates after a guess", () => {
        const code = [0, 3];
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

    it("classifies duplicate guess as Bad quality", () => {
        const code = [0, 3];
        const result = computeAiProgress(config, code, [[0, 1], [0, 1]]);
        expect(result.lastGuessQuality).toBe(GuessQuality.Bad);
    });

    it("lastGuessQuality is Neutral on the first guess", () => {
        const code = [0, 3];
        const result = computeAiProgress(config, code, [[0, 1]]);
        expect(result.lastGuessQuality).toBe(GuessQuality.Neutral);
    });
});

describe("classifyGuessQuality", () => {
    it("returns Neutral when prevCandidates is 0", () => {
        expect(classifyGuessQuality(0, 0)).toBe(GuessQuality.Neutral);
    });

    it("returns Neutral when prevCandidates is negative", () => {
        expect(classifyGuessQuality(-1, 0)).toBe(GuessQuality.Neutral);
    });

    it("returns Bad when candidates increased", () => {
        expect(classifyGuessQuality(10, 12)).toBe(GuessQuality.Bad);
    });

    it("returns Bad when candidates stayed the same", () => {
        expect(classifyGuessQuality(10, 10)).toBe(GuessQuality.Bad);
    });

    it("returns Mediocre for small relative reduction (< 50%)", () => {
        // 100 → 80 = 20% reduction
        expect(classifyGuessQuality(100, 80)).toBe(GuessQuality.Mediocre);
    });

    it("returns Mediocre just below the 50% threshold", () => {
        // 100 → 51 = 49% reduction
        expect(classifyGuessQuality(100, 51)).toBe(GuessQuality.Mediocre);
    });

    it("returns Good at exactly 50% reduction", () => {
        expect(classifyGuessQuality(100, 50)).toBe(GuessQuality.Good);
    });

    it("returns Good for large relative reduction", () => {
        // 100 → 10 = 90% reduction
        expect(classifyGuessQuality(100, 10)).toBe(GuessQuality.Good);
    });

    it("returns Good when all candidates eliminated", () => {
        expect(classifyGuessQuality(100, 0)).toBe(GuessQuality.Good);
    });

    it("treats relative reduction consistently regardless of scale", () => {
        // 0→50% and 98→99% are both ~50% relative reduction of remaining space
        // 1000 → 500 = 50% relative reduction
        const bigScale = classifyGuessQuality(1000, 500);
        // 4 → 2 = 50% relative reduction
        const smallScale = classifyGuessQuality(4, 2);
        expect(bigScale).toBe(smallScale);
        expect(bigScale).toBe(GuessQuality.Good);
    });

    it("returns Bad for a tiny reduction (1 out of 1000)", () => {
        expect(classifyGuessQuality(1000, 999)).toBe(GuessQuality.Mediocre);
    });
});

describe("getAiIndicatorColor", () => {
    it("returns success color when solved", () => {
        expect(getAiIndicatorColor(true, GuessQuality.Neutral)).toBe(AI_COLOR_SUCCESS);
    });

    it("returns success color even when flashQuality is Bad (solved takes priority)", () => {
        expect(getAiIndicatorColor(true, GuessQuality.Bad)).toBe(AI_COLOR_SUCCESS);
    });

    it("returns danger color for Bad quality", () => {
        expect(getAiIndicatorColor(false, GuessQuality.Bad)).toBe(AI_COLOR_DANGER);
    });

    it("returns warning color for Mediocre quality", () => {
        expect(getAiIndicatorColor(false, GuessQuality.Mediocre)).toBe(AI_COLOR_WARNING);
    });

    it("returns success color for Good quality", () => {
        expect(getAiIndicatorColor(false, GuessQuality.Good)).toBe(AI_COLOR_SUCCESS);
    });

    it("returns undefined for Neutral quality when not solved", () => {
        expect(getAiIndicatorColor(false, GuessQuality.Neutral)).toBeUndefined();
    });
});

