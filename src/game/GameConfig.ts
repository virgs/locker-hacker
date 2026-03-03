export type Level = "easy" | "medium" | "hard";

export type GamePhase = "idle" | "playing";

export type PlayerCount = 1 | 2 | 3 | 4;

export interface GridConfig {
    cols   : number;
    rows   : number;
    length : number;
}

export const LEVEL_CONFIGS: Record<Level, GridConfig> = {
    easy   : { cols: 3, rows: 2, length: 3 },
    medium : { cols: 3, rows: 3, length: 4 },
    hard   : { cols: 4, rows: 4, length: 5 },
};

export const LEVEL_LABELS: Record<Level, string> = {
    easy   : "Easy",
    medium : "Medium",
    hard   : "Hard",
};

export const PLAYER_LABELS: Record<PlayerCount, string> = {
    1: "One player",
    2: "Two players",
    3: "Three players",
    4: "Four players",
};

export const ALL_LEVELS: Level[]             = ["easy", "medium", "hard"];
export const ALL_PLAYER_COUNTS: PlayerCount[] = [1, 2, 3, 4];

export const DEFAULT_LEVEL: Level             = "medium";
export const DEFAULT_PLAYER_COUNT: PlayerCount = 1;

