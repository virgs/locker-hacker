import * as React from "react";
import { Clock } from "react-feather";
import { useGameContext } from "../context/GameContext.tsx";
import { formatTime } from "./Footer.utils.ts";
import {
    PlayAreaCounter,
    CounterIcon,
    CounterLabel,
    CounterMetric,
    CounterValue,
} from "./PlayAreaCounter.styled.tsx";

const TimeCounter: React.FunctionComponent = (): React.ReactElement | null => {
    const { pathHistory, elapsedSeconds } = useGameContext();

    if (pathHistory.length === 0) return null;

    return (
        <PlayAreaCounter $side="right" aria-label="Elapsed time">
            <CounterMetric $side="right">
                <CounterIcon><Clock /></CounterIcon>
                <CounterValue $side="right">{formatTime(elapsedSeconds)}</CounterValue>
            </CounterMetric>
            <CounterLabel $side="right">Elapsed Time</CounterLabel>
        </PlayAreaCounter>
    );
};

export default TimeCounter;
