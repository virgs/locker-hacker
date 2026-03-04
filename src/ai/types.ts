import type { Feedback } from "../game/GuessValidator.ts";

export type DotId = number;
export type Path = ReadonlyArray<DotId>;

export type Observation = Readonly<{
    guess: Path;
    feedback: Feedback;
}>;

export type Progress = Readonly<{
    candidateCount: number;
    initialCandidateCount: number;
    solvedPercent: number;
    reducedPercent: number;
    positionCertaintyPercent: number;
}>;

export type InferenceSummary = Readonly<{
    candidates: ReadonlyArray<Path>;
    domains: ReadonlyArray<ReadonlySet<DotId>>;
    mustHave: ReadonlySet<DotId>;
    mustNotHave: ReadonlySet<DotId>;
    progress: Progress;
}>;

