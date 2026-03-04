import { generateCandidates } from "./CandidateGenerator.ts";
import type { GridConfig } from "../game/GameConfig.ts";
import { getPointsInTheMiddle } from "../math/math.ts";

const isValidPath = (path: ReadonlyArray<number>, config: GridConfig): boolean => {
    const visited = new Set<number>();
    for (let i = 0; i < path.length; i++) {
        const dot = path[i]!;
        if (visited.has(dot)) return false;
        if (i > 0) {
            const from = path[i - 1]!;
            const mids = getPointsInTheMiddle(from, dot, config.cols);
            if (!mids.every(m => visited.has(m))) return false;
        }
        visited.add(dot);
    }
    return true;
};

describe("generateCandidates", () => {
    it("generates valid paths for a 2x2 grid with length 2", () => {
        const config: GridConfig = { cols: 2, rows: 2, length: 2 };
        const candidates = generateCandidates(config);

        expect(candidates.length).toBeGreaterThan(0);
        for (const path of candidates) {
            expect(path).toHaveLength(2);
            expect(isValidPath(path, config)).toBe(true);
        }
    });

    it("generates all 12 permutations for a 2x2 grid with length 2", () => {
        const config: GridConfig = { cols: 2, rows: 2, length: 2 };
        const candidates = generateCandidates(config);
        // 4 dots, pick 2 in order = 4*3 = 12
        expect(candidates).toHaveLength(12);
    });

    it("generates no duplicates", () => {
        const config: GridConfig = { cols: 3, rows: 2, length: 3 };
        const candidates = generateCandidates(config);
        const serialized = candidates.map(p => p.join(","));
        expect(new Set(serialized).size).toBe(serialized.length);
    });

    it("all paths have the correct length", () => {
        const config: GridConfig = { cols: 3, rows: 3, length: 4 };
        const candidates = generateCandidates(config);
        for (const path of candidates) {
            expect(path).toHaveLength(4);
        }
    });

    it("all paths contain only valid dot ids", () => {
        const config: GridConfig = { cols: 3, rows: 3, length: 3 };
        const candidates = generateCandidates(config);
        const maxId = config.cols * config.rows - 1;
        for (const path of candidates) {
            for (const dot of path) {
                expect(dot).toBeGreaterThanOrEqual(0);
                expect(dot).toBeLessThanOrEqual(maxId);
            }
        }
    });

    it("all paths are valid (no illegal moves)", () => {
        const config: GridConfig = { cols: 3, rows: 3, length: 3 };
        const candidates = generateCandidates(config);
        for (const path of candidates) {
            expect(isValidPath(path, config)).toBe(true);
        }
    });

    it("respects the no-skip rule (e.g., 0→2 is invalid on 3-col grid without 1 visited)", () => {
        const config: GridConfig = { cols: 3, rows: 3, length: 2 };
        const candidates = generateCandidates(config);
        const has02 = candidates.some(p => p[0] === 0 && p[1] === 2);
        expect(has02).toBe(false);
    });
});

