import styled from "styled-components";

const XS = "@media (max-width: 600px)";

export const FeedbackShape = styled.span<{ $color: string }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    font-size: 18px;
    font-weight: 700;
    line-height: 1;
    color: ${({ $color }) => $color};

    ${XS} {
        width: 10px;
        height: 10px;
        font-size: 10px;
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
