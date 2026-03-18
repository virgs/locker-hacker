export const BUILD_LABEL_RESET_TAP_TARGET = 7;
export const BUILD_LABEL_RESET_WINDOW_MS = 5_000;

interface StatsSummaryInput {
    gamesPlayed: number;
    wins: number;
    totalSeconds: number;
}

interface StatsSummaryParts {
    games: string;
    wins: number;
    abandoned: number;
    winRate: string;
    playTime: string;
}

export const shouldClearStatsFromBuildTaps = (
    tapCount: number,
    requiredTapCount = BUILD_LABEL_RESET_TAP_TARGET,
): boolean => tapCount >= requiredTapCount;

const pluralize = (count: number, singular: string, plural = `${singular}s`): string =>
    `${count} ${count === 1 ? singular : plural}`;

const joinTimeParts = (parts: string[]): string =>
    parts.length < 2 ? parts[0] : `${parts[0]} and ${parts[1]}`;

export const formatPlayTime = (totalSeconds: number): string => {
    const totalMinutes = Math.round(totalSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0) return pluralize(minutes, "minute");
    if (minutes === 0) return pluralize(hours, "hour");
    return joinTimeParts([pluralize(hours, "hour"), pluralize(minutes, "minute")]);
};

export const buildStatsSummaryParts = ({
    gamesPlayed,
    wins,
    totalSeconds,
}: StatsSummaryInput): StatsSummaryParts => {
    const abandoned = Math.max(gamesPlayed - wins, 0);
    const winRate = gamesPlayed === 0 ? 0 : (wins / gamesPlayed) * 100;
    return {
        games: pluralize(gamesPlayed, "game"),
        wins,
        abandoned,
        winRate: `${winRate.toFixed(1)}%`,
        playTime: formatPlayTime(totalSeconds),
    };
};

export const formatStatsSummary = ({
    gamesPlayed,
    wins,
    totalSeconds,
}: StatsSummaryInput): string => {
    if (gamesPlayed === 0) return "No completed games yet. Play a round to start building your stats.";

    const summary = buildStatsSummaryParts({ gamesPlayed, wins, totalSeconds });
    return `Across ${summary.games}, you won ${summary.wins}, abandoned ${summary.abandoned}, and spent ${summary.playTime} playing. Your overall win rate is ${summary.winRate}.`;
};
