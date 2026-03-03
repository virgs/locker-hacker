import * as React from "react";
import classnames from "classnames";
import "./PatternLock.css";

import Point from "./Point.tsx";
import Connectors from "./Connectors.tsx";
import { usePatternLock } from "./usePatternLock.ts";

interface PatternLockProps {
    path: number[];
    containerSize?: number | string;
    cols?: number;
    rows?: number;
    pointActiveSize?: number;
    connectorThickness?: number;
    connectorRoundedCorners?: boolean;
    pointSize?: number;
    disabled?: boolean;
    allowOverlapping?: boolean;
    allowJumping?: boolean;
    arrowHeads?: boolean;
    arrowHeadSize?: number;
    dynamicLineStyle?: boolean;
    minConnectorThickness?: number;
    minConnectorOpacity?: number;
    style?: React.CSSProperties;
    className?: string;
    noPop?: boolean;
    invisible?: boolean;
    targetLength?: number;
    pathColor?: string;
    onChange?: (path: number[]) => void;
    onFinish?: () => void;
}

const PatternLock: React.FunctionComponent<PatternLockProps> = ({
    containerSize = "100%",
    cols = 5,
    rows = 5,
    pointActiveSize = 30,
    pointSize = 20,
    connectorThickness = 6,
    connectorRoundedCorners = false,
    disabled = false,
    allowOverlapping = false,
    noPop = false,
    invisible = false,
    allowJumping = false,
    arrowHeads = false,
    arrowHeadSize = 10,
    dynamicLineStyle = false,
    minConnectorThickness = 3,
    minConnectorOpacity = 0.5,
    className = "",
    style = {},
    targetLength,
    pathColor,
    onChange,
    onFinish,
    path,
}): React.ReactElement => {
    const { wrapperRef, points, wrapperPosition, isMouseDown, initialMousePosition, flashingPoints, completionFlash, onHold, onTouch } =
        usePatternLock({ path, cols, rows, pointActiveSize, disabled, allowOverlapping, allowJumping, targetLength, onChange, onFinish });

    return (
        <div
            className={classnames(["react-pattern-lock__pattern-wrapper", { disabled }, className])}
            style={{ ...style, width: containerSize, height: containerSize }}
            onMouseDown={onHold}
            onTouchStart={onTouch}
            ref={wrapperRef}
        >
            {Array.from({ length: cols * rows }).map((_, i) => (
                <Point
                    key={i}
                    index={i}
                    cols={cols}
                    rows={rows}
                    pointSize={pointSize}
                    pointActiveSize={pointActiveSize}
                    complete={completionFlash && path.indexOf(i) > -1 && path.indexOf(i) < (targetLength ?? Infinity)}
                    pop={!noPop && ((isMouseDown && path[path.length - 1] === i) || flashingPoints.has(i))}
                    selected={path.indexOf(i) > -1}
                    pathColor={disabled ? undefined : pathColor}
                />
            ))}
            {!invisible && points.length > 0 && (
                <Connectors
                    initialMousePosition={initialMousePosition}
                    wrapperPosition={wrapperPosition}
                    path={path}
                    points={points}
                    pointActiveSize={pointActiveSize}
                    connectorRoundedCorners={connectorRoundedCorners}
                    connectorThickness={connectorThickness}
                    arrowHeads={arrowHeads}
                    arrowHeadSize={arrowHeadSize}
                    dynamicLineStyle={dynamicLineStyle}
                    minConnectorThickness={minConnectorThickness}
                    minConnectorOpacity={minConnectorOpacity}
                    pathColor={disabled ? undefined : pathColor}
                />
            )}
        </div>
    );
};

export default PatternLock;
