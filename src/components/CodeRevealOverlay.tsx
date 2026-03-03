import * as React from "react";
import { Award, Clock, MousePointer } from "react-feather";
import PatternLock from "./PatternLock.tsx";
import { RevealBackdrop, RevealCard, RevealTitle, RevealStats, RevealStat } from "./CodeRevealOverlay.styled.tsx";
import { PlayerCount } from "../game/GameConfig.ts";
import { useGameContext } from "../context/GameContext.tsx";
import { formatTime } from "./Footer.utils.ts";

const CodeRevealOverlay: React.FunctionComponent = (): React.ReactElement | null => {
    const { showRevealModal, code, gridConfig, winner, playerCount, elapsedSeconds, pathHistory, onToggleRevealModal } = useGameContext();

    if (!showRevealModal) return null;

    const isWin = winner !== null;
    const title = isWin
        ? (playerCount === PlayerCount.One ? "You win!" : `Player ${winner} wins!`)
        : "Secret Code";

    return (
        <RevealBackdrop onClick={onToggleRevealModal}>
            <RevealCard onClick={(e) => e.stopPropagation()}>
                <RevealTitle>
                    {isWin && <Award size={22} className="me-2" />}
                    {title}
                </RevealTitle>
                {isWin && (
                    <RevealStats>
                        <RevealStat><Clock size={15} />{formatTime(elapsedSeconds)}</RevealStat>
                        <RevealStat><MousePointer size={15} />{pathHistory.length} moves</RevealStat>
                    </RevealStats>
                )}
                <PatternLock
                    containerSize={220}
                    pointSize={14}
                    arrowHeadSize={10}
                    disabled={true}
                    cols={gridConfig.cols}
                    rows={gridConfig.rows}
                    path={code}
                    dynamicLineStyle={true}
                    arrowHeads={true}
                    allowJumping={false}
                />
            </RevealCard>
        </RevealBackdrop>
    );
};

export default CodeRevealOverlay;

