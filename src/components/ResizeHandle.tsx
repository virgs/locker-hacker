import type { FunctionComponent, ReactElement, PointerEvent } from "react";
import Tip from "./Tip.tsx";
import { RESIZE_HANDLE_TOOLTIP } from "./ResizeHandle.constants.ts";
import { VerticalHandle, HorizontalHandle, VerticalGrabBar, HorizontalGrabBar } from "./ResizeHandle.styled.tsx";

interface ResizeHandleProps {
    isMobile: boolean;
    onPointerDown: (e: PointerEvent) => void;
    onPointerMove: (e: PointerEvent) => void;
    onPointerUp: (e: PointerEvent) => void;
}

const ResizeHandle: FunctionComponent<ResizeHandleProps> = ({
    isMobile,
    onPointerDown,
    onPointerMove,
    onPointerUp,
}): ReactElement => {
    const Handle = isMobile ? HorizontalHandle : VerticalHandle;
    const GrabBar = isMobile ? HorizontalGrabBar : VerticalGrabBar;
    const placement = isMobile ? "top" : "left";

    return (
        <Tip text={RESIZE_HANDLE_TOOLTIP} placement={placement}>
            <Handle
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
            >
                <GrabBar />
            </Handle>
        </Tip>
    );
};

export default ResizeHandle;

