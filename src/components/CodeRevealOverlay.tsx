import * as React from "react";
import Button from "react-bootstrap/Button";
import PatternLock from "./PatternLock.tsx";
import { RevealBackdrop, RevealCard, RevealTitle, RevealActions } from "./CodeRevealOverlay.styled.tsx";

interface CodeRevealOverlayProps {
    code      : number[];
    cols      : number;
    rows      : number;
    show      : boolean;
    onDismiss : () => void;
    onFinish  : () => void;
}

const CodeRevealOverlay: React.FunctionComponent<CodeRevealOverlayProps> = ({
    code,
    cols,
    rows,
    show,
    onDismiss,
    onFinish,
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
                <RevealActions>
                    <Button variant="outline-secondary" size="sm" onClick={onDismiss}>
                        Dismiss
                    </Button>
                    <Button variant="outline-primary" size="sm" onClick={onFinish}>
                        Finish
                    </Button>
                </RevealActions>
            </RevealCard>
        </RevealBackdrop>
    );
};

export default CodeRevealOverlay;

