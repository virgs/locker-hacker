import * as React from "react";
import { Award } from "react-feather";
import PatternLock from "./PatternLock.tsx";
import { RevealBackdrop, RevealCard, RevealTitle } from "./CodeRevealOverlay.styled.tsx";
import { PlayerCount } from "../game/GameConfig.ts";
import { useGameContext } from "../context/GameContext.tsx";

const CodeRevealOverlay: React.FunctionComponent = (): React.ReactElement | null => {
    const { showRevealModal, code, gridConfig, winner, playerCount, onToggleRevealModal } = useGameContext();

    if (!showRevealModal) return null;

    const title = winner !== null
        ? (playerCount === PlayerCount.One ? "You win!" : `Player ${winner} wins!`)
        : "Secret Code";

    return (
        <RevealBackdrop onClick={onToggleRevealModal}>
            <RevealCard onClick={(e) => e.stopPropagation()}>
                <RevealTitle>
                    {winner !== null && <Award size={22} className="me-2" />}
                    {title}
                </RevealTitle>
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

