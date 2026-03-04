import * as React from "react";
import Modal from "react-bootstrap/Modal";
import { PlayerCount } from "../game/GameConfig.ts";
import { getPlayerColor } from "../game/playerColors.ts";
import { useGameContext } from "../context/GameContext.tsx";
import { TurnPlayerName } from "./TurnAnnouncement.styled.tsx";
import { formatTurnMessage } from "./TurnAnnouncement.utils.ts";

const TURN_MODAL_DURATION_MS = 2000;

const TurnAnnouncement: React.FunctionComponent = (): React.ReactElement | null => {
    const { showTurnModal, currentPlayer, playerCount, onDismissTurnModal } = useGameContext();

    React.useEffect(() => {
        if (!showTurnModal) return;
        const id = setTimeout(onDismissTurnModal, TURN_MODAL_DURATION_MS);
        return () => clearTimeout(id);
    }, [showTurnModal, onDismissTurnModal]);

    if (playerCount === PlayerCount.One) return null;

    const playerColor = getPlayerColor(currentPlayer);

    return (
        <Modal show={showTurnModal} onHide={onDismissTurnModal} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <TurnPlayerName $color={playerColor}>
                        {formatTurnMessage(currentPlayer)}
                    </TurnPlayerName>
                </Modal.Title>
            </Modal.Header>
        </Modal>
    );
};

export default TurnAnnouncement;
