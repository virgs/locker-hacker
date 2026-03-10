import * as React from "react";
import { GamePhase } from "../game/GameConfig.ts";
import { useGameContext } from "../context/GameContext.tsx";
import {
    GuessCounterWrapper,
    AttemptDots,
    AttemptDot,
    OverflowBadge,
    AttemptLabel,
} from "./GuessCounter.styled.tsx";
import { formatGuessLabel } from "./GuessCounter.utils.ts";

const MAX_VISIBLE_DOTS = 3;

const GuessCounter: React.FunctionComponent = (): React.ReactElement | null => {
    const { phase, pathHistory } = useGameContext();

    if (phase !== GamePhase.Playing || pathHistory.length === 0) return null;

    const made        = pathHistory.length;
    const totalDots   = made + 1;
    const visibleDots = Math.min(totalDots, MAX_VISIBLE_DOTS);
    const overflow    = totalDots > MAX_VISIBLE_DOTS;

    return (
        <GuessCounterWrapper>
            <AttemptDots>
                {Array.from({ length: visibleDots }).map((_, i) => (
                    <AttemptDot key={i} $latest={i === visibleDots - 1} />
                ))}
                {overflow && <OverflowBadge>+</OverflowBadge>}
            </AttemptDots>
            <AttemptLabel className="fs-6 my-1 text-muted"><small>{formatGuessLabel(made + 1)}</small></AttemptLabel>
        </GuessCounterWrapper>
    );
};

export default GuessCounter;
