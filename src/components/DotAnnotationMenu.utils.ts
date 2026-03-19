import type { Point } from "../math/point.ts";
import type { DotAnnotationSelection } from "../game/dotAnnotations.ts";

export interface DotAnnotationMenuOption {
    selection: DotAnnotationSelection;
    label: string;
    kind: "action" | "position";
    tone: "neutral" | "danger" | "success";
    angleDeg: number;
    x: number;
    y: number;
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

export const DOT_ANNOTATION_LONG_PRESS_MS = 420;
export const DOT_ANNOTATION_MENU_RADIUS_PX = 74;
export const DOT_ANNOTATION_MENU_HIT_RADIUS_PX = 28;
export const DOT_ANNOTATION_MENU_BACKDROP_PX = 196;
export const DOT_ANNOTATION_MENU_MOBILE_MIN_RADIUS_PX = 108;
export const DOT_ANNOTATION_MENU_MOBILE_MAX_RADIUS_PX = 148;
export const DOT_ANNOTATION_MENU_VIEWPORT_PADDING_PX = 28;
export const DOT_ANNOTATION_MENU_TOP_LEFT_ACTION_ANGLE_DEG = -170;
export const DOT_ANNOTATION_MENU_TOP_RIGHT_ACTION_ANGLE_DEG = -10;
export const DOT_ANNOTATION_MENU_CLEAR_ANGLE_DEG = 90;
export const DOT_ANNOTATION_MENU_POINTING_MIN_DISTANCE_RATIO = 0.24;

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

const normalizeAngleDeg = (angleDeg: number): number => ((angleDeg + 180) % 360 + 360) % 360 - 180;

const getAngleDeltaDeg = (
    left: number,
    right: number,
): number => normalizeAngleDeg(left - right);

const getPositionAngles = (codeLength: number): number[] => {
    if (codeLength <= 1) return [-90];

    return Array.from({ length: codeLength }, (_, index) => {
        const ratio = index / (codeLength - 1);
        return -138 + ratio * 96;
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
            kind: "position" as const,
            tone: "success" as const,
            angleDeg: angle,
            x: offset.x,
            y: offset.y,
        };
    });

    return [
        {
            selection: "eliminate",
            label: "Eliminate",
            kind: "action",
            tone: "danger",
            angleDeg: DOT_ANNOTATION_MENU_TOP_LEFT_ACTION_ANGLE_DEG,
            ...toOffset(DOT_ANNOTATION_MENU_TOP_LEFT_ACTION_ANGLE_DEG, radiusPx),
        },
        ...positionOptions,
        {
            selection: "all",
            label: "All",
            kind: "action",
            tone: "success",
            angleDeg: DOT_ANNOTATION_MENU_TOP_RIGHT_ACTION_ANGLE_DEG,
            ...toOffset(DOT_ANNOTATION_MENU_TOP_RIGHT_ACTION_ANGLE_DEG, radiusPx),
        },
        {
            selection: "clear",
            label: "Clear",
            kind: "action",
            tone: "neutral",
            angleDeg: DOT_ANNOTATION_MENU_CLEAR_ANGLE_DEG,
            ...toOffset(DOT_ANNOTATION_MENU_CLEAR_ANGLE_DEG, radiusPx),
        },
    ];
};

export const getDotAnnotationSelectionAtPointer = (
    pointer: Point,
    center: Point,
    codeLength: number,
    radiusPx = DOT_ANNOTATION_MENU_RADIUS_PX,
    hitRadiusPx = DOT_ANNOTATION_MENU_HIT_RADIUS_PX,
): DotAnnotationSelection | null => {
    const options = getDotAnnotationMenuOptions(codeLength, radiusPx);
    const distanceFromCenter = Math.hypot(pointer.x - center.x, pointer.y - center.y);
    const minPointingDistance = Math.max(hitRadiusPx * 0.75, radiusPx * DOT_ANNOTATION_MENU_POINTING_MIN_DISTANCE_RATIO);

    if (distanceFromCenter < minPointingDistance) return null;

    const pointerAngleDeg = Math.atan2(pointer.y - center.y, pointer.x - center.x) * (180 / Math.PI);
    const bestMatch = options
        .map(option => ({
            selection: option.selection,
            angleDistance: Math.abs(getAngleDeltaDeg(pointerAngleDeg, option.angleDeg)),
        }))
        .sort((left, right) => left.angleDistance - right.angleDistance)[0];

    if (!bestMatch) return null;
    return bestMatch.selection;
};
