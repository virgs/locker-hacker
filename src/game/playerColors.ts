export const PLAYER_COLORS: Readonly<Record<number, string>> = {
    1: 'var(--bs-primary)',
    2: 'var(--bs-success)',
    3: 'var(--bs-warning)',
    4: 'var(--bs-info)',
};

export const getPlayerColor = (player: number): string =>
    PLAYER_COLORS[player] ?? 'white';
