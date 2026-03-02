import { getPointsInTheMiddle } from '../math/math.ts';

export class CodeGenerator {
    private readonly cols      : number;
    private readonly length    : number;
    private readonly totalDots : number;

    constructor({ cols, rows, length }: { cols: number; rows: number; length: number }) {
        if (length > cols * rows) {
            throw new Error(`Code length ${length} exceeds available dots (${cols * rows})`);
        }
        this.cols      = cols;
        this.length    = length;
        this.totalDots = cols * rows;
    }

    generate(): number[] {
        let result: number[] | null = null;
        while (!result) {
            result = this.tryGenerate();
        }
        return result;
    }

    private tryGenerate(): number[] | null {
        const path = [Math.floor(Math.random() * this.totalDots)];
        while (path.length < this.length) {
            const candidates = this.validNextDots(path);
            if (!candidates.length) return null;
            path.push(candidates[Math.floor(Math.random() * candidates.length)]);
        }
        return path;
    }

    private validNextDots(path: number[]): number[] {
        const visited = new Set(path);
        return Array.from({ length: this.totalDots }, (_, i) => i).filter(dot => {
            if (visited.has(dot)) return false;
            const mid = getPointsInTheMiddle(path[path.length - 1], dot, this.cols);
            return mid.every(m => visited.has(m));
        });
    }
}
