import styled, { css } from "styled-components";
import { BREAKPOINTS } from "../theme/breakpoints.ts";

export const PlayAreaCounter = styled.div<{ $side: "left" | "right" }>`
    position: absolute;
    top: 16px;
    ${({ $side }) => $side === "left" ? "left: 16px;" : "right: calc(220px + 16px);"}
    display: flex;
    flex-direction: column;
    align-items: ${({ $side }) => $side === "left" ? "flex-start" : "flex-end"};
    gap: 6px;
    padding: 10px 12px;
    border-radius: 16px;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
    backdrop-filter: blur(10px) saturate(1.05);
    pointer-events: none;
    user-select: none;

    ${BREAKPOINTS.mobile} {
        top: 12px;
        ${({ $side }) => $side === "left" ? "left: 12px;" : "right: 12px;"}
        gap: 5px;
        padding: 8px 10px;
        border-radius: 14px;
    }

    ${BREAKPOINTS.xl} {
        ${({ $side }) => $side === "left" ? "" : "right: calc(440px + 16px);"}
    }
`;

export const CounterMetric = styled.div<{ $side: "left" | "right" }>`
    display: flex;
    align-items: center;
    justify-content: ${({ $side }) => $side === "left" ? "flex-start" : "flex-end"};
    gap: 7px;
    min-height: 14px;
    width: 100%;
`;

export const CounterLabel = styled.span<{ $side: "left" | "right" }>`
    font-size: 0.68rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.42);
    letter-spacing: 0.08em;
    line-height: 1;
    text-transform: uppercase;
    text-align: ${({ $side }) => $side === "left" ? "left" : "right"};

    ${BREAKPOINTS.mobile} {
        display: none;
    }
`;

export const CounterValue = styled.span<{ $side: "left" | "right" }>`
    font-size: 0.88rem;
    font-weight: 700;
    line-height: 1;
    color: rgba(255, 255, 255, 0.94);
    text-align: ${({ $side }) => $side === "left" ? "left" : "right"};
    white-space: nowrap;

    ${BREAKPOINTS.mobile} {
        font-size: 0.82rem;
    }
`;

export const CounterIcon = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    opacity: 0.68;

    svg {
        width: 13px;
        height: 13px;
    }

    ${BREAKPOINTS.mobile} {
        svg {
            width: 12px;
            height: 12px;
        }
    }
`;

export const counterLatestGlow = css`
    box-shadow: 0 0 6px var(--bs-gray);
    opacity: 1;
`;
