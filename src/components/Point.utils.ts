import type { CSSProperties } from "react";

interface PointInnerClassOptions {
    complete: boolean;
    pop: boolean;
    highlighted: boolean;
    hidden: boolean;
    selected: boolean;
}

interface AngleRange {
    start: number;
    end: number;
}

const LABEL_RADIUS_PX = 24;
const LABEL_ANGLE_OFFSET_DEG = -45;

export const getPointInnerClassName = ({
    complete,
    pop,
    highlighted,
    hidden,
    selected,
}: PointInnerClassOptions): string => [
    "react-pattern-lock__point-inner",
    complete ? "complete" : pop ? "active" : "",
    highlighted && !selected && !hidden ? "highlighted" : "",
    hidden ? "hidden" : "",
].filter(Boolean).join(" ");

export const getConfirmedAngleDegrees = (
    position: number,
    targetLength: number,
): number => -90 + (360 / targetLength) * (position - 1) + LABEL_ANGLE_OFFSET_DEG;

export const getConfirmedLabelStyle = (
    position: number,
    targetLength: number,
): CSSProperties => {
    if (targetLength <= 0) return {};

    const angle = getConfirmedAngleDegrees(position, targetLength);
    const angleRad = angle * (Math.PI / 180);
    const normalizeAxis = (value: number): string => Math.abs(value) < 0.005 ? "0.00" : value.toFixed(2);
    const x = Math.cos(angleRad) * LABEL_RADIUS_PX;
    const y = Math.sin(angleRad) * LABEL_RADIUS_PX;

    return {
        transform: `translate(-50%, -50%) translate(${normalizeAxis(x)}px, ${normalizeAxis(y)}px)`,
    };
};

export const getAnnotationMenuOffsetStyle = (
    offsetX = 0,
    offsetY = 0,
): CSSProperties => ({
    transform: `translate(${offsetX}px, ${offsetY}px)`,
});

const normalizeAngle = (angle: number): number => {
    const normalized = angle % 360;
    return normalized < 0 ? normalized + 360 : normalized;
};

const splitWrappedRange = ({ start, end }: AngleRange): AngleRange[] =>
    start <= end
        ? [{ start, end }]
        : [{ start, end: 360 }, { start: 0, end }];

const getGapRanges = (
    positions: number[],
    targetLength: number,
): AngleRange[] =>
    positions
        .flatMap(position => {
            const angle = normalizeAngle(getConfirmedAngleDegrees(position, targetLength) + 90);
            const halfGap = 360 / targetLength / 2;
            return splitWrappedRange({
                start: normalizeAngle(angle - halfGap),
                end: normalizeAngle(angle + halfGap),
            });
        })
        .sort((left, right) => left.start - right.start);

export const getConfirmedRingSegments = (
    positions: number[],
    targetLength: number,
): AngleRange[] => {
    if (targetLength <= 0 || positions.length === 0) return [{ start: 0, end: 360 }];

    const gaps = getGapRanges(positions, targetLength);
    const segments: AngleRange[] = [];
    let currentAngle = 0;

    gaps.forEach(({ start, end }) => {
        if (start > currentAngle) segments.push({ start: currentAngle, end: start });
        currentAngle = Math.max(currentAngle, end);
    });

    if (currentAngle < 360) segments.push({ start: currentAngle, end: 360 });
    return segments.filter(segment => segment.end > segment.start);
};

const polarToCartesian = (
    center: number,
    radius: number,
    angleInDegrees: number,
): { x: number; y: number } => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: center + radius * Math.cos(angleInRadians),
        y: center + radius * Math.sin(angleInRadians),
    };
};

export const describeArcPath = (
    center: number,
    radius: number,
    startAngle: number,
    endAngle: number,
): string => {
    const start = polarToCartesian(center, radius, endAngle);
    const end = polarToCartesian(center, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
        "M", start.x.toFixed(2), start.y.toFixed(2),
        "A", radius.toFixed(2), radius.toFixed(2), "0", largeArcFlag, "0", end.x.toFixed(2), end.y.toFixed(2),
    ].join(" ");
};
