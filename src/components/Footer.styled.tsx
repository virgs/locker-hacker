import styled, { keyframes, css } from "styled-components";
import { BREAKPOINTS } from "../theme/breakpoints.ts";

const moveUpAndFadeOut = keyframes`
    0% {
        opacity: 1;
        transform: translateY(0) translateX(0) scale(1);
    }
    100% {
        opacity: 0;
        transform: translateY(-30px) translateX(10px) scale(2.5);
    }
`;

export const FooterContainer = styled.footer`
    flex-shrink: 0;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding: 0 16px;
    min-height: 36px;
    box-sizing: border-box;
    gap: 16px;

    ${BREAKPOINTS.mobile} {
        padding: 0 8px;
        min-height: 32px;
        gap: 12px;
    }
`;

export const AiProgressStat = styled.span<{ $color?: string }>`
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.8rem;
    white-space: nowrap;
    margin-right: auto;
    color: ${({ $color }) => $color ?? 'inherit'};
    transition: color 0.4s ease;
    position: relative;
`;

export const ConfidenceDelta = styled.span<{ $color?: string }>`
    position: absolute;
    z-index: 99;
    top: -4px;
    left: 10px;
    font-size: 0.65rem;
    font-weight: 700;
    color: ${({ $color }) => $color ?? 'inherit'};
    pointer-events: none;
    animation: ${moveUpAndFadeOut} 2s ease-out forwards;
    white-space: nowrap;
`;

export const PlayerLabel = styled.span<{ $color: string }>`
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.8rem;
    font-weight: 600;
    color: ${({ $color }) => $color};
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
    pointer-events: none;
`;

const flashRed = keyframes`
    0%   { color: inherit; }
    20%  { color: var(--bs-danger); }
    80%  { color: var(--bs-danger); }
    100% { color: inherit; }
`;

export const FooterStat = styled.span`
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.8rem;
    white-space: nowrap;
`;

export const CodeLengthStat = styled(FooterStat)<{ $flash: boolean }>`
    ${({ $flash }) => $flash && css`animation: ${flashRed} 1.2s ease-out forwards;`}
`;

export const HintButton = styled.button`
    background: none;
    border: none;
    color: var(--bs-warning);
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 2px;
    transition: color 0.2s ease, transform 0.2s ease;
    opacity: 0.7;

    &:hover {
        opacity: 1;
        transform: scale(1.2);
    }
`;

