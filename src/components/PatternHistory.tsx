import * as React from "react";
import PatternLock from "./PatternLock.tsx";
import FeedbackIndicator from "./FeedbackIndicator.tsx";
import { HistoryList, HistoryEntry, PatternLockWrapper, GuessNumber } from "./PatternHistory.styled.tsx";
import { GuessValidator } from "../game/GuessValidator.ts";
import useMediaQuery from "./useMediaQuery.ts";

interface PatternHistoryProps {
    pathHistory : number[][];
    code        : number[];
    cols        : number;
    rows        : number;
    entrySize  ?: number;
}

const PatternHistory: React.FunctionComponent<PatternHistoryProps> = ({
    pathHistory,
    code,
    cols,
    rows,
    entrySize = 120,
}): React.ReactElement => {
    const isXS       = useMediaQuery("(max-width: 600px)");
    const size       = isXS ? Math.round(entrySize * 0.65) : entrySize;
    const validator  = new GuessValidator(code);
    const dotSize    = Math.round(size / 10);
    const listEndRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [pathHistory.length]);

    return (
        <HistoryList>
            {pathHistory.map((path, index) => {
                const { bulls, cows } = validator.validate(path);
                return (
                    <HistoryEntry key={`history-${index}`}>
                        <GuessNumber>#{index + 1}</GuessNumber>
                        <PatternLockWrapper>
                        <PatternLock
                            containerSize={size}
                            pointSize={dotSize}
                            arrowHeadSize={dotSize}
                                disabled={true}
                                cols={cols}
                                rows={rows}
                                path={path}
                                dynamicLineStyle={true}
                                arrowHeads={true}
                                allowJumping={false}
                            />
                        </PatternLockWrapper>
                        <FeedbackIndicator bulls={bulls} cows={cows} codeLength={code.length} />
                    </HistoryEntry>
                );
            })}
            <div ref={listEndRef} />
        </HistoryList>
    );
};

export default PatternHistory;
