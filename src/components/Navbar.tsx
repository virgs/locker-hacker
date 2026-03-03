import * as React from "react";
import { GitHub } from "react-feather";
import { NavbarContainer, NavbarTitle, GitHubLink } from "./Navbar.styled.tsx";
import { GITHUB_URL, APP_TITLE } from "./Navbar.constants.ts";

const Navbar: React.FunctionComponent = (): React.ReactElement => (
    <NavbarContainer>
        <NavbarTitle>{APP_TITLE}</NavbarTitle>
        <GitHubLink
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View project on GitHub"
        >
            <GitHub size={22} />
        </GitHubLink>
    </NavbarContainer>
);

export default Navbar;
