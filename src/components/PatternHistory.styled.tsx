import styled from "styled-components";

export const HistoryList = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
`;

export const HistoryEntry = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 12px 0;

    &:not(:first-child) {
        border-top: 1px solid rgba(255, 255, 255, 0.08);
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
`;
