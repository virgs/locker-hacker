import styled from "styled-components";
import { HANDLE_SIZE_PX, GRAB_BAR_LENGTH_PX, GRAB_BAR_THICKNESS_PX } from "./ResizeHandle.constants.ts";

const BaseHandle = styled.div<{ $dimmed?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    touch-action: none;
    user-select: none;
    flex-shrink: 0;
    z-index: 11;
    transition: background 0.2s ease, border-color 140ms ease;

`;

export const VerticalHandle = styled(BaseHandle)`
    width: ${HANDLE_SIZE_PX}px;
    height: 100%;
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
    border-left: 1px solid ${({ $dimmed }) => $dimmed
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(255, 255, 255, 0.15)"};
`;

export const HorizontalHandle = styled(BaseHandle)`
    height: ${HANDLE_SIZE_PX}px;
    width: 100%;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    border-top: 1px solid ${({ $dimmed }) => $dimmed
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(255, 255, 255, 0.15)"};
`;

const BaseGrabBar = styled.div<{ $dimmed?: boolean }>`
    background: ${({ $dimmed }) => $dimmed
        ? "rgba(255, 255, 255, 0.16)"
        : "rgba(255, 255, 255, 0.35)"};
    border-radius: ${GRAB_BAR_THICKNESS_PX / 2}px;
    pointer-events: none;
    transition: background 140ms ease;
`;

export const VerticalGrabBar = styled(BaseGrabBar)`
    width: ${GRAB_BAR_THICKNESS_PX}px;
    height: ${GRAB_BAR_LENGTH_PX}px;
`;

export const HorizontalGrabBar = styled(BaseGrabBar)`
    height: ${GRAB_BAR_THICKNESS_PX}px;
    width: ${GRAB_BAR_LENGTH_PX}px;
`;
