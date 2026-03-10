import * as React from "react";
import { useGameContext } from "../context/GameContext.tsx";
import {
    GuessCounterWrapper,
    AttemptDots,
    AttemptDot,
    OverflowBadge,
    AttemptLabel,
} from "./GuessCounter.styled.tsx";
import { formatGuessLabel } from "./GuessCounter.utils.ts";

const MAX_VISIBLE_DOTS = 10;

const GuessCounter: React.FunctionComponent = (): React.ReactElement | null => {
    const { pathHistory } = useGameContext();

    if (pathHistory.length === 0) return null;

    const totalDots = pathHistory.length;
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
            <AttemptLabel className="fs-6 my-1 text-muted"><small>{formatGuessLabel(totalDots)}</small></AttemptLabel>
        </GuessCounterWrapper>
    );
};

export default GuessCounter;
