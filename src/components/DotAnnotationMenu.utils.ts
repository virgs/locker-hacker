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

export interface DotAnnotationMenuMetrics {
    radiusPx: number;
    hitRadiusPx: number;
    backdropDiameterPx: number;
    footprintRadiusPx: number;
}

export interface DotAnnotationMenuOffset {
    x: number;
    y: number;
}

export const DOT_ANNOTATION_DOUBLE_PRESS_MS = 350;
export const DOT_ANNOTATION_MENU_RADIUS_PX = 58;
export const DOT_ANNOTATION_MENU_HIT_RADIUS_PX = 24;
export const DOT_ANNOTATION_MENU_BACKDROP_PX = 164;
export const DOT_ANNOTATION_MENU_MOBILE_MIN_RADIUS_PX = 108;
export const DOT_ANNOTATION_MENU_MOBILE_MAX_RADIUS_PX = 148;
export const DOT_ANNOTATION_MENU_VIEWPORT_PADDING_PX = 28;

const clamp = (
    value: number,
    min: number,
    max: number,
): number => Math.min(max, Math.max(min, value));

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

export const getDotAnnotationMenuMetrics = (
    boardSizePx: number,
    isCompactViewport: boolean,
): DotAnnotationMenuMetrics => {
    const safeBoardSizePx = boardSizePx > 0 ? boardSizePx : DOT_ANNOTATION_MENU_BACKDROP_PX;

    if (!isCompactViewport) {
        return {
            radiusPx: DOT_ANNOTATION_MENU_RADIUS_PX,
            hitRadiusPx: DOT_ANNOTATION_MENU_HIT_RADIUS_PX,
            backdropDiameterPx: DOT_ANNOTATION_MENU_BACKDROP_PX,
            footprintRadiusPx: Math.max(
                DOT_ANNOTATION_MENU_BACKDROP_PX / 2,
                DOT_ANNOTATION_MENU_RADIUS_PX + DOT_ANNOTATION_MENU_HIT_RADIUS_PX + 18,
            ),
        };
    }

    const radiusPx = clamp(
        Math.round(safeBoardSizePx * 0.35),
        DOT_ANNOTATION_MENU_MOBILE_MIN_RADIUS_PX,
        DOT_ANNOTATION_MENU_MOBILE_MAX_RADIUS_PX,
    );

    const hitRadiusPx = clamp(Math.round(radiusPx * 0.34), 36, 48);
    const backdropDiameterPx = clamp(
        Math.round(safeBoardSizePx * 0.98),
        radiusPx * 2 + 92,
        safeBoardSizePx,
    );

    return {
        radiusPx,
        hitRadiusPx,
        backdropDiameterPx,
        footprintRadiusPx: Math.max(backdropDiameterPx / 2, radiusPx + hitRadiusPx + 26),
    };
};

export const getDotAnnotationMenuOffset = (
    centerInViewport: Point,
    footprintRadiusPx: number,
    viewportSize: { width: number; height: number },
    paddingPx = DOT_ANNOTATION_MENU_VIEWPORT_PADDING_PX,
): DotAnnotationMenuOffset => {
    const minX = paddingPx + footprintRadiusPx;
    const maxX = viewportSize.width - paddingPx - footprintRadiusPx;
    const minY = paddingPx + footprintRadiusPx;
    const maxY = viewportSize.height - paddingPx - footprintRadiusPx;

    return {
        x: clamp(clamp(centerInViewport.x, minX, maxX) - centerInViewport.x, -footprintRadiusPx, footprintRadiusPx),
        y: clamp(clamp(centerInViewport.y, minY, maxY) - centerInViewport.y, -footprintRadiusPx, footprintRadiusPx),
    };
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
        { selection: "eliminate", label: "Off", tone: "danger", ...toOffset(90, radiusPx) },
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
    radiusPx = DOT_ANNOTATION_MENU_RADIUS_PX,
    hitRadiusPx = DOT_ANNOTATION_MENU_HIT_RADIUS_PX,
): DotAnnotationSelection | null => {
    const options = getDotAnnotationMenuOptions(codeLength, radiusPx);
    const bestMatch = options
        .map(option => ({
            selection: option.selection,
            distance: Math.hypot(pointer.x - (center.x + option.x), pointer.y - (center.y + option.y)),
        }))
        .sort((left, right) => left.distance - right.distance)[0];

    if (!bestMatch || bestMatch.distance > hitRadiusPx) return null;
    return bestMatch.selection;
};
