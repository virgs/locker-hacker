export const toOrdinal = (n: number): string => {
    const mod100 = n % 100;
    const mod10  = n % 10;
    if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
    if (mod10 === 1) return `${n}st`;
    if (mod10 === 2) return `${n}nd`;
    if (mod10 === 3) return `${n}rd`;
    return `${n}th`;
};

export const formatGuessLabel = (guessNumber: number): string =>
    // `${toOrdinal(guessNumber)} attempt`;
    `${guessNumber} guess${guessNumber > 1 ? 'es' : ''}`;
