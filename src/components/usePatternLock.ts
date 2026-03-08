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
    flashingPoints: Set<number>;
    completionFlash: boolean;
    onHold: (e: React.MouseEvent) => void;
    onTouch: (e: React.TouchEvent) => void;
}

export const usePatternLock = ({
    path,
    cols,
    rows,
    pointActiveSize,
    disabled,
    allowOverlapping,
    allowJumping,
    targetLength,
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
    const [flashingPoints, setFlashingPoints]     = React.useState<Set<number>>(new Set());
    const flashTimerRef      = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const onResize = (): [number, number] => {
        const el = wrapperRef.current;
        if (!el || !el.isConnected) return [0, 0];
        const { top, left } = el.getBoundingClientRect();
        setWrapperPosition({ x: left + window.scrollX, y: top + window.scrollY });
        setContainerWidth(el.offsetWidth);
        setContainerHeight(el.offsetHeight);
        return [top, left];
    };

    const checkCollision = ({ x, y }: PointType): void => {
        const { top, left } = wrapperRef.current.getBoundingClientRect();
        const mouse = { x: x - left, y: y - top };
        const index = getCollidedPointIndex(mouse, points, pointActiveSize);
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

    const onHold = ({ clientX, clientY }: React.MouseEvent): void => {
        if (disabled) return;
        const [top, left] = onResize();
        setInitialMousePosition({ x: clientX - left, y: clientY - top });
        setIsMouseDown(true);
        checkCollision({ x: clientX, y: clientY });
    };

    const onTouch = ({ touches }: React.TouchEvent): void => {
        if (disabled) return;
        const [top, left] = onResize();
        setInitialMousePosition({ x: touches[0].clientX - left, y: touches[0].clientY - top });
        setIsMouseDown(true);
        checkCollision({ x: touches[0].clientX, y: touches[0].clientY });
    };

    React.useEffect(() => {
        const ref = wrapperRef.current;
        if (!isMouseDown) return;
        const onMouseMove = ({ clientX, clientY }: MouseEvent): void =>
            checkCollision({ x: clientX, y: clientY });
        const onTouchMove = ({ touches }: TouchEvent): void =>
            checkCollision({ x: touches[0].clientX, y: touches[0].clientY });
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
        const onRelease = (): void => {
            setIsMouseDown(false);
            setInitialMousePosition(null);
            if (!disabled && path.length) onFinish?.();
        };
        window.addEventListener("mouseup", onRelease);
        window.addEventListener("touchend", onRelease);
        return () => {
            window.removeEventListener("mouseup", onRelease);
            window.removeEventListener("touchend", onRelease);
        };
    }, [disabled, path, onFinish]);

    const completionFlash = isMouseDown && !!targetLength && path.length >= targetLength;

    React.useEffect(() => {
        return () => {
            if (flashTimerRef.current !== null) clearTimeout(flashTimerRef.current);
        };
    }, []);

    return { wrapperRef, points, gridLayout, wrapperPosition, isMouseDown, initialMousePosition, flashingPoints, completionFlash, onHold, onTouch };
};
