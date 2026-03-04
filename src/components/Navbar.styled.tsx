import styled from "styled-components";
import { BREAKPOINTS } from "../theme/breakpoints.ts";

export const NavbarContainer = styled.nav`
    flex-shrink: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    box-sizing: border-box;
    padding: 0 16px;

    ${BREAKPOINTS.mobile} {
        padding: 0 8px;
    }
`;

export const NavbarRow = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 52px;
    gap: 8px;
    flex-wrap: wrap;

    ${BREAKPOINTS.mobile} {
        min-height: 44px;
        gap: 6px;
        padding: 4px 0;
    }
`;

export const NavbarLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;

    ${BREAKPOINTS.mobile} {
        gap: 4px;
    }
`;

export const NavbarCenter = styled.div`
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 1;
`;

export const NavbarRight = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

export const AppIconLink = styled.span`
    display: flex;
    align-items: center;
    flex-shrink: 0;
`;

export const AppIconImage = styled.img`
    height: 28px;
    width: auto;

    ${BREAKPOINTS.mobile} {
        height: 22px;
    }
`;

export const GitHubLink = styled.a`
    color: rgba(255, 255, 255, 0.55);
    display: flex;
    align-items: center;
    flex-shrink: 0;
    transition: color 0.2s ease, transform 0.2s ease;

    &:hover {
        color: #fff;
        transform: scale(1.1);
    }

    &:focus-visible {
        color: #2a9fd6;
    }
`;

export const CoffeeLink = styled.a`
    color: rgba(255, 255, 255, 0.55);
    display: flex;
    align-items: center;
    flex-shrink: 0;
    transition: color 0.2s ease, transform 0.2s ease;

    &:hover {
        color: #ffc107;
        transform: scale(1.1);
    }

    &:focus-visible {
        color: #ffc107;
    }
`;

export const HelpButton = styled.button`
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.55);
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 0;
    transition: color 0.2s ease, transform 0.2s ease;

    &:hover {
        color: #fff;
        transform: scale(1.1);
    }

    &:focus-visible {
        color: #2a9fd6;
        outline: none;
    }
`;

export const ButtonLabel = styled.span`
    ${BREAKPOINTS.mobile} {
        display: none;
    }
`;
