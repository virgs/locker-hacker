import type { CSSProperties } from "react";

interface PointInnerClassOptions {
    complete: boolean;
    pop: boolean;
    highlighted: boolean;
    hidden: boolean;
    selected: boolean;
}

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

export const getConfirmedLabelStyle = (
    position: number,
    targetLength: number,
): CSSProperties => {
    if (targetLength <= 0) return {};

    const angle = -90 + (360 / targetLength) * (position - 1);
    const angleRad = angle * (Math.PI / 180);
    const radiusPx = 24;
    const normalizeAxis = (value: number): string => Math.abs(value) < 0.005 ? "0.00" : value.toFixed(2);
    const x = Math.cos(angleRad) * radiusPx;
    const y = Math.sin(angleRad) * radiusPx;

    return {
        transform: `translate(-50%, -50%) translate(${normalizeAxis(x)}px, ${normalizeAxis(y)}px)`,
    };
};

const CONFIRMED_RING_GAP_DEGREES = 12;

const normalizeAngle = (angle: number): number => {
    const normalized = angle % 360;
    return normalized < 0 ? normalized + 360 : normalized;
};

const getConfirmedGapAngles = (
    positions: number[],
    targetLength: number,
): Array<{ start: number; end: number }> =>
    positions
        .map(position => {
            const angle = normalizeAngle((360 / targetLength) * (position - 1));
            const halfGap = CONFIRMED_RING_GAP_DEGREES / 2;
            return {
                start: normalizeAngle(angle - halfGap),
                end: normalizeAngle(angle + halfGap),
            };
        })
        .sort((left, right) => left.start - right.start);

const splitWrappedGaps = (
    gaps: Array<{ start: number; end: number }>,
): Array<{ start: number; end: number }> =>
    gaps.flatMap(gap => gap.start <= gap.end
        ? [gap]
        : [{ start: 0, end: gap.end }, { start: gap.start, end: 360 }]);

export const getConfirmedRingGradient = (
    positions: number[],
    targetLength: number,
    ringColor = "var(--confirmed-ring-color)",
): string => {
    if (targetLength <= 0 || positions.length === 0) return `conic-gradient(from -90deg, ${ringColor} 0deg 360deg)`;

    const gaps = splitWrappedGaps(getConfirmedGapAngles(positions, targetLength));
    const stops: string[] = [];
    let currentAngle = 0;

    gaps.forEach(({ start, end }) => {
        if (start > currentAngle) stops.push(`${ringColor} ${currentAngle.toFixed(2)}deg ${start.toFixed(2)}deg`);
        stops.push(`transparent ${start.toFixed(2)}deg ${end.toFixed(2)}deg`);
        currentAngle = Math.max(currentAngle, end);
    });

    if (currentAngle < 360) stops.push(`${ringColor} ${currentAngle.toFixed(2)}deg 360deg`);
    return `conic-gradient(from -90deg, ${stops.join(", ")})`;
};

export const getConfirmedRingStyle = (
    positions: number[],
    targetLength: number,
): CSSProperties => ({
    ["--confirmed-ring-gradient" as string]: getConfirmedRingGradient(positions, targetLength),
    ["--confirmed-ring-accent-gradient" as string]: getConfirmedRingGradient(
        positions,
        targetLength,
        "rgba(255, 255, 255, 0.18)",
    ),
});
