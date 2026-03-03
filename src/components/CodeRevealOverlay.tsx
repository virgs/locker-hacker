import * as React from "react";
import PatternLock from "./PatternLock.tsx";
import { RevealBackdrop, RevealCard, RevealTitle } from "./CodeRevealOverlay.styled.tsx";
import { useGameContext } from "../context/GameContext.tsx";

const CodeRevealOverlay: React.FunctionComponent = (): React.ReactElement | null => {
    const { showRevealModal, code, gridConfig, onToggleRevealModal } = useGameContext();

    if (!showRevealModal) return null;

    return (
        <RevealBackdrop onClick={onToggleRevealModal}>
            <RevealCard onClick={(e) => e.stopPropagation()}>
                <RevealTitle>Secret Code</RevealTitle>
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
