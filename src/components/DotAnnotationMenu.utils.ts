import type { Point } from "../math/point.ts";
import type { DotAnnotationSelection } from "../game/dotAnnotations.ts";

export interface DotAnnotationMenuOption {
    selection: DotAnnotationSelection;
    label: string;
    tone: "neutral" | "danger" | "success";
    x: number;
    y: number;
}

export interface AnnotationPressRecord {
    index: number;
    timestamp: number;
}

export const DOT_ANNOTATION_DOUBLE_PRESS_MS = 320;
export const DOT_ANNOTATION_MENU_RADIUS_PX = 58;
export const DOT_ANNOTATION_MENU_HIT_RADIUS_PX = 24;

const toOffset = (angleDeg: number, radiusPx: number): Point => {
    const angleRad = angleDeg * (Math.PI / 180);
    return {
        x: Math.cos(angleRad) * radiusPx,
        y: Math.sin(angleRad) * radiusPx,
    };
};

const getPositionAngles = (codeLength: number): number[] => {
    if (codeLength <= 1) return [-90];

    return Array.from({ length: codeLength }, (_, index) => {
        const ratio = index / (codeLength - 1);
        return -150 + ratio * 120;
    });
};

export const getDotAnnotationMenuOptions = (
    codeLength: number,
    radiusPx = DOT_ANNOTATION_MENU_RADIUS_PX,
): DotAnnotationMenuOption[] => {
    const positionOptions = getPositionAngles(codeLength).map((angle, index) => {
        const offset = toOffset(angle, radiusPx);
        return {
            selection: `position-${index + 1}` as const,
            label: `${index + 1}`,
            tone: "success" as const,
            x: offset.x,
            y: offset.y,
        };
    });

    return [
        ...positionOptions,
        { selection: "clear", label: "Clear", tone: "neutral", ...toOffset(150, radiusPx) },
        { selection: "eliminate", label: "Elim", tone: "danger", ...toOffset(90, radiusPx) },
        { selection: "all", label: "All", tone: "success", ...toOffset(30, radiusPx) },
    ];
};

export const isRepeatedAnnotationPress = (
    previousPress: AnnotationPressRecord | null,
    index: number,
    timestamp: number,
    windowMs = DOT_ANNOTATION_DOUBLE_PRESS_MS,
): boolean =>
    previousPress !== null &&
    previousPress.index === index &&
    timestamp - previousPress.timestamp <= windowMs;

export const getDotAnnotationSelectionAtPointer = (
    pointer: Point,
    center: Point,
    codeLength: number,
): DotAnnotationSelection | null => {
    const options = getDotAnnotationMenuOptions(codeLength);
    const bestMatch = options
        .map(option => ({
            selection: option.selection,
            distance: Math.hypot(pointer.x - (center.x + option.x), pointer.y - (center.y + option.y)),
        }))
        .sort((left, right) => left.distance - right.distance)[0];

    if (!bestMatch || bestMatch.distance > DOT_ANNOTATION_MENU_HIT_RADIUS_PX) return null;
    return bestMatch.selection;
};
