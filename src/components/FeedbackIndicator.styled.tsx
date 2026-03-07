import styled from "styled-components";
import { BREAKPOINTS } from "../theme/breakpoints.ts";

export const FeedbackShape = styled.span<{ $color: string }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    font-size: 24px;
    font-weight: 700;
    line-height: 1;
    color: ${({ $color }) => $color};

    ${BREAKPOINTS.mobile} {
        width: 10px;
        height: 10px;
        font-size: 24px;
    }
`;

export const FeedbackColumn = styled.div`
    padding-left: 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: center;
    justify-content: center;

    ${BREAKPOINTS.mobile} {
        padding-left: 20px;
        gap: 5px;
    }
`;
