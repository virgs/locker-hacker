import styled, { keyframes, css } from "styled-components";
import { BREAKPOINTS } from "../theme/breakpoints.ts";
import {
    PlayAreaCounter,
    CounterLabel,
    counterLatestGlow,
} from "./PlayAreaCounter.styled.tsx";

const popIn = keyframes`
    0%   { transform: scale(0.4); opacity: 0; }
    60%  { transform: scale(1.3); opacity: 1; }
    100% { transform: scale(1);   opacity: 1; }
`;

export const GuessCounterWrapper = styled(PlayAreaCounter).attrs({ $side: "left" })``;

export const AttemptDots = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
    height: 12px;

    ${BREAKPOINTS.mobile} {
        gap: 4px;
        height: 11px;
    }
`;

export const AttemptDot = styled.span<{ $latest: boolean }>`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--bs-white);
    opacity: 0.85;
    flex-shrink: 0;

    ${({ $latest }) => $latest && css`
        animation: ${popIn} 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        ${counterLatestGlow};
    `}

    ${BREAKPOINTS.mobile} {
        width: 7px;
        height: 7px;
    }
`;

export const OverflowBadge = styled.span`
    font-size: .75rem;
    font-weight: 700;
    color: var(--bs-white);
    opacity: 0.85;
    line-height: 1;
`;

export const AttemptLabel = styled(CounterLabel).attrs({ $side: "left" })``;
