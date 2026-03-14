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

type ScrollBoundary = "top" | "bottom" | "both" | "middle";

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
    const boundary = getScrollBoundary(scrollTop, clientHeight, scrollHeight);
    const atTop = boundary === "top" || boundary === "both";
    const atBottom = boundary === "bottom" || boundary === "both";

    if (atTop && touchDeltaY > thresholdPx) return "collapse";
    if (atBottom && touchDeltaY < -thresholdPx) return "expand";
    return null;
};

export const getScrollBoundary = (
    scrollTop: number,
    clientHeight: number,
    scrollHeight: number,
): ScrollBoundary => {
    const maxScrollTop = Math.max(0, scrollHeight - clientHeight);
    const atTop = scrollTop <= SCROLL_EDGE_EPSILON_PX;
    const atBottom = scrollTop >= maxScrollTop - SCROLL_EDGE_EPSILON_PX;

    if (atTop && atBottom) return "both";
    if (atTop) return "top";
    if (atBottom) return "bottom";
    return "middle";
};

const getBoundaryScrollTop = (
    boundary: ScrollBoundary,
    scrollTop: number,
    clientHeight: number,
    scrollHeight: number,
): number => {
    if (boundary === "top" || boundary === "both") return 0;
    if (boundary === "bottom") return Math.max(0, scrollHeight - clientHeight);
    return scrollTop;
};

const useSidebarResize = (isMobile: boolean): UseSidebarResizeResult => {
    const [expanded, setExpanded] = useState(false);
    const dragOrigin = useRef<DragOrigin | null>(null);
    const dragged = useRef(false);
    const lastExpandTime = useRef(0);
    const touchStartY = useRef<number | null>(null);
    const touchBoundary = useRef<ScrollBoundary>("middle");

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
        touchBoundary.current = getScrollBoundary(
            e.currentTarget.scrollTop,
            e.currentTarget.clientHeight,
            e.currentTarget.scrollHeight,
        );
    }, []);

    const onContentTouchMove = useCallback((e: TouchEvent<HTMLDivElement>): void => {
        if (!isMobile || touchStartY.current === null) return;
        const currentY = e.touches[0]?.clientY;
        if (currentY === undefined) return;

        const currentBoundary = getScrollBoundary(
            e.currentTarget.scrollTop,
            e.currentTarget.clientHeight,
            e.currentTarget.scrollHeight,
        );
        const activeBoundary = currentBoundary === "middle" ? touchBoundary.current : currentBoundary;
        const action = getScrollBoundaryAction({
            scrollTop: getBoundaryScrollTop(
                activeBoundary,
                e.currentTarget.scrollTop,
                e.currentTarget.clientHeight,
                e.currentTarget.scrollHeight,
            ),
            clientHeight: e.currentTarget.clientHeight,
            scrollHeight: e.currentTarget.scrollHeight,
            touchDeltaY: currentY - touchStartY.current,
            thresholdPx: DRAG_THRESHOLD_PX,
        });
        if (!action) return;

        e.preventDefault();
        if (action === "expand") expand(); else collapse();
        touchStartY.current = currentY;
        touchBoundary.current = currentBoundary;
    }, [collapse, expand, isMobile]);

    const onContentTouchEnd = useCallback((): void => {
        touchStartY.current = null;
        touchBoundary.current = "middle";
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
