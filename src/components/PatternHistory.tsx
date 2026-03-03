import * as React from "react";
import { List } from "react-feather";
import PatternLock from "./PatternLock.tsx";
import FeedbackIndicator from "./FeedbackIndicator.tsx";
import { HistoryTitle, HistoryList, HistoryEntry, PatternLockWrapper, GuessNumber } from "./PatternHistory.styled.tsx";
import { GuessValidator } from "../game/GuessValidator.ts";
import { PlayerCount } from "../game/GameConfig.ts";
import { getPlayerColor } from "../game/playerColors.ts";
import { useGameContext } from "../context/GameContext.tsx";
import useMediaQuery from "./useMediaQuery.ts";

interface PatternHistoryProps {
    entrySize ?: number;
}

const PatternHistory: React.FunctionComponent<PatternHistoryProps> = ({
    entrySize = 120,
}): React.ReactElement => {
    const { pathHistory, playerHistory, playerCount, code, gridConfig } = useGameContext();
    const isMultiplayer = playerCount !== PlayerCount.One;
    const isXS       = useMediaQuery("(max-width: 600px)");
    const size        = isXS ? Math.round(entrySize * 0.65) : entrySize;
    const validator   = new GuessValidator(code);
    const dotSize     = Math.round(size / 10);
    const listEndRef  = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [pathHistory.length]);

    return (
        <>
            <HistoryTitle>
                <List size={12} />
                Guess History
            </HistoryTitle>
            <HistoryList>
            {pathHistory.map((path, index) => {
                const { bulls, cows } = validator.validate(path);
                const playerColor = isMultiplayer ? getPlayerColor(playerHistory[index]) : undefined;
                return (
                    <HistoryEntry key={`history-${index}`} $playerColor={playerColor}>
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
        </>
    );
};

export default PatternHistory;
