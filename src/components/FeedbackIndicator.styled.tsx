import styled from "styled-components";

const XS = "@media (max-width: 600px)";

export const FeedbackDot = styled.div<{ $color: string }>`
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: ${({ $color }) => $color};

    ${XS} {
        width: 10px;
        height: 10px;
    }
`;

export const FeedbackColumn = styled.div`
    padding-left: 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: center;
    justify-content: center;

    ${XS} {
        padding-left: 20px;
        gap: 5px;
    }
`;
