import { GamePhase } from "../game/GameConfig.ts";

/**
 * Returns the pathColor to apply to the PatternLock when the game ends.
 * Win  → bootstrap success (persistent until next game)
 * Lose → bootstrap danger (persistent until next game)
 */
const useEndGameColor = (phase: GamePhase, winner: number | null): string | undefined => {
    if (phase !== GamePhase.Revealing) return undefined;
    return winner !== null ? "var(--bs-success)" : "var(--bs-danger)";
};

export default useEndGameColor;
