import styled, { css } from "styled-components";
import { HANDLE_SIZE_PX, GRAB_BAR_LENGTH_PX, GRAB_BAR_THICKNESS_PX } from "./ResizeHandle.constants.ts";

const sharedHandle = css`
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.04);
    cursor: pointer;
    touch-action: none;
    user-select: none;
    flex-shrink: 0;
    z-index: 11;
    transition: background 0.2s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.1);
    }
`;

export const VerticalHandle = styled.div`
    ${sharedHandle}
    width: ${HANDLE_SIZE_PX}px;
    height: 100%;
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
    border-left: 1px solid rgba(255, 255, 255, 0.15);
`;

export const HorizontalHandle = styled.div`
    ${sharedHandle}
    height: ${HANDLE_SIZE_PX}px;
    width: 100%;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.15);
`;

const sharedGrabBar = css`
    background: rgba(255, 255, 255, 0.35);
    border-radius: ${GRAB_BAR_THICKNESS_PX / 2}px;
    pointer-events: none;
`;

export const VerticalGrabBar = styled.div`
    ${sharedGrabBar}
    width: ${GRAB_BAR_THICKNESS_PX}px;
    height: ${GRAB_BAR_LENGTH_PX}px;
`;

export const HorizontalGrabBar = styled.div`
    ${sharedGrabBar}
    height: ${GRAB_BAR_THICKNESS_PX}px;
    width: ${GRAB_BAR_LENGTH_PX}px;
`;

