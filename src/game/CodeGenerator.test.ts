import { CodeGenerator } from './CodeGenerator.ts';
import { getPointsInTheMiddle } from '../math/math.ts';

const isValidPath = (path: number[], cols: number): boolean => {
    for (let i = 0; i < path.length - 1; i++) {
        const visited = new Set(path.slice(0, i + 1));
        const mid = getPointsInTheMiddle(path[i], path[i + 1], cols);
        if (!mid.every(m => visited.has(m))) return false;
    }
    return true;
};

const RUNS = 20;

describe('CodeGenerator', () => {
    describe('constructor', () => {
        it('Should throw when length exceeds total dots', () => {
            expect(() => new CodeGenerator({ cols: 3, rows: 3, length: 10 })).toThrow();
        });

        it('Should not throw for valid parameters', () => {
            expect(() => new CodeGenerator({ cols: 3, rows: 3, length: 9 })).not.toThrow();
            expect(() => new CodeGenerator({ cols: 5, rows: 5, length: 1 })).not.toThrow();
        });
    });

    describe('generate', () => {
        it('Should produce a code of the requested length', () => {
            const gen = new CodeGenerator({ cols: 3, rows: 3, length: 4 });
            for (let i = 0; i < RUNS; i++) {
                expect(gen.generate()).toHaveLength(4);
            }
        });

        it('Should produce no repeated dots', () => {
            const gen = new CodeGenerator({ cols: 4, rows: 4, length: 5 });
            for (let i = 0; i < RUNS; i++) {
                const code = gen.generate();
                expect(new Set(code).size).toBe(code.length);
            }
        });

        it('Should produce dots within valid index range', () => {
            const cols = 3, rows = 3;
            const gen = new CodeGenerator({ cols, rows, length: 4 });
            for (let i = 0; i < RUNS; i++) {
                gen.generate().forEach(dot => {
                    expect(dot).toBeGreaterThanOrEqual(0);
                    expect(dot).toBeLessThan(cols * rows);
                });
            }
        });

        it('Should produce only valid moves — no illegal jumps over unvisited dots', () => {
            const cols = 3;
            const gen = new CodeGenerator({ cols, rows: 3, length: 4 });
            for (let i = 0; i < RUNS; i++) {
                expect(isValidPath(gen.generate(), cols)).toBe(true);
            }
        });

        it('Should work for a length-1 code', () => {
            const gen = new CodeGenerator({ cols: 3, rows: 3, length: 1 });
            for (let i = 0; i < RUNS; i++) {
                const code = gen.generate();
                expect(code).toHaveLength(1);
                expect(code[0]).toBeGreaterThanOrEqual(0);
                expect(code[0]).toBeLessThan(9);
            }
        });

        it('Should produce valid paths on a rectangular (non-square) board', () => {
            const cols = 4, rows = 3;
            const gen = new CodeGenerator({ cols, rows, length: 5 });
            for (let i = 0; i < RUNS; i++) {
                const code = gen.generate();
                expect(code).toHaveLength(5);
                expect(new Set(code).size).toBe(5);
                expect(isValidPath(code, cols)).toBe(true);
            }
        });
    });
});
