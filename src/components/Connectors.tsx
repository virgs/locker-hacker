import * as React from "react";

import { getAngle, getDistance, getConnectorPoint, getDynamicConnectorThickness, getConnectorOpacity } from "../math/math.ts";
import { Point } from "../math/point.ts";
import { getConnectorClassName } from "./patternLockFeedback.ts";

type Connector = {
    from      : Point;
    to        : Point;
    thickness : number;
    opacity   : number;
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
    dynamicLineStyle        : boolean;
    minConnectorThickness   : number;
    minConnectorOpacity     : number;
    pathColor              ?: string;
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
    dynamicLineStyle,
    minConnectorThickness,
    minConnectorOpacity,
    pathColor,
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
    const totalConnectors  = Math.max(0, path.length - 1) + (hasLiveConnector ? 1 : 0);

    const buildConnector = (index: number, from: Point, rawTo: Point | null): Connector => {
        const thickness = getDynamicConnectorThickness({ dynamicLineStyle, connectorThickness, minConnectorThickness, connectorIndex: index, totalConnectors });
        const opacity   = getConnectorOpacity({ dynamicLineStyle, connectorIndex: index, totalConnectors, minConnectorOpacity });
        return {
            from     : getConnectorPoint(from, pointActiveSize, thickness),
            to       : rawTo ? getConnectorPoint(rawTo, pointActiveSize, thickness) : mouse as Point,
            thickness,
            opacity,
        };
    };

    const connectors: Connector[] = [];
    for (let i = 0; i < path.length - 1; i += 1) {
        connectors.push(buildConnector(i, points[path[i]], points[path[i + 1]]));
    }
    if (hasLiveConnector) {
        connectors.push(buildConnector(totalConnectors - 1, points[path[path.length - 1]], null));
    }
    const arrowHeadIndex = arrowHeads && connectors.length > 0 ? connectors.length - 1 : -1;

    return (
        <div className="react-pattern-lock__connector-wrapper">
            {
                connectors.map(({ from, to, thickness, opacity }, i) => (
                    <div
                        className={getConnectorClassName(i === connectors.length - 1)}
                        key={ i }
                        style={{
                            transform    : `rotate(${getAngle(from, to)}rad)`,
                            width        : `${getDistance(from, to)}px`,
                            left         : `${from.x}px`,
                            top          : `${from.y}px`,
                            height       : thickness,
                            borderRadius : connectorRoundedCorners ? Math.round(thickness / 2) : 0,
                            opacity,
                            ...(pathColor ? { background: pathColor } : {}),
                        }}
                    >
                        {i === arrowHeadIndex && (
                            <div
                                className="react-pattern-lock__arrow-head"
                                style={{
                                    borderTopWidth    : `${arrowHeadSize}px`,
                                    borderBottomWidth : `${arrowHeadSize}px`,
                                    borderLeftWidth   : `${Math.round(arrowHeadSize * 1.5)}px`,
                                    ...(pathColor ? { borderLeftColor: pathColor } : {}),
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
