import * as React from "react";
import Modal from "react-bootstrap/Modal";
import { useGameContext, type GameMenuSection } from "../context/GameContext.tsx";
import { HelpPanel } from "./HelpModal.tsx";
import { StatsPanel } from "./StatsModal.tsx";
import { BuildLabel } from "./StatsModal.styled.tsx";
import { BUILD_LABEL } from "../meta/buildInfo.ts";
import { clearRecords } from "../game/StatsService.ts";
import {
    BUILD_LABEL_RESET_TAP_TARGET,
    BUILD_LABEL_RESET_WINDOW_MS,
    shouldClearStatsFromBuildTaps,
} from "./StatsModal.utils.ts";
import {
    MenuBody,
    MenuTab,
    MenuTabs,
    SectionTitle,
    SettingsCard,
    SettingsCopy,
    SettingsDescription,
    SettingsName,
    SettingsRow,
    ToggleInput,
} from "./GameMenu.styled.tsx";

const MENU_SECTIONS: { id: GameMenuSection; label: string; title: string }[] = [
    { id: "stats", label: "Stats", title: "Game Stats" },
    { id: "help", label: "Help", title: "How to Play" },
    { id: "settings", label: "Settings", title: "Settings" },
];

const SettingsPanel: React.FunctionComponent = (): React.ReactElement => {
    const { annotationsEnabled, onToggleAnnotationsEnabled } = useGameContext();

    return (
        <>
            <SectionTitle>Gameplay</SectionTitle>
            <SettingsCard>
                <SettingsRow>
                    <ToggleInput
                        type="checkbox"
                        role="switch"
                        checked={annotationsEnabled}
                        onChange={onToggleAnnotationsEnabled}
                    />
                    <SettingsCopy>
                        <SettingsName>Enable annotations</SettingsName>
                        <SettingsDescription>
                            Turn in-game dot annotations on or off.
                        </SettingsDescription>
                    </SettingsCopy>
                </SettingsRow>
            </SettingsCard>
        </>
    );
};

const renderSection = (section: GameMenuSection): React.ReactElement => {
    switch (section) {
        case "help":
            return <HelpPanel />;
        case "settings":
            return <SettingsPanel />;
        default:
            return <StatsPanel />;
    }
};

const GameMenu: React.FunctionComponent = (): React.ReactElement => {
    const { showGameMenu, activeGameMenuSection, onCloseGameMenu, onOpenGameMenu } = useGameContext();
    const activeSection = MENU_SECTIONS.find(section => section.id === activeGameMenuSection) ?? MENU_SECTIONS[0];
    const [, rerender] = React.useReducer((value: number) => value + 1, 0);
    const resetTapCountRef = React.useRef(0);
    const resetTapTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const resetBuildTapSequence = React.useCallback((): void => {
        resetTapCountRef.current = 0;
        if (resetTapTimerRef.current !== null) {
            clearTimeout(resetTapTimerRef.current);
            resetTapTimerRef.current = null;
        }
    }, []);

    const onBuildLabelClick = React.useCallback((): void => {
        resetTapCountRef.current += 1;
        if (resetTapTimerRef.current !== null) clearTimeout(resetTapTimerRef.current);
        resetTapTimerRef.current = setTimeout(resetBuildTapSequence, BUILD_LABEL_RESET_WINDOW_MS);

        if (!shouldClearStatsFromBuildTaps(resetTapCountRef.current, BUILD_LABEL_RESET_TAP_TARGET)) return;
        clearRecords();
        resetBuildTapSequence();
        rerender();
    }, [resetBuildTapSequence]);

    React.useEffect(() => {
        if (showGameMenu) return;
        resetBuildTapSequence();
    }, [resetBuildTapSequence, showGameMenu]);

    React.useEffect(() => () => resetBuildTapSequence(), [resetBuildTapSequence]);

    return (
        <Modal show={showGameMenu} onHide={onCloseGameMenu} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{activeSection.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <MenuBody>
                    <MenuTabs role="tablist" aria-label="Game menu sections">
                        {MENU_SECTIONS.map(section => (
                            <MenuTab
                                key={section.id}
                                type="button"
                                role="tab"
                                $active={section.id === activeGameMenuSection}
                                aria-selected={section.id === activeGameMenuSection}
                                onClick={() => onOpenGameMenu(section.id)}
                            >
                                {section.label}
                            </MenuTab>
                        ))}
                    </MenuTabs>
                    {renderSection(activeGameMenuSection)}
                </MenuBody>
            </Modal.Body>
            <Modal.Footer>
                <BuildLabel onClick={onBuildLabelClick}>{BUILD_LABEL}</BuildLabel>
            </Modal.Footer>
        </Modal>
    );
};

export default GameMenu;
