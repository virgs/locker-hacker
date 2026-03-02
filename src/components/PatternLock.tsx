import * as React from "react";
import classnames from "classnames";

import Point from "./Point.tsx";
import Connectors from "./Connectors.tsx";
import { PatternLockStyles } from "./PatternLock.styled.tsx";
import { usePatternLock } from "./usePatternLock.ts";

interface PatternLockProps {
    path: number[];
    containerSize?: number | string;
    width?: number;
    height?: number;
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
    onChange?: (path: number[]) => void;
    onFinish?: () => void;
}

const PatternLock: React.FunctionComponent<PatternLockProps> = ({
    containerSize = "100%",
    width = 5,
    height = 5,
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
    minConnectorThickness = 2,
    minConnectorOpacity = 0.2,
    className = "",
    style = {},
    onChange,
    onFinish,
    path,
}): React.ReactElement => {
    const { wrapperRef, points, wrapperPosition, isMouseDown, initialMousePosition, onHold, onTouch } =
        usePatternLock({ path, cols: width, rows: height, pointActiveSize, disabled, allowOverlapping, allowJumping, onChange, onFinish });

    return (
        <>
            <PatternLockStyles />
            <div
                className={classnames(["react-pattern-lock__pattern-wrapper", { disabled }, className])}
                style={{ ...style, width: containerSize, height: containerSize }}
                onMouseDown={onHold}
                onTouchStart={onTouch}
                ref={wrapperRef}
            >
                {Array.from({ length: width * height }).map((_, i) => (
                    <Point
                        key={i}
                        index={i}
                        cols={width}
                        rows={height}
                        pointSize={pointSize}
                        pointActiveSize={pointActiveSize}
                        pop={!noPop && isMouseDown && path[path.length - 1] === i}
                        selected={path.indexOf(i) > -1}
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
                    />
                )}
            </div>
        </>
    );
};

export default PatternLock;
