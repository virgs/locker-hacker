import * as React from "react";

import { getAngle, getDistance, getConnectorPoint, getDynamicConnectorThickness, getConnectorOpacity } from "../math/math.ts";
import { Point } from "../math/point.ts";

type Connector = {
    from : Point;
    to   : Point;
};

interface ConnectorsProps {
    path                    : number[];
    connectorThickness      : number;
    connectorRoundedCorners : boolean;
    pointActiveSize         : number;
    points                  : Point[];
    wrapperPosition         : Point;
    initialMousePosition    : Point | null;
    arrowHeads              : boolean;
    arrowHeadSize           : number;
    dynamicLineWidth        : boolean;
    minConnectorThickness   : number;
    cols                    : number;
    rows                    : number;
}

const Connectors: React.FunctionComponent<ConnectorsProps> = ({
    path,
    points,
    wrapperPosition,
    pointActiveSize,
    connectorThickness,
    connectorRoundedCorners,
    initialMousePosition,
    arrowHeads,
    arrowHeadSize,
    dynamicLineWidth,
    minConnectorThickness,
    cols,
    rows,
}) => {
    const [mouse, setMouse] = React.useState<Point | null>(null);

    React.useEffect(() => setMouse(initialMousePosition), [initialMousePosition])

    const {
        setMousePosition,
        setTouchPosition
    } = React.useMemo(() => ({
        setMousePosition: ({ clientX, clientY }: MouseEvent) : void =>
            setMouse({ x: clientX - wrapperPosition.x + window.scrollX, y : clientY - wrapperPosition.y + window.scrollY }),
        setTouchPosition: ({ touches }: TouchEvent): void =>
            setMouse({ x: touches[0].clientX - wrapperPosition.x + window.scrollX, y : touches[0].clientY - wrapperPosition.y + window.scrollY })
    }), [wrapperPosition]);

    React.useEffect(() => {
        if (!initialMousePosition) return;
        window.addEventListener("mousemove", setMousePosition);
        window.addEventListener("touchmove", setTouchPosition);
        return () => {
            window.removeEventListener("mousemove", setMousePosition);
            window.removeEventListener("touchmove", setTouchPosition);
        };
    });

    const hasLiveConnector = mouse !== null && path.length > 0;
    const numLines = Math.max(1, path.length - 1 + (hasLiveConnector ? 1 : 0));
    const maxPossibleLines = Math.max(1, cols * rows - 1);
    const effectiveThickness = dynamicLineWidth
        ? getDynamicConnectorThickness({ connectorThickness, minConnectorThickness, numLines, maxPossibleLines })
        : connectorThickness;

    const connectors: Connector[] = [];
    for (let i = 0; i < path.length - 1; i += 1) {
        const current = points[path[i]];
        const next    = points[path[i + 1]];
        connectors.push({
            from : getConnectorPoint(current, pointActiveSize, effectiveThickness),
            to   : getConnectorPoint(next, pointActiveSize, effectiveThickness)
        });
    }
    if (hasLiveConnector) {
        connectors.push({
            from : getConnectorPoint(points[path[path.length - 1]], pointActiveSize, effectiveThickness),
            to   : mouse
        });
    }
    const arrowHeadIndex = arrowHeads && connectors.length > 0 ? connectors.length - 1 : -1;

    return (
        <div className="react-pattern-lock__connector-wrapper">
            {
                connectors.map(({ from, to }, i) => (
                    <div
                        className="react-pattern-lock__connector"
                        key={ i }
                        style={{
                            transform    : `rotate(${getAngle(from, to)}rad)`,
                            width        : `${getDistance(from, to)}px`,
                            left         : `${from.x}px`,
                            top          : `${from.y}px`,
                            height       : effectiveThickness,
                            borderRadius : connectorRoundedCorners ? Math.round(effectiveThickness / 2) : 0,
                            opacity      : dynamicLineWidth ? getConnectorOpacity(i, connectors.length) : 1
                        }}
                    >
                        {i === arrowHeadIndex && (
                            <div
                                className="react-pattern-lock__arrow-head"
                                style={{
                                    borderTopWidth    : `${arrowHeadSize}px`,
                                    borderBottomWidth : `${arrowHeadSize}px`,
                                    borderLeftWidth   : `${Math.round(arrowHeadSize * 1.5)}px`,
                                }}
                            />
                        )}
                    </div>
                ))
            }
        </div>
    );
};

export default Connectors;