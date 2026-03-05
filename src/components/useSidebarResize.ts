import { useState, useCallback, useRef, type PointerEvent } from "react";
import { DRAG_THRESHOLD_PX } from "./ResizeHandle.constants.ts";

const EXPAND_GUARD_MS = 300;

interface DragOrigin {
    x: number;
    y: number;
}

export interface UseSidebarResizeResult {
    expanded: boolean;
    toggle: () => void;
    collapse: () => void;
    onPointerDown: (e: PointerEvent) => void;
    onPointerMove: (e: PointerEvent) => void;
    onPointerUp: (e: PointerEvent) => void;
}

const useSidebarResize = (isMobile: boolean): UseSidebarResizeResult => {
    const [expanded, setExpanded] = useState(false);
    const dragOrigin = useRef<DragOrigin | null>(null);
    const dragged = useRef(false);
    const lastExpandTime = useRef(0);

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

    const onPointerDown = useCallback((e: PointerEvent): void => {
        dragOrigin.current = { x: e.clientX, y: e.clientY };
        dragged.current = false;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }, []);

    const onPointerMove = useCallback((e: PointerEvent): void => {
        if (!dragOrigin.current) return;
        const delta = isMobile
            ? dragOrigin.current.y - e.clientY
            : dragOrigin.current.x - e.clientX;
        if (Math.abs(delta) > DRAG_THRESHOLD_PX) {
            dragged.current = true;
            if (delta > 0) expand(); else setExpanded(false);
        }
    }, [isMobile, expand]);

    const onPointerUp = useCallback((e: PointerEvent): void => {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        if (!dragged.current) toggle();
        dragOrigin.current = null;
        dragged.current = false;
    }, [toggle]);

    return { expanded, toggle, collapse, onPointerDown, onPointerMove, onPointerUp };
};

export default useSidebarResize;

