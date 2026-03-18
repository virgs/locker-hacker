import * as React from "react";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import {Award, Clock, Info, BarChart2, Hash, GitCommit, Zap} from "react-feather";
import {BuildLabel, EmptyState, SummaryText} from "./StatsModal.styled.tsx";
import {LEVEL_LABELS, LEVEL_LABELS_SHORT, ALL_LEVELS} from "../game/GameConfig.ts";
import {
    clearRecords,
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
import { useGameContext } from "../context/GameContext.tsx";
import { BUILD_LABEL } from "../meta/buildInfo.ts";
import {
    buildStatsSummaryParts,
    BUILD_LABEL_RESET_TAP_TARGET,
    BUILD_LABEL_RESET_WINDOW_MS,
    shouldClearStatsFromBuildTaps,
} from "./StatsModal.utils.ts";

interface StatsModalProps {
    show: boolean;
    onClose: () => void;
}

const StatsModal: React.FunctionComponent<StatsModalProps> = ({
                                                                  show,
                                                                  onClose,
                                                              }): React.ReactElement => {
    const { activeStatsRecordId } = useGameContext();
    const [, rerender] = React.useReducer((value: number) => value + 1, 0);
    const resetTapCountRef = React.useRef(0);
    const resetTapTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const records = show ? filterVisibleStatsRecords(loadRecords(), activeStatsRecordId) : [];
    const levelStats = computeLevelStats(records);
    const totalStats = computeTotalStats(records);
    const hasData = records.length > 0;
    const isMobile = useMediaQuery(BREAKPOINT_QUERIES.mobile);
    const labels = isMobile ? LEVEL_LABELS_SHORT : LEVEL_LABELS;
    const summary = buildStatsSummaryParts(totalStats);

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
        if (show) return;
        resetBuildTapSequence();
    }, [resetBuildTapSequence, show]);

    React.useEffect(() => () => resetBuildTapSequence(), [resetBuildTapSequence]);

    return (
        <Modal show={show} onHide={onClose} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Games Stats</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {!hasData ? (
                    <>
                        <EmptyState>
                            <Info size={32}/>
                            <p>No stats available.<br/>Play some games to see stats here!</p>
                        </EmptyState>
                        <BuildLabel onClick={onBuildLabelClick}>{BUILD_LABEL}</BuildLabel>
                    </>
                ) : (
                    <>
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
                            </tbody>
                        </Table>
                        <SummaryText>
                            Across <strong>{summary.games}</strong>, you won <strong>{summary.wins}</strong>, abandoned <strong>{summary.abandoned}</strong>, and spent <strong>{summary.playTime}</strong> playing.<br/> Your overall win rate is <strong>{summary.winRate}</strong>.
                        </SummaryText>
                        <BuildLabel onClick={onBuildLabelClick}>{BUILD_LABEL}</BuildLabel>
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default StatsModal;
