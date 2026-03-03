import styled from "styled-components";

const MOBILE = "@media (max-width: 600px)";
const XL     = "@media (min-width: 1400px)";

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

    ${MOBILE} {
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
    padding-left: 220px; /* mirrors sidebar width so content sits at true viewport centre */

    ${XL} {
        padding-left: 440px;
    }

    ${MOBILE} {
        flex: none;
        width: 100%;
        height: auto;
        padding: 16px;
    }
`;

export const Sidebar = styled.aside`
    width: 220px;
    height: 100%;
    flex-shrink: 0;
    overflow-y: scroll;
    padding: 16px 8px;
    box-sizing: border-box;
    border-left: 1px solid rgba(255, 255, 255, 0.1);
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

    ${XL} {
        width: 440px;
    }

    ${MOBILE} {
        width: 100%;
        /* flex: 1 + min-height: 0 lets this child grow into remaining space
           AND enables overflow-y: scroll to actually scroll (without min-height: 0
           the browser does not impose a height limit so nothing scrolls). */
        flex: 1;
        min-height: 0;
        height: auto;
        border-left: none;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        padding: 8px 16px;
    }
`;

/** Constrains the active PatternLock to 500 px on desktop and to the
 *  viewport width (minus padding) on mobile so it never overflows. */
export const PatternLockSizer = styled.div`
    width: 500px;
    height: 500px;

    ${MOBILE} {
        width: calc(100vw - 32px);
        height: calc(100vw - 32px);
    }
`;
