import * as React from "react";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import {Award, Clock, Info, BarChart2, Hash, GitCommit, Zap} from "react-feather";
import {EmptyState} from "./StatsModal.styled.tsx";
import {LEVEL_LABELS, LEVEL_LABELS_SHORT, ALL_LEVELS} from "../game/GameConfig.ts";
import {
    loadRecords,
    filterVisibleStatsRecords,
    computeLevelStats,
    computeTotalStats,
    avgTimeSeconds,
    avgMoves,
    avgHints,
    formatStatsTime,
} from "../game/StatsService.ts";
import useMediaQuery from "./useMediaQuery.ts";
import {BREAKPOINT_QUERIES} from "../theme/breakpoints.ts";
import {IS_CAPACITOR} from "../platform.ts";
import {showBannerAd, hideBannerAd} from "../ads/AdService.ts";
import { useGameContext } from "../context/GameContext.tsx";

interface StatsModalProps {
    show: boolean;
    onClose: () => void;
}

const StatsModal: React.FunctionComponent<StatsModalProps> = ({
                                                                  show,
                                                                  onClose,
                                                              }): React.ReactElement => {
    const { activeStatsRecordId } = useGameContext();
    const records = show ? filterVisibleStatsRecords(loadRecords(), activeStatsRecordId) : [];
    const levelStats = computeLevelStats(records);
    const totalStats = computeTotalStats(records);
    const hasData = records.length > 0;
    const isMobile = useMediaQuery(BREAKPOINT_QUERIES.mobile);
    const labels = isMobile ? LEVEL_LABELS_SHORT : LEVEL_LABELS;

    React.useEffect(() => {
        if (!IS_CAPACITOR) return;
        if (show) { showBannerAd(); } else { hideBannerAd(); }
        return () => { hideBannerAd(); };
    }, [show]);

    return (
        <Modal show={show} onHide={onClose} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Games Stats</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {!hasData ? (
                    <EmptyState>
                        <Info size={32}/>
                        <p>No stats available.<br/>Play some games to see stats here!</p>
                    </EmptyState>
                ) : (
                    <Table hover>
                        <thead>
                        <tr>
                            <th className="text-end"><BarChart2 size={14} className="me-1"/>{!isMobile && "Level"}</th>
                            <th className="text-end"><Hash size={14} className="me-1"/>{!isMobile && "Games"}</th>
                            <th className="text-end"><Award size={14} className="me-1"/>{!isMobile && "Wins"}</th>
                            <th className="text-end"><Clock size={14} className="me-1"/>{!isMobile && "Time avg"}</th>
                            <th className="text-end"><GitCommit size={14} className="me-1"/>{!isMobile && "Moves avg"}</th>
                            <th className="text-end"><Zap size={14} className="me-1"/>{!isMobile && "Hints avg"}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {ALL_LEVELS.map(l => (
                            <tr key={l}>
                                <td className="fw-bolder">{labels[l]}</td>
                                <td className="text-end">{levelStats[l].gamesPlayed}</td>
                                <td className="text-end">{levelStats[l].wins}</td>
                                <td className="text-end">{formatStatsTime(avgTimeSeconds(levelStats[l]))}</td>
                                <td className="text-end">{avgMoves(levelStats[l]).toFixed(1)}</td>
                                <td className="text-end">{avgHints(levelStats[l]).toFixed(1)}</td>
                            </tr>
                        ))}
                        <tr className="fw-bold">
                            <td className="text-start fw-bolder">Total</td>
                            <td className="text-end">{totalStats.gamesPlayed}</td>
                            <td className="text-end">{totalStats.wins}</td>
                            <td className="text-end">{formatStatsTime(totalStats.totalSeconds)}</td>
                            <td className="text-end">-</td>
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
