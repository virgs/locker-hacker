import * as React from "react";
import Modal from "react-bootstrap/Modal";
import { Award, Clock, MousePointer } from "react-feather";
import PatternLock from "./PatternLock.tsx";
import { RevealStats, RevealStat } from "./CodeRevealOverlay.styled.tsx";
import { PlayerCount } from "../game/GameConfig.ts";
import { getPlayerColor } from "../game/playerColors.ts";
import { useGameContext } from "../context/GameContext.tsx";
import { formatTime } from "./Footer.utils.ts";
import useConfetti from "./useConfetti.ts";

const CodeRevealOverlay: React.FunctionComponent = (): React.ReactElement => {
    const { showRevealModal, code, gridConfig, winner, playerCount, elapsedSeconds, pathHistory, onToggleRevealModal } = useGameContext();

    const isWin      = winner !== null;
    const isMultiWin = isWin && playerCount !== PlayerCount.One;

    useConfetti(isWin && showRevealModal);

    const renderTitle = (): React.ReactNode => {
        if (isMultiWin) {
            return (
                <>
                    {isWin && <Award size={22} className="me-2" />}
                    <span style={{ color: getPlayerColor(winner!) }}>Player {winner} wins!</span>
                </>
            );
        }
        return (
            <>
                {isWin && <Award size={22} className="me-2" />}
                {isWin ? "You win!" : "Secret Code"}
            </>
        );
    };

    return (
        <Modal show={showRevealModal} onHide={onToggleRevealModal} centered>
            <Modal.Header closeButton>
                <Modal.Title className="d-flex align-items-center">
                    {renderTitle()}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="d-flex flex-column align-items-center gap-3">
                {isWin && (
                    <RevealStats>
                        <RevealStat><Clock size={15} />{formatTime(elapsedSeconds)}</RevealStat>
                        <RevealStat><MousePointer size={15} />{pathHistory.length} moves</RevealStat>
                    </RevealStats>
                )}
                <PatternLock
                    containerSize={220}
                    pointSize={14}
                    arrowHeadSize={10}
                    disabled={true}
                    cols={gridConfig.cols}
                    rows={gridConfig.rows}
                    path={code}
                    dynamicLineStyle={true}
                    arrowHeads={true}
                    allowJumping={false}
                />
            </Modal.Body>
        </Modal>
    );
};

export default CodeRevealOverlay;

