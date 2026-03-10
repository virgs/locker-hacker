import styled from "styled-components";
import { BREAKPOINTS } from "./theme/breakpoints.ts";

export const AppLayout = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
`;

export const ContentArea = styled.div`
    display: flex;
    flex-direction: row;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    position: relative;
`;

export const MainArea = styled.main`
    flex: 1;
    height: 100%;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    box-sizing: border-box;
    position: relative;
    padding: 24px;
    padding-right: calc(220px + 24px);

    ${BREAKPOINTS.xl} {
        padding-right: calc(440px + 24px);
    }

    ${BREAKPOINTS.mobile} {
        padding: 16px;
        padding-bottom: calc(160px + 16px);
    }
`;

export const Sidebar = styled.aside<{ $expanded?: boolean }>`
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 10;
    background: var(--bs-body-bg, #060606);
    border-left: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
    width: ${({ $expanded }) => $expanded ? '75%' : '220px'};
    transition: width 0.3s ease;

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
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        height: ${({ $expanded }) => $expanded ? '80%' : '160px'};
        transition: height 0.3s ease;
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

export const SidebarHeader = styled.div`
    flex-shrink: 0;
    padding: 12px 8px 0;
    box-sizing: border-box;

    ${BREAKPOINTS.mobile} {
        padding: 8px 16px 0;
    }
`;

export const SidebarContent = styled.div`
    flex: 1;
    min-height: 0;
    overflow-y: scroll;
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

