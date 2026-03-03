import * as React from "react";
import PatternLock from "./PatternLock.tsx";
import FeedbackIndicator from "./FeedbackIndicator.tsx";
import { HistoryList, HistoryEntry, PatternLockWrapper, GuessNumber } from "./PatternHistory.styled.tsx";
import { GuessValidator } from "../game/GuessValidator.ts";
import { useGameContext } from "../context/GameContext.tsx";
import useMediaQuery from "./useMediaQuery.ts";

interface PatternHistoryProps {
    entrySize ?: number;
}

const PatternHistory: React.FunctionComponent<PatternHistoryProps> = ({
    entrySize = 120,
}): React.ReactElement => {
    const { pathHistory, code, gridConfig } = useGameContext();
    const isXS       = useMediaQuery("(max-width: 600px)");
    const size        = isXS ? Math.round(entrySize * 0.65) : entrySize;
    const validator   = new GuessValidator(code);
    const dotSize     = Math.round(size / 10);
    const listEndRef  = React.useRef<HTMLDivElement>(null);

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
                                cols={gridConfig.cols}
                                rows={gridConfig.rows}
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
