import * as React from "react";

import { Point as PointType } from "../math/point.ts";
import { getPoints, getCollidedPointIndex, getPointsInTheMiddle } from "../math/math.ts";

interface UsePatternLockOptions {
    path: number[];
    cols: number;
    rows: number;
    pointActiveSize: number;
    disabled: boolean;
    allowOverlapping: boolean;
    allowJumping: boolean;
    targetLength?: number;
    onTogglePointAnnotation?: (index: number) => void;
    onChange?: (path: number[]) => void;
    onFinish?: () => void;
}

export interface GridLayout {
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
}

export interface UsePatternLockResult {
    wrapperRef: React.MutableRefObject<HTMLDivElement>;
    points: PointType[];
    gridLayout: GridLayout;
    wrapperPosition: PointType;
    isMouseDown: boolean;
    initialMousePosition: PointType | null;
    firstDotPopActive: boolean;
    flashingPoints: Set<number>;
    completionFlash: boolean;
    onHold: (e: React.MouseEvent) => void;
    onTouch: (e: React.TouchEvent) => void;
}

const TAP_MOVE_TOLERANCE_PX = 10;
const TOUCH_MOUSE_GUARD_MS = 750;
export const FIRST_DOT_POP_MOVE_PX = 4;

export const isStationaryGesture = (
    start: PointType | null,
    current: PointType,
): boolean => {
    if (!start) return false;
    return Math.hypot(current.x - start.x, current.y - start.y) <= TAP_MOVE_TOLERANCE_PX;
};

export const shouldActivateFirstDotPop = (
    start: PointType | null,
    current: PointType,
): boolean => {
    if (!start) return false;
    return Math.hypot(current.x - start.x, current.y - start.y) >= FIRST_DOT_POP_MOVE_PX;
};

export const shouldIgnoreEmulatedMouseEvent = (
    lastTouchTime: number,
    now: number,
): boolean => now - lastTouchTime <= TOUCH_MOUSE_GUARD_MS;

