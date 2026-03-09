import { useEffect, useState } from "react";
import { GamePhase } from "../game/GameConfig.ts";

/**
 * Returns the pathColor to apply to the PatternLock when the game ends.
 * Win  → bootstrap success (persistent until next game)
 * Lose → bootstrap danger (persistent until next game)
 */
const useEndGameColor = (phase: GamePhase, winner: number | null): string | undefined => {
    const [color, setColor] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (phase !== GamePhase.Revealing) { setColor(undefined); return; }
        setColor(winner !== null ? "var(--bs-success)" : "var(--bs-danger)");
    }, [phase, winner]);

    return color;
};

export default useEndGameColor;
