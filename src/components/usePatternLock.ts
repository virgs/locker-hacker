import * as React from "react";

import { Point as PointType } from "../math/point.ts";
import { getPoints, getCollidedPointIndex, getPointsInTheMiddle } from "../math/math.ts";
import {
    getDotAnnotationSelectionAtPointer,
    isRepeatedAnnotationPress,
} from "./DotAnnotationMenu.utils.ts";
import {
    getAnnotationSelections,
    type DotAnnotations,
    type DotAnnotationSelection,
} from "../game/dotAnnotations.ts";

interface UsePatternLockOptions {
    path: number[];
    cols: number;
    rows: number;
    pointActiveSize: number;
    disabled: boolean;
    allowOverlapping: boolean;
    allowJumping: boolean;
    blockedPoints?: number[];
    targetLength?: number;
    annotations?: DotAnnotations;
    onSelectPointAnnotation?: (index: number, selection: DotAnnotationSelection) => void;
    onChange?: (path: number[]) => void;
    onFinish?: () => void;
}

export interface GridLayout {
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
}

export interface ActiveAnnotationMenu {
    index: number;
    highlightedSelection: DotAnnotationSelection | null;
    selectedSelections: DotAnnotationSelection[];
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
    activeAnnotationMenu: ActiveAnnotationMenu | null;
    onHold: (e: React.MouseEvent) => void;
    onTouch: (e: React.TouchEvent) => void;
}

const TAP_MOVE_TOLERANCE_PX = 10;
const TOUCH_MOUSE_GUARD_MS = 750;
export const FIRST_DOT_POP_MOVE_PX = 4;

interface AnnotationPressRecord {
    index: number;
    timestamp: number;
}

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

export const isBlockedPoint = (
    index: number,
    blockedPoints: number[],
): boolean => index >= 0 && blockedPoints.includes(index);

export const getAvailableImplicitDots = (
    mid: number[],
    path: number[],
    allowOverlapping: boolean,
    blockedPoints: number[],
): number[] => mid.filter(point =>
    !isBlockedPoint(point, blockedPoints) &&
    (allowOverlapping || path.indexOf(point) === -1),
);

