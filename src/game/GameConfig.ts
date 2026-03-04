export enum GamePhase {
    Playing   = "playing",
    Revealing = "revealing",
}

export enum Level {
    Easy   = "easy",
    Medium = "medium",
    Hard   = "hard",
}

export enum PlayerCount {
    One   = 1,
    Two   = 2,
    Three = 3,
    Four  = 4,
}

export interface GridConfig {
    cols   : number;
    rows   : number;
    length : number;
}

export const LEVEL_CONFIGS: Record<Level, GridConfig> = {
    [Level.Easy]  : { cols: 3, rows: 2, length: 3 },
    [Level.Medium]: { cols: 3, rows: 3, length: 4 },
    [Level.Hard]  : { cols: 4, rows: 4, length: 5 },
};

export const LEVEL_LABELS: Record<Level, string> = {
    [Level.Easy]  : "Easy",
    [Level.Medium]: "Medium",
    [Level.Hard]  : "Hard",
};

export const LEVEL_LABELS_SHORT: Record<Level, string> = {
    [Level.Easy]  : "E",
    [Level.Medium]: "M",
    [Level.Hard]  : "H",
};

export const PLAYER_LABELS: Record<PlayerCount, string> = {
    [PlayerCount.One]  : "1 player",
    [PlayerCount.Two]  : "2 players",
    [PlayerCount.Three]: "3 players",
    [PlayerCount.Four] : "4 players",
};

export const ALL_LEVELS: Level[] = [Level.Easy, Level.Medium, Level.Hard];

export const ALL_PLAYER_COUNTS: PlayerCount[] = [
    PlayerCount.One,
    PlayerCount.Two,
    PlayerCount.Three,
    PlayerCount.Four,
];

export const ALL_GAME_PHASES: GamePhase[] = [
    GamePhase.Playing,
    GamePhase.Revealing,
];

export const DEFAULT_LEVEL: Level              = Level.Medium;
export const DEFAULT_PLAYER_COUNT: PlayerCount = PlayerCount.One;
