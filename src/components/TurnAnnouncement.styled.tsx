import styled from "styled-components";

export const TurnPlayerName = styled.span<{ $color: string }>`
    color: ${({ $color }) => $color};
`;