export const usePatternLock = ({
    path,
    cols,
    rows,
    pointActiveSize,
    disabled,
    allowOverlapping,
    allowJumping,
    targetLength,
    onTogglePointAnnotation,
    onChange,
    onFinish,
}: UsePatternLockOptions): UsePatternLockResult => {
    const wrapperRef = React.useRef<HTMLDivElement>(document.createElement("div"));
    const [containerWidth, setContainerWidth]   = React.useState<number>(0);
    const [containerHeight, setContainerHeight] = React.useState<number>(0);
    const [points, setPoints]                   = React.useState<PointType[]>([]);
    const [wrapperPosition, setWrapperPosition] = React.useState<PointType>({ x: 0, y: 0 });
    const [gridLayout, setGridLayout]           = React.useState<GridLayout>({ offsetX: 0, offsetY: 0, width: 0, height: 0 });
    const [isMouseDown, setIsMouseDown]         = React.useState<boolean>(false);
    const [initialMousePosition, setInitialMousePosition] = React.useState<PointType | null>(null);
    const [firstDotPopActive, setFirstDotPopActive] = React.useState<boolean>(false);
    const [flashingPoints, setFlashingPoints]     = React.useState<Set<number>>(new Set());
    const flashTimerRef      = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const gestureMovedRef    = React.useRef(false);
    const pressStartRef      = React.useRef<PointType | null>(null);
    const pressedPointRef    = React.useRef<number | null>(null);
    const lastTouchTimeRef   = React.useRef(0);

    const onResize = (): [number, number] => {
        const el = wrapperRef.current;
        if (!el || !el.isConnected) return [0, 0];
        const { top, left } = el.getBoundingClientRect();
        setWrapperPosition({ x: left + window.scrollX, y: top + window.scrollY });
        setContainerWidth(el.offsetWidth);
        setContainerHeight(el.offsetHeight);
        return [top, left];
    };

    const getPointIndexAtClientPosition = ({ x, y }: PointType): number => {
        const { top, left } = wrapperRef.current.getBoundingClientRect();
        return getCollidedPointIndex({ x: x - left, y: y - top }, points, pointActiveSize);
    };

    const checkCollision = ({ x, y }: PointType): void => {
        const index = getPointIndexAtClientPosition({ x, y });
        if (~index && path[path.length - 1] !== index) {
            if (allowOverlapping || path.indexOf(index) === -1) {
                if (allowJumping || !path.length) {
                    onChange?.([...path, index]);
                } else {
                    const mid = getPointsInTheMiddle(path[path.length - 1], index, cols);
                    const implicitDots = allowOverlapping
                        ? mid
                        : mid.filter(p => path.indexOf(p) === -1);
                    if (implicitDots.length > 0) {
                        if (flashTimerRef.current !== null) clearTimeout(flashTimerRef.current);
                        setFlashingPoints(new Set(implicitDots));
                        flashTimerRef.current = setTimeout(() => setFlashingPoints(new Set()), 350);
                    }
                    onChange?.([...path, ...implicitDots, index]);
                }
            }
        }
    };

    const beginInteraction = (clientPosition: PointType): void => {
        const [top, left] = onResize();
        setInitialMousePosition({ x: clientPosition.x - left, y: clientPosition.y - top });
        setIsMouseDown(true);
        setFirstDotPopActive(false);
        gestureMovedRef.current = false;
        pressStartRef.current = clientPosition;
        pressedPointRef.current = getPointIndexAtClientPosition(clientPosition);
        checkCollision(clientPosition);
    };

    const onHold = ({ clientX, clientY }: React.MouseEvent): void => {
        if (disabled) return;
        if (shouldIgnoreEmulatedMouseEvent(lastTouchTimeRef.current, Date.now())) return;
        beginInteraction({ x: clientX, y: clientY });
    };

    const onTouch = ({ touches }: React.TouchEvent): void => {
        if (disabled) return;
        lastTouchTimeRef.current = Date.now();
        beginInteraction({ x: touches[0].clientX, y: touches[0].clientY });
    };

    React.useEffect(() => {
        const ref = wrapperRef.current;
        if (!isMouseDown) return;
        const onMouseMove = ({ clientX, clientY }: MouseEvent): void => {
            if (!firstDotPopActive && shouldActivateFirstDotPop(pressStartRef.current, { x: clientX, y: clientY })) {
                setFirstDotPopActive(true);
            }
            if (!isStationaryGesture(pressStartRef.current, { x: clientX, y: clientY })) {
                gestureMovedRef.current = true;
            }
            checkCollision({ x: clientX, y: clientY });
        };
        const onTouchMove = ({ touches }: TouchEvent): void => {
            if (!firstDotPopActive && shouldActivateFirstDotPop(pressStartRef.current, { x: touches[0].clientX, y: touches[0].clientY })) {
                setFirstDotPopActive(true);
            }
            if (!isStationaryGesture(pressStartRef.current, { x: touches[0].clientX, y: touches[0].clientY })) {
                gestureMovedRef.current = true;
            }
            checkCollision({ x: touches[0].clientX, y: touches[0].clientY });
        };
        ref.addEventListener("mousemove", onMouseMove);
        ref.addEventListener("touchmove", onTouchMove);
        return () => {
            ref.removeEventListener("mousemove", onMouseMove);
            ref.removeEventListener("touchmove", onTouchMove);
        };
    });

    React.useEffect(() => {
        setContainerWidth(wrapperRef.current.offsetWidth);
        setContainerHeight(wrapperRef.current.offsetHeight);
    }, []);

    React.useEffect(() => {
        const ref = wrapperRef.current;
        const observer = new ResizeObserver(() => onResize());
        observer.observe(ref);
        return () => observer.disconnect();
    }, []);

    React.useEffect(() => {
        const rafId = window.requestAnimationFrame(() => {
            setPoints(getPoints({ pointActiveSize, containerWidth, containerHeight, cols, rows }));
            const cellSize = containerWidth > 0 && containerHeight > 0
                ? Math.min(containerWidth / cols, containerHeight / rows)
                : 0;
            setGridLayout({
                offsetX: (containerWidth  - cellSize * cols) / 2,
                offsetY: (containerHeight - cellSize * rows) / 2,
                width  : cellSize * cols,
                height : cellSize * rows,
            });
            onResize();
        });
        return () => window.cancelAnimationFrame(rafId);
    }, [containerWidth, containerHeight, pointActiveSize, cols, rows]);

    React.useEffect(() => {
        const finishInteraction = (): void => {
            setIsMouseDown(false);
            setInitialMousePosition(null);
            setFirstDotPopActive(false);
            if (disabled) return;
            const tappedIndex = pressedPointRef.current;
            const tappedWithoutDrag = path.length <= 1 && !gestureMovedRef.current;

            if (tappedWithoutDrag && tappedIndex !== null && tappedIndex >= 0) {
                onChange?.([]);
                onTogglePointAnnotation?.(tappedIndex);
                pressStartRef.current = null;
                pressedPointRef.current = null;
                return;
            }

            pressStartRef.current = null;
            pressedPointRef.current = null;
            if (path.length) onFinish?.();
        };

        const onMouseRelease = (): void => {
            if (shouldIgnoreEmulatedMouseEvent(lastTouchTimeRef.current, Date.now())) return;
            finishInteraction();
        };
        const onTouchRelease = (): void => {
            lastTouchTimeRef.current = Date.now();
            finishInteraction();
        };

        window.addEventListener("mouseup", onMouseRelease);
        window.addEventListener("touchend", onTouchRelease);
        return () => {
            window.removeEventListener("mouseup", onMouseRelease);
            window.removeEventListener("touchend", onTouchRelease);
        };
    }, [disabled, onChange, onFinish, onTogglePointAnnotation, path]);

    const completionFlash = isMouseDown && !!targetLength && path.length >= targetLength;

    React.useEffect(() => {
        return () => {
            if (flashTimerRef.current !== null) clearTimeout(flashTimerRef.current);
        };
    }, []);

    return {
        wrapperRef,
        points,
        gridLayout,
        wrapperPosition,
        isMouseDown,
        initialMousePosition,
        firstDotPopActive,
        flashingPoints,
        completionFlash,
        onHold,
        onTouch,
    };
};
