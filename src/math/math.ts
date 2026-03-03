import { useRef, useEffect } from "react";
import { Point } from "./point.ts";

export const usePrevious = <T>(val: T): T | undefined => {
    const ref = useRef<T | undefined>(undefined);
    useEffect(() => {
        ref.current = val
    }, [val]);
    // eslint-disable-next-line react-hooks/refs
    return ref.current;
};

export const getPoints = ({
    pointActiveSize,
    containerWidth,
    containerHeight,
    cols,
    rows
}: { pointActiveSize: number, containerWidth: number, containerHeight: number, cols: number, rows: number }): Point[] => {
    const halfPointSize = pointActiveSize / 2;
    const cellWidth     = containerWidth  / cols;
    const cellHeight    = containerHeight / rows;
    return Array.from({ length: cols * rows }).map((_x, i) => ({
        x: cellWidth  * (i % cols)           + cellWidth  / 2 - halfPointSize,
        y: cellHeight * Math.floor(i / cols) + cellHeight / 2 - halfPointSize
    }));
};

export const getDistance = (p1: Point, p2: Point): number => Math.sqrt(((p2.x - p1.x) ** 2) + ((p2.y - p1.y) ** 2));
export const getAngle    = (p1: Point, p2: Point): number => Math.atan2(p2.y - p1.y, p2.x - p1.x);

export const getCollidedPointIndex = (
    { x, y }        : Point, // Mouse position
    points          : Point[], // Pattern points
    pointActiveSize : number // Point active diameter
): number => {
    for (let i = 0; i < points.length; i += 1) {
        if (
            x > points[i].x
            && x < points[i].x + pointActiveSize
            && y > points[i].y
            && y < points[i].y + pointActiveSize
        ) return i;
    }
    return -1;
};

export const getConnectorPoint = (
    p                  : Point,
    pointActiveSize    : number,
    connectorThickness : number
): Point => ({
    x : p.x + Math.floor(pointActiveSize / 2),
    y : p.y + Math.floor(pointActiveSize / 2) - Math.floor(connectorThickness / 2)
});

export const getConnectorOpacity = ({
    dynamicLineStyle,
    connectorIndex,
    totalConnectors,
    minConnectorOpacity,
}: {
    dynamicLineStyle: boolean;
    connectorIndex: number;
    totalConnectors: number;
    minConnectorOpacity: number;
}): number => {
    if (!dynamicLineStyle) return 1;
    const ratio = 1 - connectorIndex / Math.max(1, totalConnectors - 1);
    return minConnectorOpacity + (1 - minConnectorOpacity) * ratio;
};

export const getDynamicConnectorThickness = ({
    dynamicLineStyle,
    connectorThickness,
    minConnectorThickness,
    connectorIndex,
    totalConnectors,
}: {
    dynamicLineStyle: boolean;
    connectorThickness: number;
    minConnectorThickness: number;
    connectorIndex: number;
    totalConnectors: number;
}): number => {
    if (!dynamicLineStyle) return connectorThickness;
    const ratio = 1 - connectorIndex / Math.max(1, totalConnectors - 1);
    return minConnectorThickness + (connectorThickness - minConnectorThickness) * ratio;
};

export const exclusiveRange = (rawStart: number, stop: number): number[] => {
    if (rawStart === stop) return [];
    const start = rawStart > stop ? rawStart - 1 : rawStart + 1;
    const step = start > stop ? -1 : 1;
    return Array.from({ length : Math.abs(start - stop) })
        .map((_, i) => start + i * step);
}

export const getPointsInTheMiddle = (index1: number, index2: number, cols: number): number[] => {
    const x1 = index1 % cols;
    const x2 = index2 % cols;

    const y1 = Math.floor(index1 / cols);
    const y2 = Math.floor(index2 / cols);
    const deltaX = Math.abs(x1 - x2);
    const deltaY = Math.abs(y1 - y2);

    if (y1 === y2) { // Horizontal
        return exclusiveRange(cols * y1 + x1, cols * y2 + x2);
    } else if (x1 === x2) { // Vertical
        return exclusiveRange(y1, y2).map(x => x * cols + x1);
    } else if (deltaX === deltaY) { // Diagonal
        const m = x1 < x2 ? 1 : -1;
        return exclusiveRange(y1, y2).map((x, i) => x * cols + x1 + ((i + 1) * m));
    }
    return [];
};