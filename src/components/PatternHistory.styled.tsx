import styled from "styled-components";

const XS = "@media (max-width: 600px)";
const XL = "@media (min-width: 1400px)";

export const HistoryTitle = styled.h6`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 0.7rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.4);
    letter-spacing: 0.8px;
    text-transform: uppercase;
    margin: 0 0 10px;
    width: 100%;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

export const HistoryList = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    width: 100%;

    ${XL} {
        grid-template-columns: 1fr 1fr;
    }

    ${XS} {
        grid-template-columns: 1fr 1fr;
    }
`;

export const HistoryEntry = styled.div<{ $playerColor?: string }>`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    padding: 12px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    border-left: 3px solid ${({ $playerColor }) => $playerColor ?? 'transparent'};
    padding-left: ${({ $playerColor }) => $playerColor ? '8px' : '0'};

    ${XS} {
        gap: 10px;
        padding: 8px 0;
        padding-left: ${({ $playerColor }) => $playerColor ? '6px' : '0'};
    }
`;

export const PatternLockWrapper = styled.div`
    position: relative;
    display: inline-block;
`;

export const GuessNumber = styled.span`
    position: absolute;
    left: 4px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 10px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.45);
    line-height: 1;
    pointer-events: none;

    ${XS} {
        font-size: 8px;
        left: 2px;
    }
`;
