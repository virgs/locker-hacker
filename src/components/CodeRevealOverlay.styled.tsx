import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
    from { opacity: 0; }
    to   { opacity: 1; }
`;

export const RevealBackdrop = styled.div`
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.7);
    animation: ${fadeIn} 0.3s ease;
`;

export const RevealCard = styled.div`
    background: #1a1a2e;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
`;

export const RevealTitle = styled.h2`
    font-size: 1.2rem;
    font-weight: 700;
    color: #fff;
    margin: 0;
    letter-spacing: 0.5px;
`;

export const RevealActions = styled.div`
    display: flex;
    gap: 12px;
    justify-content: center;
    width: 100%;
`;

