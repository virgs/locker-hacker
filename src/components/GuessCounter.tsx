import * as React from "react";
import { GitCommit } from "react-feather";
import { useGameContext } from "../context/GameContext.tsx";
import {
    GuessCounterWrapper,
    AttemptDots,
    AttemptDot,
    OverflowBadge,
    AttemptLabel,
} from "./GuessCounter.styled.tsx";
import { CounterIcon, CounterMetric, CounterValue } from "./PlayAreaCounter.styled.tsx";
import { formatGuessLabel } from "./GuessCounter.utils.ts";

const MAX_VISIBLE_DOTS = 8;

const GuessCounter: React.FunctionComponent = (): React.ReactElement | null => {
    const { pathHistory } = useGameContext();

    if (pathHistory.length === 0) return null;

    const totalDots = pathHistory.length;
    const visibleDots = Math.min(totalDots, MAX_VISIBLE_DOTS);
    const overflow    = totalDots > MAX_VISIBLE_DOTS;

    return (
        <GuessCounterWrapper $side="left" aria-label="Guess count">
            <CounterMetric $side="left">
                <CounterIcon><GitCommit /></CounterIcon>
                <AttemptDots>
                    {Array.from({ length: visibleDots }).map((_, i) => (
                        <AttemptDot key={i} $latest={i === visibleDots - 1} />
                    ))}
                    {overflow && <OverflowBadge>+</OverflowBadge>}
                </AttemptDots>
                <CounterValue $side="left">{totalDots}</CounterValue>
            </CounterMetric>
            <AttemptLabel $side="left">{formatGuessLabel(totalDots)}</AttemptLabel>
        </GuessCounterWrapper>
    );
};

export default GuessCounter;
