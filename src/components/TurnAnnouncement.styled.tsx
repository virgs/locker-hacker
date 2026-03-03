import styled, { keyframes } from "styled-components";

const slideIn = keyframes`
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
`;

export const TurnBackdrop = styled.div`
    position: fixed;
    inset: 0;
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: all;
`;

export const TurnCard = styled.div`
    background: rgba(26, 26, 46, 0.97);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    padding: 20px 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    pointer-events: auto;
    position: relative;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    animation: ${slideIn} 0.2s ease;
`;

export const TurnMessage = styled.p`
    font-size: 1.1rem;
    font-weight: 700;
    color: #fff;
    margin: 0;
    text-align: center;
`;

export const TurnPlayerName = styled.span<{ $color: string }>`
    color: ${({ $color }) => $color};
`;

export const DismissButton = styled.button`
    position: absolute;
    top: 6px;
    right: 6px;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    border-radius: 4px;

    &:hover {
        color: white;
    }
`;
