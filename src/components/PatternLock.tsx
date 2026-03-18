import * as React from "react";
import classnames from "classnames";
import "./PatternLock.css";

import Point from "./Point.tsx";
import Connectors from "./Connectors.tsx";
import { usePatternLock } from "./usePatternLock.ts";
import type { DotAnnotations, DotAnnotationSelection } from "../game/dotAnnotations.ts";

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
    hiddenPoints?: number[];
    annotations?: DotAnnotations;
    onSelectPointAnnotation?: (index: number, selection: DotAnnotationSelection) => void;
    onAnnotationMenuVisibilityChange?: (visible: boolean) => void;
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
    hiddenPoints = [],
    annotations = {},
    onSelectPointAnnotation,
    onAnnotationMenuVisibilityChange,
    onChange,
    onFinish,
    path,
}): React.ReactElement => {
    const {
        wrapperRef,
        points,
        gridLayout,
        wrapperPosition,
        isMouseDown,
        initialMousePosition,
        firstDotPopActive,
        flashingPoints,
        completionFlash,
        activeAnnotationMenu,
        onHold,
        onTouch,
    } =
        usePatternLock({
            path,
            cols,
            rows,
            pointActiveSize,
            disabled,
            allowOverlapping,
            allowJumping,
            blockedPoints: hiddenPoints,
            targetLength,
            annotations,
            onSelectPointAnnotation,
            onAnnotationMenuVisibilityChange,
            onChange,
            onFinish,
        });

    return (
        <div
            className={classnames([
                "react-pattern-lock__pattern-wrapper",
                { disabled, "annotation-menu-active": activeAnnotationMenu !== null },
                className,
            ])}
            style={{ ...style, width: containerSize, height: containerSize }}
            onMouseDown={onHold}
            onTouchStart={onTouch}
            ref={wrapperRef}
        >
            {gridLayout.width > 0 && (
                <div
                    className="react-pattern-lock__dots-wrapper"
                    style={{
                        position : 'absolute',
                        left     : gridLayout.offsetX,
                        top      : gridLayout.offsetY,
                        width    : gridLayout.width,
                        height   : gridLayout.height,
                        display  : 'flex',
                        flexWrap : 'wrap',
                    }}
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
                            pop={!noPop && (flashingPoints.has(i) || (
                                isMouseDown &&
                                path[path.length - 1] === i &&
                                (path.length > 1 || firstDotPopActive)
                            ))}
                            selected={path.indexOf(i) > -1}
                            hidden={hiddenPoints.includes(i)}
                            annotation={annotations[i]}
                            annotationMenu={activeAnnotationMenu?.index === i ? activeAnnotationMenu : undefined}
                            targetLength={targetLength}
                            pathColor={pathColor}
                        />
                    ))}
                </div>
            )}
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
                    pathColor={pathColor}
                />
            )}
        </div>
    );
};

export default PatternLock;
