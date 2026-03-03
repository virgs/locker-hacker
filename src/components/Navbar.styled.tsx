import styled from "styled-components";

export const NavbarContainer = styled.nav`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    height: 52px;
    flex-shrink: 0;
    background: #0d0d0d;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    box-sizing: border-box;

    @media (max-width: 480px) {
        padding: 0 12px;
        height: 44px;
    }
`;

export const NavbarTitle = styled.h1`
    font-size: 1.1rem;
    font-weight: 700;
    color: #fff;
    margin: 0;
    letter-spacing: 0.4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    @media (max-width: 480px) {
        font-size: 0.95rem;
    }
`;

export const GitHubLink = styled.a`
    color: rgba(255, 255, 255, 0.55);
    display: flex;
    align-items: center;
    flex-shrink: 0;
    margin-left: 16px;
    transition: color 0.2s ease, transform 0.2s ease;
    outline-offset: 4px;

    &:hover {
        color: #fff;
        transform: scale(1.1);
    }

    &:focus-visible {
        color: #2a9fd6;
    }
`;
