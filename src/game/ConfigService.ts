import { Level, PlayerCount, ALL_LEVELS, ALL_PLAYER_COUNTS } from "./GameConfig.ts";

const CONFIG_KEY = "locker-hacker-config";

export interface GameConfig {
    level       : Level;
    playerCount : PlayerCount;
}

export const parseConfig = (raw: string | null): Partial<GameConfig> => {
    if (!raw) return {};
    try {
        const parsed = JSON.parse(raw) as Partial<GameConfig>;
        return {
            level:       ALL_LEVELS.includes(parsed.level as Level)             ? parsed.level       : undefined,
            playerCount: ALL_PLAYER_COUNTS.includes(parsed.playerCount as PlayerCount) ? parsed.playerCount : undefined,
        };
    } catch {
        return {};
    }
};

export const loadConfig = (): Partial<GameConfig> =>
    parseConfig(localStorage.getItem(CONFIG_KEY));

export const saveConfig = (config: GameConfig): void => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
};
