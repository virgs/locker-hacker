import styled from "styled-components";

const MOBILE = "@media (max-width: 600px)";

export const FooterContainer = styled.footer`
    flex-shrink: 0;
    position: relative;
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

export const PlayerLabel = styled.span<{ $color: string }>`
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.8rem;
    font-weight: 600;
    color: ${({ $color }) => $color};
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
    pointer-events: none;
`;

export const FooterStat = styled.span`
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.8rem;
    white-space: nowrap;
`;
