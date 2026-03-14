import { useDeferredValue, useMemo } from "react";
import { InferenceEngine } from "../ai/InferenceEngine.ts";
import { GuessValidator } from "../game/GuessValidator.ts";
import type { GridConfig } from "../game/GameConfig.ts";
import type { Observation } from "../ai/types.ts";

export enum GuessQuality {
    Neutral  = "neutral",   // no guess made yet / first guess
    Bad      = "bad",       // no relative improvement
    Mediocre = "mediocre",  // some relative improvement (< 50%)
    Good     = "good",      // substantial relative improvement (≥ 50%)
}

/** Thresholds for relative candidate reduction (0..1). */
const GOOD_THRESHOLD = 0.5;
const MAX_AI_TOTAL_DOTS = 16;
const MAX_AI_CODE_LENGTH = 7;

export interface AiProgress {
    percent: number;              // 0..100 — how much of the candidate space has been eliminated
    percentDelta: number;         // change in percent from the previous guess (can be negative)
    candidates: number;           // remaining candidate count
    isSolved: boolean;            // true when exactly 1 candidate remains
    lastGuessQuality: GuessQuality;
}

const INITIAL_PROGRESS: AiProgress = {
    percent: 0,
    percentDelta: 0,
    candidates: 0,
    isSolved: false,
    lastGuessQuality: GuessQuality.Neutral,
};

const buildObservations = (code: number[], history: number[][]): Observation[] => {
    const validator = new GuessValidator(code);
    return history.map(guess => ({
        guess,
        feedback: validator.validate([...guess]),
    }));
};

export const classifyGuessQuality = (
    prevCandidates: number,
    currentCandidates: number,
): GuessQuality => {
    if (prevCandidates <= 0) return GuessQuality.Neutral;
    const relativeReduction = (prevCandidates - currentCandidates) / prevCandidates;
    if (relativeReduction <= 0) return GuessQuality.Bad;
    if (relativeReduction >= GOOD_THRESHOLD) return GuessQuality.Good;
    return GuessQuality.Mediocre;
};

export const supportsAiInference = (gridConfig: GridConfig): boolean =>
    (gridConfig.cols * gridConfig.rows) <= MAX_AI_TOTAL_DOTS &&
    gridConfig.length <= MAX_AI_CODE_LENGTH;

export const computeAiProgress = (
    engine: InferenceEngine,
    observations: Observation[],
): AiProgress => {
    if (observations.length === 0) return INITIAL_PROGRESS;

    let previousSummary = engine.initialSummary();
    let currentSummary = previousSummary;
    for (const observation of observations) {
        previousSummary = currentSummary;
        currentSummary = engine.applyObservation(currentSummary, observation);
    }

    const currentCandidates = currentSummary.progress.candidateCount;
    const isSolved = currentCandidates <= 1;
    const percent = isSolved ? 100 : currentSummary.progress.reducedPercent;
    const previousCandidates = observations.length === 1
        ? currentSummary.progress.initialCandidateCount
        : previousSummary.progress.candidateCount;
    const previousPercent = observations.length === 1
        ? 0
        : previousSummary.progress.reducedPercent;

    return {
        percent,
        percentDelta: percent - previousPercent,
        candidates: currentCandidates,
        isSolved,
        lastGuessQuality: classifyGuessQuality(previousCandidates, currentCandidates),
    };
};

const useInferenceEngine = (
    gridConfig: GridConfig,
    code: number[],
    pathHistory: number[][],
): AiProgress => {
    const aiSupported = supportsAiInference(gridConfig);
    const engine = useMemo(
        () => aiSupported ? new InferenceEngine(gridConfig) : null,
        [aiSupported, gridConfig],
    );
    const deferredPathHistory = useDeferredValue(pathHistory);

    return useMemo((): AiProgress => {
        if (!engine || deferredPathHistory.length === 0) return INITIAL_PROGRESS;

        const observations = buildObservations(code, deferredPathHistory);
        const progress = computeAiProgress(engine, observations);

        if (progress.isSolved) {
            const solvedSummary = engine.applyAll(observations);
            if (solvedSummary.candidates.length === 1) {
                console.log(
                    `🔓 AI is 100% confident. Predicted code: [${solvedSummary.candidates[0]!.join(", ")}]`,
                );
            }
        }

        return progress;
    }, [engine, code, deferredPathHistory]);
};

export default useInferenceEngine;
