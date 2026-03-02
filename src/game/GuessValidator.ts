export type Feedback = {
    bulls: number;
    cows: number;
};

export class GuessValidator {
    private readonly code: readonly number[];

    constructor(code: number[]) {
        this.code = [...code];
    }

    validate(guess: number[]): Feedback {
        const bulls  = this.code.filter((dot, i) => guess[i] === dot).length;
        const inBoth = this.code.filter(dot => guess.includes(dot)).length;
        return { bulls, cows: inBoth - bulls };
    }

    isSolved(guess: number[]): boolean {
        return this.validate(guess).bulls === this.code.length;
    }
}
