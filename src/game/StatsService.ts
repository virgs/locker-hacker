import { Level, ALL_LEVELS } from "./GameConfig.ts";

const STORAGE_KEY = "locker-hacker-stats";

export interface GameRecord {
    id              : string;
    level           : Level;
    won             : boolean;
    completed       : boolean;
    durationSeconds : number;
    moves           : number;
    hintsUsed       : number;
    date            : string;
}

export interface LevelStats {
    gamesPlayed    : number;
    wins           : number;
    totalSeconds   : number;
    totalMoves     : number;
    totalHints     : number;
}

const normalizeRecord = (record: Partial<GameRecord>, index: number): GameRecord => ({
    id              : typeof record.id === "string" && record.id.length > 0 ? record.id : `legacy-${index}-${record.date ?? "unknown"}`,
    level           : record.level as Level,
    won             : Boolean(record.won),
    completed       : typeof record.completed === "boolean" ? record.completed : true,
    durationSeconds : typeof record.durationSeconds === "number" ? record.durationSeconds : 0,
    moves           : typeof record.moves === "number" ? record.moves : 0,
    hintsUsed       : typeof record.hintsUsed === "number" ? record.hintsUsed : 0,
    date            : typeof record.date === "string" ? record.date : new Date(0).toISOString(),
});

export const loadRecords = (): GameRecord[] => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return (JSON.parse(raw) as Partial<GameRecord>[]).map(normalizeRecord);
    } catch {
        return [];
    }
};

export const createRecordId = (): string =>
    `record-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const saveRecord = (record: GameRecord): void => {
    const records = loadRecords();
    records.push(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

export const updateRecord = (recordId: string, updates: Partial<GameRecord>): void => {
    const records = loadRecords();
    const nextRecords = records.map(record =>
        record.id === recordId ? { ...record, ...updates, id: record.id } : record
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecords));
};

export const clearRecords = (): void => {
    console.log("Clearing records...");
    localStorage.removeItem(STORAGE_KEY);
};

export const filterVisibleStatsRecords = (records: GameRecord[], activeRecordId: string | null): GameRecord[] =>
    activeRecordId === null
        ? records
        : records.filter(record => record.completed || record.id !== activeRecordId);

export const computeLevelStats = (records: GameRecord[]): Record<Level, LevelStats> => {
    const result = {} as Record<Level, LevelStats>;
    for (const level of ALL_LEVELS) {
        const filtered = records.filter(r => r.level === level);
        result[level] = {
            gamesPlayed  : filtered.length,
            wins         : filtered.filter(r => r.won).length,
            totalSeconds : filtered.reduce((sum, r) => sum + r.durationSeconds, 0),
            totalMoves   : filtered.reduce((sum, r) => sum + (r.moves ?? 0), 0),
            totalHints   : filtered.reduce((sum, r) => sum + (r.hintsUsed ?? 0), 0),
        };
    }
    return result;
};

export const computeTotalStats = (records: GameRecord[]): LevelStats => ({
    gamesPlayed  : records.length,
    wins         : records.filter(r => r.won).length,
    totalSeconds : records.reduce((sum, r) => sum + r.durationSeconds, 0),
    totalMoves   : records.reduce((sum, r) => sum + (r.moves ?? 0), 0),
    totalHints   : records.reduce((sum, r) => sum + (r.hintsUsed ?? 0), 0),
});

export const winPercent = (stats: LevelStats): number =>
    stats.gamesPlayed === 0 ? 0 : (stats.wins / stats.gamesPlayed) * 100;

export const avgTimeSeconds = (stats: LevelStats): number =>
    stats.gamesPlayed === 0 ? 0 : stats.totalSeconds / stats.gamesPlayed;

export const avgMoves = (stats: LevelStats): number =>
    stats.gamesPlayed === 0 ? 0 : stats.totalMoves / stats.gamesPlayed;

export const avgHints = (stats: LevelStats): number =>
    stats.gamesPlayed === 0 ? 0 : stats.totalHints / stats.gamesPlayed;

export const formatStatsTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    const sWhole = Math.floor(s);
    return `${m}:${sWhole.toString().padStart(2, "0")}`;
};
