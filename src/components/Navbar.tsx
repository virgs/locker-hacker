import * as React from "react";
import {GitHub, HelpCircle, Eye, EyeOff, Users, User, BarChart2, XOctagon} from "react-feather";
import Dropdown from "react-bootstrap/Dropdown";
import Button from "react-bootstrap/Button";
import {
    NavbarContainer, NavbarRow, NavbarLeft, NavbarCenter, NavbarRight,
    AppIconLink, AppIconImage, HelpButton, GitHubLink, ButtonLabel,
} from "./Navbar.styled.tsx";
import {GITHUB_URL, APP_TITLE} from "./Navbar.constants.ts";
import {
    Level, PlayerCount, GamePhase,
    LEVEL_LABELS, LEVEL_CONFIGS, PLAYER_LABELS, ALL_LEVELS, ALL_PLAYER_COUNTS,
} from "../game/GameConfig.ts";
import {clearRecords} from "../game/StatsService.ts";
import HelpModal from "./HelpModal.tsx";
import StatsModal from "./StatsModal.tsx";
import {getPlayerColor} from "../game/playerColors.ts";
import {useGameContext} from "../context/GameContext.tsx";

const LONG_PRESS_MS = 10_000;

const PlayerCountIcons: React.FunctionComponent<{ count: number }> = ({count}): React.ReactElement => (
    <>
        {Array.from({length: count}, (_, i) => (
            <User key={i} size={20} className="me-1" style={{ color: count === 1 ? 'white' : getPlayerColor(i + 1) }} />
        ))}
    </>
);

const levelDetailLabel = (l: Level): string =>
    `${LEVEL_LABELS[l]} (${LEVEL_CONFIGS[l].length})`;

const Navbar: React.FunctionComponent = (): React.ReactElement => {
    const [helpOpen, setHelpOpen] = React.useState(false);
    const longPressRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const {
        phase, level, playerCount, isRunning,
        showStatsModal, onToggleStatsModal,
        onLevelChange, onPlayerCountChange, onGiveUp, onToggleRevealModal, onFinishGame,
    } = useGameContext();

    const configDisabled = isRunning || phase === GamePhase.Revealing;

    const handleIconDown = (): void => {
        longPressRef.current = setTimeout(() => {
            console.log(`Long press detected, clearing records...`);
            clearRecords();
            longPressRef.current = null;
        }, LONG_PRESS_MS);
    };

    const handleIconUp = (): void => {
        if (longPressRef.current) {
            clearTimeout(longPressRef.current);
            longPressRef.current = null;
            onToggleStatsModal();
        }
    };

    const centerContent = (): React.ReactElement | null => {
        if (phase === GamePhase.Revealing) {
            return (
                <>
                    <Button variant="outline-secondary" size="sm" onClick={onToggleRevealModal}
                            aria-label="Toggle reveal">
                        <EyeOff size={20}/><ButtonLabel className="ms-1">Reveal</ButtonLabel>
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={onFinishGame} aria-label="Finish game">
                        <XOctagon size={20}/><ButtonLabel className="ms-1">Finish</ButtonLabel>
                    </Button>
                </>
            );
        }
        if (isRunning) {
            return (
                <Button variant="danger" size="sm" onClick={onGiveUp} aria-label="Give up and reveal code">
                    <Eye size={20}/><ButtonLabel className="ms-1">Give Up</ButtonLabel>
                </Button>
            );
        }
        return null;
    };

    return (
        <>
            <NavbarContainer>
                <NavbarRow>
                    <NavbarLeft>
                        <AppIconLink
                            className="me-2 ms-1"
                            aria-label={APP_TITLE}
                            onMouseDown={handleIconDown}
                            onMouseUp={handleIconUp}
                            onMouseLeave={() => {
                                if (longPressRef.current) {
                                    clearTimeout(longPressRef.current);
                                    longPressRef.current = null;
                                }
                            }}
                            onTouchStart={handleIconDown}
                            onTouchEnd={handleIconUp}
                        >
                            <AppIconImage src={`${import.meta.env.BASE_URL}icon.png`} alt={APP_TITLE}/>
                        </AppIconLink>

                        <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" size="sm" disabled={configDisabled}>
                                <Users size={20}/><ButtonLabel
                                className="ms-1">{PLAYER_LABELS[playerCount]}</ButtonLabel>
                            </Dropdown.Toggle>
                            <Dropdown.Menu style={{ minWidth: '220px' }}>
                                {ALL_PLAYER_COUNTS.map((c: PlayerCount) => (
                                    <Dropdown.Item key={c} active={c === playerCount}
                                                   onClick={() => onPlayerCountChange(c)}>
                                        <span className="me-2">
                                        {PLAYER_LABELS[c]}
                                        </span>
                                        <span className="float-right" style={{float: 'right'}}>
                                            <PlayerCountIcons count={c}/>
                                        </span>
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>

                        <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" size="sm" disabled={configDisabled}>
                                <BarChart2 size={20}/><ButtonLabel
                                className="ms-1">{levelDetailLabel(level)}</ButtonLabel>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {ALL_LEVELS.map((l: Level) => (
                                    <Dropdown.Item key={l} active={l === level} onClick={() => onLevelChange(l)}>
                                        <BarChart2 size={20} className="me-1"/>
                                        {`${LEVEL_LABELS[l]}`}
                                        <span className="float-end fst-italic"> {`${LEVEL_CONFIGS[l].length}`}</span>
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </NavbarLeft>

                    <NavbarCenter>{centerContent()}</NavbarCenter>

                    <NavbarRight>
                        <HelpButton onClick={() => setHelpOpen(true)} aria-label="How to play">
                            <HelpCircle size={20}/>
                        </HelpButton>
                        <GitHubLink className="ms-2" href={GITHUB_URL} target="_blank" rel="noopener noreferrer"
                                    aria-label="View project on GitHub">
                            <GitHub size={20}/>
                        </GitHubLink>
                    </NavbarRight>
                </NavbarRow>
            </NavbarContainer>

            <HelpModal show={helpOpen} onClose={() => setHelpOpen(false)}/>
            <StatsModal show={showStatsModal} onClose={onToggleStatsModal}/>
        </>
    );
};

export default Navbar;

