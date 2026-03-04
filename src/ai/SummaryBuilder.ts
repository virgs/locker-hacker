import type { GridConfig } from "../game/GameConfig.ts";
import type { DotId, Path, Progress, InferenceSummary } from "./types.ts";
import { dotCount } from "../math/grid.ts";

const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));

const computeDomains = (
    length: number,
    candidates: ReadonlyArray<Path>,
): ReadonlyArray<ReadonlySet<DotId>> => {
    const domains: Set<DotId>[] = Array.from({ length }, () => new Set());
    for (const c of candidates) {
        for (let i = 0; i < length; i++) domains[i]!.add(c[i]!);
    }
    return domains;
};

const computeMustHave = (candidates: ReadonlyArray<Path>): ReadonlySet<DotId> => {
    if (candidates.length === 0) return new Set();
    const result = new Set<DotId>(candidates[0]!);
    for (let i = 1; i < candidates.length; i++) {
        const current = new Set<DotId>(candidates[i]!);
        for (const d of [...result]) {
            if (!current.has(d)) result.delete(d);
        }
    }
    return result;
};

const computeMustNotHave = (
    config: GridConfig,
    candidates: ReadonlyArray<Path>,
): ReadonlySet<DotId> => {
    const used = new Set<DotId>();
    for (const c of candidates) for (const d of c) used.add(d);
    const total = dotCount(config.cols, config.rows);
    const out = new Set<DotId>();
    for (let d = 0; d < total; d++) {
        if (!used.has(d)) out.add(d);
    }
    return out;
};

const computeProgress = (
    initialCount: number,
    candidates: ReadonlyArray<Path>,
    domains: ReadonlyArray<ReadonlySet<DotId>>,
): Progress => {
    const current = candidates.length;

    const reducedPercent = initialCount <= 0
        ? 0
        : clamp01(1 - current / initialCount) * 100;

    const solvedPercent = initialCount <= 1
        ? (current === 1 ? 100 : 0)
        : clamp01(1 - (current - 1) / (initialCount - 1)) * 100;

    const positionCertaintyPercent = domains.length === 0
        ? 0
        : (domains.reduce((sum, d) => sum + 1 / Math.max(1, d.size), 0)
            / domains.length) * 100;

    return {
        candidateCount: current,
        initialCandidateCount: initialCount,
        solvedPercent,
        reducedPercent,
        positionCertaintyPercent,
    };
};

export const buildSummary = (
    config: GridConfig,
    candidates: ReadonlyArray<Path>,
    initialCount: number,
): InferenceSummary => {
    const domains    = computeDomains(config.length, candidates);
    const mustHave   = computeMustHave(candidates);
    const mustNotHave = computeMustNotHave(config, candidates);
    const progress   = computeProgress(initialCount, candidates, domains);
    return { candidates, domains, mustHave, mustNotHave, progress };
};

