import * as React from "react";
import { X } from "react-feather";
import { PlayerCount } from "../game/GameConfig.ts";
import { getPlayerColor } from "../game/playerColors.ts";
import { useGameContext } from "../context/GameContext.tsx";
import { TurnBackdrop, TurnCard, TurnMessage, TurnPlayerName, DismissButton } from "./TurnAnnouncement.styled.tsx";

const TURN_MODAL_DURATION_MS = 2000;

const TurnAnnouncement: React.FunctionComponent = (): React.ReactElement | null => {
    const { showTurnModal, currentPlayer, playerCount, onDismissTurnModal } = useGameContext();

    React.useEffect(() => {
        if (!showTurnModal) return;
        const id = setTimeout(onDismissTurnModal, TURN_MODAL_DURATION_MS);
        return () => clearTimeout(id);
    }, [showTurnModal, onDismissTurnModal]);

    if (!showTurnModal || playerCount === PlayerCount.One) return null;

    const playerColor = getPlayerColor(currentPlayer);

    return (
        <TurnBackdrop onClick={onDismissTurnModal}>
            <TurnCard onClick={(e) => e.stopPropagation()}>
                <DismissButton onClick={onDismissTurnModal} aria-label="Dismiss turn announcement">
                    <X size={14} />
                </DismissButton>
                <TurnMessage>
                    <TurnPlayerName $color={playerColor}>Player {currentPlayer}'s turn</TurnPlayerName>
                </TurnMessage>
            </TurnCard>
        </TurnBackdrop>
    );
};

export default TurnAnnouncement;
