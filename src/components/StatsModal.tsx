import * as React from "react";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import { Award, Clock, TrendingUp, Info, CheckCircle, XCircle } from "react-feather";
import { EmptyState, GameSummary } from "./StatsModal.styled.tsx";
import { LEVEL_LABELS, ALL_LEVELS } from "../game/GameConfig.ts";
import {
    type GameRecord,
    loadRecords,
    computeLevelStats,
    computeTotalStats,
    winPercent,
    avgTimeSeconds,
    formatStatsTime,
} from "../game/StatsService.ts";

interface StatsModalProps {
    show            : boolean;
    onClose         : () => void;
    lastGameRecord ?: GameRecord | null;
}

const StatsModal: React.FunctionComponent<StatsModalProps> = ({
    show,
    onClose,
    lastGameRecord = null,
}): React.ReactElement => {
    const records    = show ? loadRecords() : [];
    const levelStats = computeLevelStats(records);
    const totalStats = computeTotalStats(records);
    const hasData    = records.length > 0;

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title><Award size={20} className="me-2" />Game Stats</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {lastGameRecord && (
                    <GameSummary>
                        {lastGameRecord.won
                            ? <><CheckCircle size={18} color="#22c55e" /> <strong>You won!</strong></>
                            : <><XCircle size={18} color="#ef4444" /> <strong>You lost</strong></>}
                        <span className="ms-auto">
                            <Clock size={14} className="me-1" />
                            {formatStatsTime(lastGameRecord.durationSeconds)}
                        </span>
                    </GameSummary>
                )}
                {!hasData ? (
                    <EmptyState>
                        <Info size={32} />
                        <p>No stats available.<br />Play some games to see stats here!</p>
                    </EmptyState>
                ) : (
                    <Table striped hover size="sm" variant="dark">
                        <thead>
                            <tr>
                                <th>Level</th>
                                <th><TrendingUp size={14} className="me-1" />Win %</th>
                                <th><Clock size={14} className="me-1" />Avg Time</th>
                                <th>Games</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ALL_LEVELS.map(l => (
                                <tr key={l}>
                                    <td>{LEVEL_LABELS[l]}</td>
                                    <td>{winPercent(levelStats[l])}%</td>
                                    <td>{formatStatsTime(avgTimeSeconds(levelStats[l]))}</td>
                                    <td>{levelStats[l].gamesPlayed}</td>
                                </tr>
                            ))}
                            <tr className="fw-bold">
                                <td>Total</td>
                                <td>{winPercent(totalStats)}%</td>
                                <td>{formatStatsTime(totalStats.totalSeconds)}</td>
                                <td>{totalStats.gamesPlayed}</td>
                            </tr>
                        </tbody>
                    </Table>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default StatsModal;

