import * as React from "react";
import PatternLock from "./PatternLock.tsx";
import { RevealBackdrop, RevealCard, RevealTitle } from "./CodeRevealOverlay.styled.tsx";

interface CodeRevealOverlayProps {
    code : number[];
    cols : number;
    rows : number;
    show : boolean;
}

const CodeRevealOverlay: React.FunctionComponent<CodeRevealOverlayProps> = ({
    code,
    cols,
    rows,
    show,
}): React.ReactElement | null => {
    if (!show) return null;

    return (
        <RevealBackdrop>
            <RevealCard>
                <RevealTitle>Secret Code</RevealTitle>
                <PatternLock
                    containerSize={220}
                    pointSize={14}
                    arrowHeadSize={10}
                    disabled={true}
                    cols={cols}
                    rows={rows}
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

