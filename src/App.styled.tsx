import styled from "styled-components";
import { BREAKPOINTS } from "./theme/breakpoints.ts";
import { MOBILE_SIDEBAR_COLLAPSED_HEIGHT_PX, getMobileMainAreaPaddingBottom } from "./App.constants.ts";

export const AppLayout = styled.div<{ $annotationMenuActive?: boolean }>`
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    position: relative;

    &::after {
        content: "";
        position: absolute;
        inset: 0;
        z-index: ${({ $annotationMenuActive }) => $annotationMenuActive ? 110 : -1};
        opacity: ${({ $annotationMenuActive }) => $annotationMenuActive ? 1 : 0};
        pointer-events: none;
        background: rgba(3, 6, 10, 0.42);
        transition: opacity 140ms ease;
    }
`;

export const ContentArea = styled.div<{ $annotationMenuActive?: boolean }>`
    display: flex;
    flex-direction: row;
    flex: 1;
    min-height: 0;
    overflow: ${({ $annotationMenuActive }) => $annotationMenuActive ? "visible" : "hidden"};
    position: relative;
    z-index: ${({ $annotationMenuActive }) => $annotationMenuActive ? 120 : 1};
`;

export const MainArea = styled.main<{ $annotationMenuActive?: boolean }>`
    flex: 1;
    height: 100%;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: ${({ $annotationMenuActive }) => $annotationMenuActive ? "visible" : "hidden"};
    box-sizing: border-box;
    position: relative;
    z-index: ${({ $annotationMenuActive }) => $annotationMenuActive ? 30 : 1};
    padding: 24px;
    padding-right: calc(220px + 24px);

    > * {
        transition: opacity 140ms ease, filter 140ms ease;
    }

    > :not(.pattern-lock-focus-layer) {
        opacity: ${({ $annotationMenuActive }) => $annotationMenuActive ? 0.28 : 1};
        filter: ${({ $annotationMenuActive }) => $annotationMenuActive ? "blur(2px) saturate(0.72)" : "none"};
    }

    ${BREAKPOINTS.xl} {
        padding-right: calc(440px + 24px);
    }

    ${BREAKPOINTS.mobile} {
        padding: 16px;
        padding-bottom: ${getMobileMainAreaPaddingBottom()};
    }
`;

export const Sidebar = styled.aside<{ $expanded?: boolean; $annotationMenuActive?: boolean }>`
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 10;
    background: var(--bs-body-bg, #060606);
    border-left: 1px solid ${({ $annotationMenuActive }) => $annotationMenuActive
        ? "rgba(255, 255, 255, 0.03)"
        : "rgba(255, 255, 255, 0.08)"};
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
    width: ${({ $expanded }) => $expanded ? '75%' : '220px'};
    transition: width 0.3s ease, border-color 140ms ease;

    ${BREAKPOINTS.xl} {
        width: ${({ $expanded }) => $expanded ? '75%' : '440px'};
    }

    ${BREAKPOINTS.mobile} {
        left: 0;
        right: 0;
        top: auto;
        bottom: 0;
        width: 100%;
        flex-direction: column;
        border-left: none;
        border-top: 1px solid ${({ $annotationMenuActive }) => $annotationMenuActive
            ? "rgba(255, 255, 255, 0.03)"
            : "rgba(255, 255, 255, 0.08)"};
        height: ${({ $expanded }) => $expanded ? '80%' : `${MOBILE_SIDEBAR_COLLAPSED_HEIGHT_PX}px`};
        transition: height 0.3s ease, border-color 140ms ease;
    }
`;

export const SidebarInner = styled.div`
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

export const SidebarDimmer = styled.div<{ $annotationMenuActive?: boolean }>`
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: opacity 140ms ease, filter 140ms ease;
    opacity: ${({ $annotationMenuActive }) => $annotationMenuActive ? 0.28 : 1};
    filter: ${({ $annotationMenuActive }) => $annotationMenuActive ? "blur(2px) saturate(0.72)" : "none"};
`;

export const SidebarHeader = styled.div`
    flex-shrink: 0;
    padding: 12px 8px 0;
    box-sizing: border-box;
    user-select: none;
    touch-action: none;

    ${BREAKPOINTS.mobile} {
        padding: 8px 16px 0;
    }
`;

export const SidebarContent = styled.div`
    flex: 1;
    min-height: 0;
    overflow-y: scroll;
    overscroll-behavior-y: contain;
    padding: 8px 8px 16px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;

    /* Always-visible scrollbar styling */
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;

    &::-webkit-scrollbar {
        width: 5px;
    }
    &::-webkit-scrollbar-track {
        background: transparent;
    }
    &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
    }

    ${BREAKPOINTS.mobile} {
        padding: 4px 16px 8px;
    }
`;

/** Always a perfect square at the measured available size.
 *  Size is computed by useLockSize watching MainArea's content area. */
export const PatternLockSizer = styled.div<{ $size: number }>`
    position: relative;
    z-index: 2;
    width: ${({ $size }) => $size}px;
    height: ${({ $size }) => $size}px;
`;

export const ClickOutsideOverlay = styled.div`
    position: absolute;
    inset: 0;
    z-index: 9;
    background: rgba(0, 0, 0, 0.3);
    cursor: pointer;
`;