export const usePatternLock = ({
    path,
    cols,
    rows,
    pointActiveSize,
    disabled,
    allowOverlapping,
    allowJumping,
    blockedPoints = [],
    targetLength,
    annotations = {},
    onSelectPointAnnotation,
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
    const [activeAnnotationMenu, setActiveAnnotationMenu] = React.useState<ActiveAnnotationMenu | null>(null);
    const flashTimerRef        = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const gestureMovedRef      = React.useRef(false);
    const pressStartRef        = React.useRef<PointType | null>(null);
    const pressedPointRef      = React.useRef<number | null>(null);
    const lastTouchTimeRef     = React.useRef(0);
    const lastAnnotationPressRef = React.useRef<AnnotationPressRecord | null>(null);
    const activeAnnotationMenuRef = React.useRef<ActiveAnnotationMenu | null>(null);

    const updateActiveAnnotationMenu = React.useCallback((menu: ActiveAnnotationMenu | null): void => {
        activeAnnotationMenuRef.current = menu;
        setActiveAnnotationMenu(menu);
    }, []);

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
        const index = getCollidedPointIndex({ x: x - left, y: y - top }, points, pointActiveSize);
        return isBlockedPoint(index, blockedPoints) ? -1 : index;
    };

    const getPointCenter = React.useCallback((index: number): PointType | null => {
        const point = points[index];
        if (!point) return null;
        return {
            x: point.x + pointActiveSize / 2,
            y: point.y + pointActiveSize / 2,
        };
    }, [pointActiveSize, points]);

    const getAnnotationMenuSelection = React.useCallback((clientPosition: PointType): DotAnnotationSelection | null => {
        const activeMenu = activeAnnotationMenuRef.current;
        if (!activeMenu || !targetLength) return null;
        const center = getPointCenter(activeMenu.index);
        if (!center) return null;
        const { left, top } = wrapperRef.current.getBoundingClientRect();
        return getDotAnnotationSelectionAtPointer({
            x: clientPosition.x - left,
            y: clientPosition.y - top,
        }, center, targetLength);
    }, [getPointCenter, targetLength]);

    const checkCollision = (clientPosition: PointType): void => {
        const index = getPointIndexAtClientPosition(clientPosition);
        if (~index && path[path.length - 1] !== index) {
            if (allowOverlapping || path.indexOf(index) === -1) {
                if (allowJumping || !path.length) {
                    onChange?.([...path, index]);
                } else {
                    const mid = getPointsInTheMiddle(path[path.length - 1], index, cols);
                    const implicitDots = getAvailableImplicitDots(mid, path, allowOverlapping, blockedPoints);
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
        const pressedPointIndex = getPointIndexAtClientPosition(clientPosition);
        const now = Date.now();
        const shouldOpenAnnotationMenu = (
            pressedPointIndex >= 0 &&
            !!targetLength &&
            !!onSelectPointAnnotation &&
            isRepeatedAnnotationPress(lastAnnotationPressRef.current, pressedPointIndex, now)
        );

        setIsMouseDown(true);
        setFirstDotPopActive(false);
        gestureMovedRef.current = false;
        pressStartRef.current = clientPosition;
        pressedPointRef.current = pressedPointIndex;

        if (shouldOpenAnnotationMenu) {
            onChange?.([]);
            setInitialMousePosition(null);
            updateActiveAnnotationMenu({
                index: pressedPointIndex,
                highlightedSelection: null,
                selectedSelections: getAnnotationSelections(annotations[pressedPointIndex], targetLength ?? 0),
            });
            return;
        }

        updateActiveAnnotationMenu(null);
        setInitialMousePosition({ x: clientPosition.x - left, y: clientPosition.y - top });
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
            if (activeAnnotationMenuRef.current) {
                const highlightedSelection = getAnnotationMenuSelection({ x: clientX, y: clientY });
                if (highlightedSelection === activeAnnotationMenuRef.current.highlightedSelection) return;
                updateActiveAnnotationMenu({
                    ...activeAnnotationMenuRef.current,
                    highlightedSelection,
                });
                return;
            }
            if (!firstDotPopActive && shouldActivateFirstDotPop(pressStartRef.current, { x: clientX, y: clientY })) {
                setFirstDotPopActive(true);
            }
            if (!isStationaryGesture(pressStartRef.current, { x: clientX, y: clientY })) {
                gestureMovedRef.current = true;
            }
            checkCollision({ x: clientX, y: clientY });
        };
        const onTouchMove = ({ touches }: TouchEvent): void => {
            if (activeAnnotationMenuRef.current) {
                const highlightedSelection = getAnnotationMenuSelection({ x: touches[0].clientX, y: touches[0].clientY });
                if (highlightedSelection === activeAnnotationMenuRef.current.highlightedSelection) return;
                updateActiveAnnotationMenu({
                    ...activeAnnotationMenuRef.current,
                    highlightedSelection,
                });
                return;
            }
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

            const activeMenu = activeAnnotationMenuRef.current;
            if (activeMenu) {
                if (!disabled && activeMenu.highlightedSelection) {
                    onSelectPointAnnotation?.(activeMenu.index, activeMenu.highlightedSelection);
                }
                lastAnnotationPressRef.current = null;
                updateActiveAnnotationMenu(null);
                onChange?.([]);
                pressStartRef.current = null;
                pressedPointRef.current = null;
                return;
            }

            if (disabled) return;
            const tappedIndex = pressedPointRef.current;
            const tappedWithoutDrag = path.length <= 1 && !gestureMovedRef.current;

            if (tappedWithoutDrag && tappedIndex !== null && tappedIndex >= 0) {
                onChange?.([]);
                lastAnnotationPressRef.current = {
                    index: tappedIndex,
                    timestamp: Date.now(),
                };
                pressStartRef.current = null;
                pressedPointRef.current = null;
                return;
            }

            lastAnnotationPressRef.current = null;
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
    }, [disabled, onChange, onFinish, onSelectPointAnnotation, path, updateActiveAnnotationMenu]);

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
        activeAnnotationMenu,
        onHold,
        onTouch,
    };
};
