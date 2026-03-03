export enum GamePhase {
    Idle      = "idle",
    Playing   = "playing",
    Revealing = "revealing",
    GameOver  = "game-over",
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

export const PLAYER_LABELS: Record<PlayerCount, string> = {
    [PlayerCount.One]  : "One player",
    [PlayerCount.Two]  : "Two players",
    [PlayerCount.Three]: "Three players",
    [PlayerCount.Four] : "Four players",
};

export const ALL_LEVELS: Level[] = [Level.Easy, Level.Medium, Level.Hard];

export const ALL_PLAYER_COUNTS: PlayerCount[] = [
    PlayerCount.One,
    PlayerCount.Two,
    PlayerCount.Three,
    PlayerCount.Four,
];

export const ALL_GAME_PHASES: GamePhase[] = [
    GamePhase.Idle,
    GamePhase.Playing,
    GamePhase.Revealing,
    GamePhase.GameOver,
];

export const DEFAULT_LEVEL: Level              = Level.Medium;
export const DEFAULT_PLAYER_COUNT: PlayerCount = PlayerCount.One;
