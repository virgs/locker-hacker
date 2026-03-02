import { GuessValidator } from './GuessValidator.ts';

describe('GuessValidator', () => {
    describe('validate', () => {
        it('Should return full bulls and zero cows for an exact match', () => {
            const v = new GuessValidator([0, 1, 2, 3]);
            expect(v.validate([0, 1, 2, 3])).toEqual({ bulls: 4, cows: 0 });
        });

        it('Should return zero bulls and zero cows when nothing matches', () => {
            const v = new GuessValidator([0, 1, 2, 3]);
            expect(v.validate([4, 5, 6, 7])).toEqual({ bulls: 0, cows: 0 });
        });

        it('Should return zero bulls and full cows when all dots present but all shifted', () => {
            // code: [0,1,2,3], guess: [1,2,3,0] — every dot appears but none in the right spot
            const v = new GuessValidator([0, 1, 2, 3]);
            expect(v.validate([1, 2, 3, 0])).toEqual({ bulls: 0, cows: 4 });
        });

        it('Should compute the rules.md example correctly (A=0, B=1, C=2, D=3, E=4)', () => {
            // Secret: A→B→C→D  Guess: A→C→B→E
            // Bulls=1 (A at pos 0), Cows=2 (B and C appear in both but swapped)
            const v = new GuessValidator([0, 1, 2, 3]);
            expect(v.validate([0, 2, 1, 4])).toEqual({ bulls: 1, cows: 2 });
        });

        it('Should count only bulls when guess is a subset match at correct positions', () => {
            const v = new GuessValidator([0, 1, 2, 3]);
            expect(v.validate([0, 5, 2, 6])).toEqual({ bulls: 2, cows: 0 });
        });

        it('Should not double-count a dot as both a bull and a cow', () => {
            // code: [0,1,2], guess: [0,0,0] — dot 0 is a bull at position 0; should not also be a cow
            const v = new GuessValidator([0, 1, 2]);
            const result = v.validate([0, 0, 0]);
            expect(result.bulls).toBe(1);
            expect(result.cows).toBe(0);
        });

        it('Should work for a code of length 1', () => {
            const v = new GuessValidator([5]);
            expect(v.validate([5])).toEqual({ bulls: 1, cows: 0 });
            expect(v.validate([3])).toEqual({ bulls: 0, cows: 0 });
        });
    });

    describe('isSolved', () => {
        it('Should return true when guess exactly matches the code', () => {
            const v = new GuessValidator([0, 1, 2, 3]);
            expect(v.isSolved([0, 1, 2, 3])).toBe(true);
        });

        it('Should return false for a partial match', () => {
            const v = new GuessValidator([0, 1, 2, 3]);
            expect(v.isSolved([0, 1, 2, 4])).toBe(false);
        });

        it('Should return false when there are only cows', () => {
            const v = new GuessValidator([0, 1, 2, 3]);
            expect(v.isSolved([1, 2, 3, 0])).toBe(false);
        });
    });
});
