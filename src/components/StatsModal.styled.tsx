import styled from "styled-components";

export const EmptyState = styled.div`
    text-align: center;
    padding: 24px 0;
    color: rgba(255, 255, 255, 0.55);

    svg {
        margin-bottom: 12px;
    }
`;

export const BuildLabel = styled.div`
    margin-top: 8px;
    text-align: right;
    font-size: 0.75rem;
    letter-spacing: 0.03em;
    color: rgba(255, 255, 255, 0.45);
    user-select: none;
    -webkit-tap-highlight-color: transparent;
`;

export const SummaryText = styled.p`
    margin: 20px 0 0;
    font-size: 1.12rem;
    line-height: 1.65;
    color: rgba(255, 255, 255, 0.76);

    strong {
        color: rgba(255, 255, 255, 0.98);
        font-weight: 600;
    }
`;
