import type { GridConfig } from "../game/GameConfig.ts";
import type { DotId, Path } from "./types.ts";
import { getPointsInTheMiddle } from "../math/math.ts";
import { dotCount } from "../math/grid.ts";

const isLegalMove = (from: DotId, to: DotId, visited: ReadonlySet<DotId>, cols: number): boolean => {
    if (visited.has(to)) return false;
    return getPointsInTheMiddle(from, to, cols).every(m => visited.has(m));
};

const dfs = (
    config: GridConfig,
    total: number,
    current: DotId[],
    visited: Set<DotId>,
    out: Path[],
): void => {
    if (current.length === config.length) {
        out.push([...current]);
        return;
    }
    const from = current[current.length - 1]!;
    for (let to = 0; to < total; to++) {
        if (isLegalMove(from, to, visited, config.cols)) {
            visited.add(to);
            current.push(to);
            dfs(config, total, current, visited, out);
            current.pop();
            visited.delete(to);
        }
    }
};

export const generateCandidates = (config: GridConfig): ReadonlyArray<Path> => {
    const total = dotCount(config.cols, config.rows);
    const out: Path[] = [];
    for (let start = 0; start < total; start++) {
        dfs(config, total, [start], new Set([start]), out);
    }
    return out;
};

