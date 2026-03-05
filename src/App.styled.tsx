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

    ${BREAKPOINTS.mobile} {
        flex-direction: column;
    }
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
    padding: 24px;
    padding-left: calc(220px + 24px); /* mirrors sidebar width + breathing room */

    ${BREAKPOINTS.xl} {
        padding-left: calc(440px + 24px);
    }

    ${BREAKPOINTS.mobile} {
        flex: none;
        width: 100%;
        height: auto;
        padding: 16px;
    }
`;

export const Sidebar = styled.aside<{ $expanded?: boolean }>`
    width: 220px;
    height: 100%;
    flex-shrink: 0;
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
    transition: width 0.3s ease, height 0.3s ease;

    ${({ $expanded }) => $expanded && `
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 75%;
        z-index: 10;
        background: var(--bs-body-bg, #060606);
    `}

    ${BREAKPOINTS.xl} {
        width: ${({ $expanded }) => $expanded ? '75%' : '440px'};
    }

    ${BREAKPOINTS.mobile} {
        width: 100%;
        flex-direction: column;
        min-height: 0;

        ${({ $expanded }) => $expanded ? `
            flex: none;
            height: 80%;
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            top: auto;
            z-index: 10;
            background: var(--bs-body-bg, #060606);
        ` : `
            flex: 1;
            height: auto;
        `}
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

/** Constrains the active PatternLock to 500 px on desktop and to the
 *  viewport width (minus padding) on mobile so it never overflows.
 *  On intermediate screens, max-width/max-height ensure the lock
 *  shrinks gracefully rather than touching the edges. */
export const PatternLockSizer = styled.div`
    width: 500px;
    height: 500px;
    max-width: 100%;
    max-height: 100%;

    ${BREAKPOINTS.mobile} {
        width: calc(100vw - 32px);
        height: calc(100vw - 32px);
    }
`;

export const ClickOutsideOverlay = styled.div`
    position: absolute;
    inset: 0;
    z-index: 9;
    background: rgba(0, 0, 0, 0.3);
    cursor: pointer;
`;

