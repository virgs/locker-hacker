import type { GridConfig } from "../game/GameConfig.ts";
import type { Observation, InferenceSummary, Path } from "./types.ts";
import { generateCandidates } from "./CandidateGenerator.ts";
import { filterCandidates } from "./CandidateFilter.ts";
import { buildSummary } from "./SummaryBuilder.ts";

export class InferenceEngine {
    private readonly config: GridConfig;
    private readonly initialCandidates: ReadonlyArray<Path>;

    constructor(config: GridConfig) {
        this.config = config;
        this.initialCandidates = generateCandidates(config);
    }

    initialSummary(): InferenceSummary {
        return buildSummary(
            this.config,
            this.initialCandidates,
            this.initialCandidates.length,
        );
    }

    applyObservation(
        summary: InferenceSummary,
        observation: Observation,
    ): InferenceSummary {
        const candidates = filterCandidates(summary.candidates, observation);
        return buildSummary(
            this.config,
            candidates,
            summary.progress.initialCandidateCount,
        );
    }

    applyAll(observations: ReadonlyArray<Observation>): InferenceSummary {
        let summary = this.initialSummary();
        for (const obs of observations) {
            summary = this.applyObservation(summary, obs);
        }
        return summary;
    }
}

