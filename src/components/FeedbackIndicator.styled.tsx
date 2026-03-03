import styled from "styled-components";

export const FeedbackDot = styled.div<{ $color: string }>`
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
`;

export const FeedbackColumn = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: center;
    justify-content: center;
`;
