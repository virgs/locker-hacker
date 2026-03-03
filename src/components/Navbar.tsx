import * as React from "react";
import { GitHub, HelpCircle, Play, Eye, Users, BarChart2 } from "react-feather";
import Dropdown from "react-bootstrap/Dropdown";
import Button from "react-bootstrap/Button";
import {
    NavbarContainer,
    NavbarRow,
    NavbarLeft,
    NavbarCenter,
    NavbarRight,
    AppIconLink,
    AppIconImage,
    HelpButton,
    GitHubLink,
} from "./Navbar.styled.tsx";
import { GITHUB_URL, APP_TITLE } from "./Navbar.constants.ts";
import {
    type Level,
    type PlayerCount,
    type GamePhase,
    LEVEL_LABELS,
    PLAYER_LABELS,
    ALL_LEVELS,
    ALL_PLAYER_COUNTS,
} from "../game/GameConfig.ts";
import HelpModal from "./HelpModal.tsx";

interface NavbarProps {
    phase             : GamePhase;
    level             : Level;
    playerCount       : PlayerCount;
    onLevelChange     : (level: Level) => void;
    onPlayerCountChange: (count: PlayerCount) => void;
    onPlay            : () => void;
    onReveal          : () => void;
}

const Navbar: React.FunctionComponent<NavbarProps> = ({
    phase,
    level,
    playerCount,
    onLevelChange,
    onPlayerCountChange,
    onPlay,
    onReveal,
}): React.ReactElement => {
    const [helpOpen, setHelpOpen] = React.useState(false);
    const isPlaying = phase === "playing";

    return (
        <>
            <NavbarContainer>
                <NavbarRow>
                    <NavbarLeft>
                        <AppIconLink aria-label={APP_TITLE}>
                            <AppIconImage src="/icon.png" alt={APP_TITLE} />
                        </AppIconLink>

                        <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" size="sm" disabled={isPlaying}>
                                <Users size={14} className="me-1" />
                                {PLAYER_LABELS[playerCount]}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {ALL_PLAYER_COUNTS.map(c => (
                                    <Dropdown.Item
                                        key={c}
                                        active={c === playerCount}
                                        onClick={() => onPlayerCountChange(c)}
                                    >
                                        <Users size={14} className="me-1" /> {PLAYER_LABELS[c]}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>

                        <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" size="sm" disabled={isPlaying}>
                                <BarChart2 size={14} className="me-1" />
                                {LEVEL_LABELS[level]}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {ALL_LEVELS.map(l => (
                                    <Dropdown.Item
                                        key={l}
                                        active={l === level}
                                        onClick={() => onLevelChange(l)}
                                    >
                                        <BarChart2 size={14} className="me-1" /> {LEVEL_LABELS[l]}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </NavbarLeft>

                    <NavbarCenter>
                        {isPlaying ? (
                            <Button variant="outline-danger" size="sm" onClick={onReveal} aria-label="Reveal code">
                                <Eye size={16} className="me-1" />
                                Reveal
                            </Button>
                        ) : (
                            <Button variant="outline-primary" size="sm" onClick={onPlay} aria-label="Start game">
                                <Play size={16} className="me-1" />
                                Play
                            </Button>
                        )}
                    </NavbarCenter>

                    <NavbarRight>
                        <HelpButton
                            onClick={() => setHelpOpen(true)}
                            aria-label="How to play"
                        >
                            <HelpCircle size={20} />
                        </HelpButton>
                        <GitHubLink
                            className="ms-2"
                            href={GITHUB_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="View project on GitHub"
                        >
                            <GitHub size={20} />
                        </GitHubLink>
                    </NavbarRight>
                </NavbarRow>
            </NavbarContainer>

            <HelpModal
                show={helpOpen}
                onClose={() => setHelpOpen(false)}
            />
        </>
    );
};

export default Navbar;

