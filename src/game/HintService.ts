export interface PickEliminationHintInput {
    totalDots: number;
    code: number[];
    alreadyEliminated: number[];
    random?: () => number;
}

const unique = (items: number[]): number[] => [...new Set(items)];

export const getEliminationHintCandidates = ({
    totalDots,
    code,
    alreadyEliminated,
}: Omit<PickEliminationHintInput, "random">): number[] => {
    const forbidden = new Set(unique([...code, ...alreadyEliminated]));
    const pool: number[] = [];

    for (let dot = 0; dot < totalDots; dot += 1) {
        if (!forbidden.has(dot)) pool.push(dot);
    }

    return pool;
};

export const hasEliminationHintCandidates = (input: Omit<PickEliminationHintInput, "random">): boolean =>
    getEliminationHintCandidates(input).length > 0;

export const pickEliminationHint = ({
    totalDots,
    code,
    alreadyEliminated,
    random = Math.random,
}: PickEliminationHintInput): number | null => {
    const pool = getEliminationHintCandidates({ totalDots, code, alreadyEliminated });
    if (pool.length === 0) return null;

    const index = Math.floor(random() * pool.length);
    return pool[index] ?? null;
};
