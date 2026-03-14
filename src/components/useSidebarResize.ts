import { useState, useCallback, useRef, type PointerEvent, type TouchEvent } from "react";
import { DRAG_THRESHOLD_PX } from "./ResizeHandle.constants.ts";

const EXPAND_GUARD_MS = 300;
const SCROLL_EDGE_EPSILON_PX = 2;

interface DragOrigin {
    x: number;
    y: number;
}

export interface UseSidebarResizeResult {
    expanded: boolean;
    toggle: () => void;
    collapse: () => void;
    onPointerDown: (e: PointerEvent<Element>) => void;
    onPointerMove: (e: PointerEvent<Element>) => void;
    onPointerUp: (e: PointerEvent<Element>) => void;
    onContentTouchStart: (e: TouchEvent<HTMLDivElement>) => void;
    onContentTouchMove: (e: TouchEvent<HTMLDivElement>) => void;
    onContentTouchEnd: () => void;
}

export const getPointerResizeDelta = (
    origin: DragOrigin,
    current: Pick<DragOrigin, "x" | "y">,
    isMobile: boolean,
): number => isMobile ? origin.y - current.y : origin.x - current.x;

export const getScrollBoundaryAction = ({
    scrollTop,
    clientHeight,
    scrollHeight,
    touchDeltaY,
    thresholdPx,
}: {
    scrollTop: number;
    clientHeight: number;
    scrollHeight: number;
    touchDeltaY: number;
    thresholdPx: number;
}): "expand" | "collapse" | null => {
    const maxScrollTop = Math.max(0, scrollHeight - clientHeight);
    const atTop = scrollTop <= SCROLL_EDGE_EPSILON_PX;
    const atBottom = scrollTop >= maxScrollTop - SCROLL_EDGE_EPSILON_PX;

    if (atTop && touchDeltaY > thresholdPx) return "collapse";
    if (atBottom && touchDeltaY < -thresholdPx) return "expand";
    return null;
};

const useSidebarResize = (isMobile: boolean): UseSidebarResizeResult => {
    const [expanded, setExpanded] = useState(false);
    const dragOrigin = useRef<DragOrigin | null>(null);
    const dragged = useRef(false);
    const lastExpandTime = useRef(0);
    const touchStartY = useRef<number | null>(null);

    const expand = useCallback((): void => {
        lastExpandTime.current = Date.now();
        setExpanded(true);
    }, []);

    const toggle = useCallback((): void => {
        setExpanded(prev => {
            if (!prev) lastExpandTime.current = Date.now();
            return !prev;
        });
    }, []);

    const collapse = useCallback((): void => {
        if (Date.now() - lastExpandTime.current < EXPAND_GUARD_MS) return;
        setExpanded(false);
    }, []);

    const onPointerDown = useCallback((e: PointerEvent<Element>): void => {
        dragOrigin.current = { x: e.clientX, y: e.clientY };
        dragged.current = false;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }, []);

    const onPointerMove = useCallback((e: PointerEvent<Element>): void => {
        if (!dragOrigin.current) return;
        const delta = getPointerResizeDelta(dragOrigin.current, { x: e.clientX, y: e.clientY }, isMobile);
        if (Math.abs(delta) > DRAG_THRESHOLD_PX) {
            dragged.current = true;
            if (delta > 0) expand(); else setExpanded(false);
        }
    }, [isMobile, expand]);

    const onPointerUp = useCallback((e: PointerEvent<Element>): void => {
        const currentTarget = e.currentTarget as HTMLElement;
        if (currentTarget.hasPointerCapture(e.pointerId)) {
            currentTarget.releasePointerCapture(e.pointerId);
        }
        if (!dragged.current) toggle();
        dragOrigin.current = null;
        dragged.current = false;
    }, [toggle]);

    const onContentTouchStart = useCallback((e: TouchEvent<HTMLDivElement>): void => {
        touchStartY.current = e.touches[0]?.clientY ?? null;
    }, []);

    const onContentTouchMove = useCallback((e: TouchEvent<HTMLDivElement>): void => {
        if (!isMobile || touchStartY.current === null) return;
        const currentY = e.touches[0]?.clientY;
        if (currentY === undefined) return;

        const action = getScrollBoundaryAction({
            scrollTop: e.currentTarget.scrollTop,
            clientHeight: e.currentTarget.clientHeight,
            scrollHeight: e.currentTarget.scrollHeight,
            touchDeltaY: currentY - touchStartY.current,
            thresholdPx: DRAG_THRESHOLD_PX,
        });
        if (!action) return;

        e.preventDefault();
        if (action === "expand") expand(); else collapse();
        touchStartY.current = currentY;
    }, [collapse, expand, isMobile]);

    const onContentTouchEnd = useCallback((): void => {
        touchStartY.current = null;
    }, []);

    return {
        expanded,
        toggle,
        collapse,
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onContentTouchStart,
        onContentTouchMove,
        onContentTouchEnd,
    };
};

export default useSidebarResize;
