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
