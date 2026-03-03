import { Level, ALL_LEVELS } from "./GameConfig.ts";

const STORAGE_KEY = "locker-hacker-stats";

export interface GameRecord {
    level           : Level;
    won             : boolean;
    durationSeconds : number;
    date            : string;
}

export interface LevelStats {
    gamesPlayed    : number;
    wins           : number;
    totalSeconds   : number;
}

export const loadRecords = (): GameRecord[] => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as GameRecord[];
    } catch {
        return [];
    }
};

export const saveRecord = (record: GameRecord): void => {
    const records = loadRecords();
    records.push(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

export const clearRecords = (): void => {
    localStorage.removeItem(STORAGE_KEY);
};

export const computeLevelStats = (records: GameRecord[]): Record<Level, LevelStats> => {
    const result = {} as Record<Level, LevelStats>;
    for (const level of ALL_LEVELS) {
        const filtered = records.filter(r => r.level === level);
        result[level] = {
            gamesPlayed  : filtered.length,
            wins         : filtered.filter(r => r.won).length,
            totalSeconds : filtered.reduce((sum, r) => sum + r.durationSeconds, 0),
        };
    }
    return result;
};

export const computeTotalStats = (records: GameRecord[]): LevelStats => ({
    gamesPlayed  : records.length,
    wins         : records.filter(r => r.won).length,
    totalSeconds : records.reduce((sum, r) => sum + r.durationSeconds, 0),
});

export const winPercent = (stats: LevelStats): number =>
    stats.gamesPlayed === 0 ? 0 : Math.round((stats.wins / stats.gamesPlayed) * 100);

export const avgTimeSeconds = (stats: LevelStats): number =>
    stats.gamesPlayed === 0 ? 0 : stats.totalSeconds / stats.gamesPlayed;

export const formatStatsTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    const sWhole = Math.floor(s);
    const ds = Math.floor((s - sWhole) * 10);
    return `${m}:${sWhole.toString().padStart(2, "0")}.${ds}`;
};

