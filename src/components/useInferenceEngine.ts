import { useMemo } from "react";
import { InferenceEngine } from "../ai/InferenceEngine.ts";
import { GuessValidator } from "../game/GuessValidator.ts";
import type { GridConfig } from "../game/GameConfig.ts";
import type { Observation } from "../ai/types.ts";

export interface AiProgress {
    percent: number;    // 0..100 — how much of the candidate space has been eliminated
    candidates: number; // remaining candidate count
}

const INITIAL_PROGRESS: AiProgress = { percent: 0, candidates: 0 };

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
    }, [engine, code, pathHistory]);
};

export default useInferenceEngine;

