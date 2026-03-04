import { buildSummary } from "./SummaryBuilder.ts";
import type { GridConfig } from "../game/GameConfig.ts";
import type { Path } from "./types.ts";

const config: GridConfig = { cols: 3, rows: 3, length: 3 };

describe("buildSummary", () => {
    describe("domains", () => {
        it("computes per-position domain sets from candidates", () => {
            const candidates: Path[] = [
                [0, 1, 2],
                [0, 3, 4],
                [5, 1, 6],
            ];
            const summary = buildSummary(config, candidates, 10);
            expect(summary.domains).toHaveLength(3);
            expect(summary.domains[0]).toEqual(new Set([0, 5]));
            expect(summary.domains[1]).toEqual(new Set([1, 3]));
            expect(summary.domains[2]).toEqual(new Set([2, 4, 6]));
        });

        it("returns empty domains when no candidates", () => {
            const summary = buildSummary(config, [], 10);
            expect(summary.domains).toHaveLength(3);
            summary.domains.forEach(d => expect(d.size).toBe(0));
        });
    });

    describe("mustHave", () => {
        it("returns dots present in every candidate", () => {
            const candidates: Path[] = [
                [0, 1, 2],
                [0, 1, 3],
                [0, 1, 4],
            ];
            const summary = buildSummary(config, candidates, 10);
            expect(summary.mustHave).toEqual(new Set([0, 1]));
        });

        it("returns empty set when no dot is in all candidates", () => {
            const candidates: Path[] = [
                [0, 1, 2],
                [3, 4, 5],
            ];
            const summary = buildSummary(config, candidates, 10);
            expect(summary.mustHave.size).toBe(0);
        });

        it("returns empty set when candidates is empty", () => {
            const summary = buildSummary(config, [], 10);
            expect(summary.mustHave.size).toBe(0);
        });
    });

    describe("mustNotHave", () => {
        it("returns dots that appear in no candidate", () => {
            const candidates: Path[] = [
                [0, 1, 2],
                [0, 1, 3],
            ];
            const summary = buildSummary(config, candidates, 10);
            // dots 4,5,6,7,8 never appear
            expect(summary.mustNotHave).toEqual(new Set([4, 5, 6, 7, 8]));
        });

        it("returns all dots when candidates is empty", () => {
            const summary = buildSummary(config, [], 10);
            expect(summary.mustNotHave.size).toBe(9);
        });
    });

    describe("progress", () => {
        it("reports 100% solved when one candidate remains", () => {
            const candidates: Path[] = [[0, 1, 2]];
            const summary = buildSummary(config, candidates, 100);
            expect(summary.progress.solvedPercent).toBeCloseTo(100);
            expect(summary.progress.candidateCount).toBe(1);
            expect(summary.progress.initialCandidateCount).toBe(100);
        });

        it("reports 0% solved when all candidates remain", () => {
            const candidates: Path[] = [[0, 1, 2], [3, 4, 5]];
            const summary = buildSummary(config, candidates, 2);
            expect(summary.progress.solvedPercent).toBeCloseTo(0);
        });

        it("reports reducedPercent based on how much the set shrank", () => {
            const candidates: Path[] = [[0, 1, 2]];
            const summary = buildSummary(config, candidates, 10);
            expect(summary.progress.reducedPercent).toBeCloseTo(90);
        });

        it("reports 100% position certainty when all domains have size 1", () => {
            const candidates: Path[] = [[0, 1, 2]];
            const summary = buildSummary(config, candidates, 1);
            expect(summary.progress.positionCertaintyPercent).toBeCloseTo(100);
        });

        it("reports 100% position certainty when no candidates (domains are empty)", () => {
            // Each empty domain has size 0, clamped to 1 → 1/1 = 100% per position
            const summary = buildSummary(config, [], 10);
            expect(summary.progress.positionCertaintyPercent).toBeCloseTo(100);
        });
    });

    it("passes candidates through unchanged", () => {
        const candidates: Path[] = [[0, 1, 2], [3, 4, 5]];
        const summary = buildSummary(config, candidates, 10);
        expect(summary.candidates).toBe(candidates);
    });
});

