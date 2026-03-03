import * as React from "react";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import {Award, Clock, Info, BarChart2, Hash, GitCommit} from "react-feather";
import {EmptyState} from "./StatsModal.styled.tsx";
import {LEVEL_LABELS, ALL_LEVELS} from "../game/GameConfig.ts";
import {
    loadRecords,
    computeLevelStats,
    computeTotalStats,
    winPercent,
    avgTimeSeconds,
    avgMoves,
    formatStatsTime,
} from "../game/StatsService.ts";

interface StatsModalProps {
    show: boolean;
    onClose: () => void;
}

const StatsModal: React.FunctionComponent<StatsModalProps> = ({
                                                                  show,
                                                                  onClose,
                                                              }): React.ReactElement => {
    const records = show ? loadRecords() : [];
    const levelStats = computeLevelStats(records);
    const totalStats = computeTotalStats(records);
    const hasData = records.length > 0;

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Game Stats</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {!hasData ? (
                    <EmptyState>
                        <Info size={32}/>
                        <p>No stats available.<br/>Play some games to see stats here!</p>
                    </EmptyState>
                ) : (
                    <Table striped hover size="sm">
                        <thead>
                        <tr>
                            <th className="text-end"><BarChart2 size={14} className="me-1"/>Level</th>
                            <th className="text-end"><Hash size={14} className="me-1"/>Games</th>
                            <th className="text-end"><Award size={14} className="me-1"/>Win %</th>
                            <th className="text-end"><Clock size={14} className="me-1"/>Time avg.</th>
                            <th className="text-end"><GitCommit size={14} className="me-1"/>Moves</th>
                        </tr>
                        </thead>
                        <tbody>
                        {ALL_LEVELS.map(l => (
                            <tr key={l}>
                                <td>{LEVEL_LABELS[l]}</td>
                                <td className="text-end">{levelStats[l].gamesPlayed}</td>
                                <td className="text-end">{winPercent(levelStats[l])}%</td>
                                <td className="text-end">{formatStatsTime(avgTimeSeconds(levelStats[l]))}</td>
                                <td className="text-end">{avgMoves(levelStats[l])}</td>
                            </tr>
                        ))}
                        <tr className="fw-bold">
                            <td className="text-start">Total</td>
                            <td className="text-end">{totalStats.gamesPlayed}</td>
                            <td className="text-end">{winPercent(totalStats)}%</td>
                            <td className="text-end">{formatStatsTime(totalStats.totalSeconds)}</td>
                            <td className="text-end">-</td>
                        </tr>
                        </tbody>
                    </Table>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default StatsModal;

