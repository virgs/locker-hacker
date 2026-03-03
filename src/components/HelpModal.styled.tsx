import styled from "styled-components";

export const HelpList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 8px 0;

    li {
        padding: 8px 12px;
        border-radius: 6px;

        &:not(:last-child) {
            margin-bottom: 4px;
        }

        &:nth-child(odd) {
            background: rgba(255, 255, 255, 0.03);
        }
    }
`;

