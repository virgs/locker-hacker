import styled from "styled-components";

const MOBILE = "@media (max-width: 600px)";

export const FooterContainer = styled.footer`
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding: 0 16px;
    min-height: 36px;
    box-sizing: border-box;
    gap: 16px;

    ${MOBILE} {
        padding: 0 8px;
        min-height: 32px;
        gap: 12px;
    }
`;

export const FooterStat = styled.span`
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.8rem;
    white-space: nowrap;
`;
