import { useMemo } from "react";
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

export interface AiProgress {
    percent: number;              // 0..100 — how much of the candidate space has been eliminated
    candidates: number;           // remaining candidate count
    isSolved: boolean;            // true when exactly 1 candidate remains
    lastGuessQuality: GuessQuality;
}

const INITIAL_PROGRESS: AiProgress = {
    percent: 0,
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

const useInferenceEngine = (
    gridConfig: GridConfig,
    code: number[],
    pathHistory: number[][],
): AiProgress => {
    const engine = useMemo(
        () => new InferenceEngine(gridConfig),
        [gridConfig],
    );

    return useMemo((): AiProgress => {
        if (pathHistory.length === 0) return INITIAL_PROGRESS;

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
    }, [engine, code, pathHistory]);
};

export default useInferenceEngine;

