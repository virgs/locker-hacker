import * as React from "react";
import {GitHub, HelpCircle, Users, User, BarChart2, Play, Coffee, Zap, Flag} from "react-feather";
import Dropdown from "react-bootstrap/Dropdown";
import Button from "react-bootstrap/Button";
import {
    NavbarContainer, NavbarRow, NavbarLeft, NavbarCenter, NavbarRight,
    AppIconLink, AppIconImage, HelpButton, GitHubLink, CoffeeLink, ButtonLabel,
} from "./Navbar.styled.tsx";
import {GITHUB_URL, BUY_ME_A_COFFEE_URL, APP_TITLE} from "./Navbar.constants.ts";
import {
    Level, PlayerCount, GamePhase,
    LEVEL_LABELS, PLAYER_LABELS, ALL_LEVELS, ALL_PLAYER_COUNTS,
} from "../game/GameConfig.ts";
import {getPlayerColor} from "../game/playerColors.ts";
import {useGameContext} from "../context/GameContext.tsx";
import Tip from "./Tip.tsx";
import {hasEliminationHintCandidates} from "../game/HintService.ts";
import { HINT_ACTION_KEYS, runHintAction, type HintActionKey } from "./Navbar.utils.ts";
import GameMenu from "./GameMenu.tsx";

const PlayerCountIcons: React.FunctionComponent<{ count: number }> = ({count}): React.ReactElement => (
    <>
        {Array.from({length: count}, (_, i) => (
            <User key={i} size={20} className="me-1" style={{ color: count === 1 ? 'white' : getPlayerColor(i + 1) }} />
        ))}
    </>
);

const levelDetailLabel = (l: Level): string =>
    `${LEVEL_LABELS[l]}`;

const Navbar: React.FunctionComponent = (): React.ReactElement => {
    const {
        phase, level, playerCount, isRunning, gridConfig, code, revealedHints,
        winner,
        onLevelChange, onPlayerCountChange, onGiveUp, onRevealHint, onFinishGame, onOpenGameMenu,
    } = useGameContext();
    const configDisabled = isRunning || phase === GamePhase.Revealing;
    const canEliminateDot = phase === GamePhase.Playing && hasEliminationHintCandidates({
        totalDots: gridConfig.cols * gridConfig.rows,
        code,
        alreadyEliminated: revealedHints,
    });

    const onHintMenuSelect = (eventKey: string | null): void => {
        runHintAction(eventKey as HintActionKey | null, { onRevealHint, onGiveUp });
    };

    const centerContent = (): React.ReactElement | null => {
        if (phase === GamePhase.Revealing) {
            return (
                <Tip text="Start a new game">
                    <Button variant={winner ? "success" : "danger"} size="sm" onClick={onFinishGame} aria-label="Finish game">
                        <Play size={20}/><ButtonLabel className="ms-1">Play again</ButtonLabel>
                    </Button>
                </Tip>
            );
        }
        if (isRunning) {
            return (
                <Tip text="Get an elimination hint or give up" placement="right-end">
                    <Dropdown onSelect={onHintMenuSelect}>
                        <Dropdown.Toggle variant="warning" size="sm" aria-label="Hint actions">
                            <Zap size={20}/><ButtonLabel className="ms-1">Hint</ButtonLabel>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item eventKey={HINT_ACTION_KEYS.hint} disabled={!canEliminateDot}>
                                <Zap size={16} className="me-2"/>
                                Get a hint
                            </Dropdown.Item>
                            <Dropdown.Item eventKey={HINT_ACTION_KEYS.giveUp}>
                                <Flag size={16} className="me-2"/>
                                Give up
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Tip>
            );
        }
        return null;
    };
    return (
        <>
            <NavbarContainer>
                <NavbarRow>
                    <NavbarLeft>
                        <Tip text={APP_TITLE}>
                            <AppIconLink
                                className="me-2 ms-1"
                                aria-label={APP_TITLE}
                            >
                                <AppIconImage src={`${import.meta.env.BASE_URL}icon.png`} alt={APP_TITLE}/>
                            </AppIconLink>
                        </Tip>
                        <Dropdown className="me-1">
                            <Tip text="Number of players">
                                <Dropdown.Toggle variant="outline-secondary" size="sm" disabled={configDisabled}>
                                    <Users size={20}/><ButtonLabel
                                    className="ms-1">{PLAYER_LABELS[playerCount]}</ButtonLabel>
                                </Dropdown.Toggle>
                            </Tip>
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
                            <Tip text="Difficulty level">
                                <Dropdown.Toggle variant="outline-secondary" size="sm" disabled={configDisabled}>
                                    <BarChart2 size={20}/><ButtonLabel
                                    className="ms-1">{levelDetailLabel(level)}</ButtonLabel>
                                </Dropdown.Toggle>
                            </Tip>
                            <Dropdown.Menu>
                                {ALL_LEVELS.map((l: Level) => (
                                    <Dropdown.Item key={l} active={l === level} onClick={() => onLevelChange(l)}>
                                        <BarChart2 size={20} className="me-1"/>
                                        {`${LEVEL_LABELS[l]}`}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </NavbarLeft>
                    <NavbarCenter>{centerContent()}</NavbarCenter>
                    <NavbarRight>
                        <Tip text="How to play">
                            <HelpButton onClick={() => onOpenGameMenu("help")} aria-label="How to play">
                                <HelpCircle size={20}/>
                            </HelpButton>
                        </Tip>
                        <Tip text="Buy me a coffee">
                            <CoffeeLink href={BUY_ME_A_COFFEE_URL} target="_blank" rel="noopener noreferrer" className="ms-2"
                                        aria-label="Buy me a coffee">
                                <Coffee size={20}/>
                            </CoffeeLink>
                        </Tip>
                        <Tip text="View source on GitHub">
                            <GitHubLink className="ms-2" href={GITHUB_URL} target="_blank" rel="noopener noreferrer"
                                        aria-label="View project on GitHub">
                                <GitHub size={20}/>
                            </GitHubLink>
                        </Tip>
                    </NavbarRight>
                </NavbarRow>
            </NavbarContainer>
            <GameMenu />
        </>
    );
};

export default Navbar;
