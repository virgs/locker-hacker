import * as React from "react";
import Table from "react-bootstrap/Table";
import {Award, Clock, Info, BarChart2, Hash, GitCommit, Zap} from "react-feather";
import {EmptyState, SummaryText} from "./StatsModal.styled.tsx";
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
import { useGameContext } from "../context/GameContext.tsx";
import { buildStatsSummaryParts } from "./StatsModal.utils.ts";

export const StatsPanel: React.FunctionComponent = (): React.ReactElement => {
    const { activeStatsRecordId } = useGameContext();
    const records = filterVisibleStatsRecords(loadRecords(), activeStatsRecordId);
    const levelStats = computeLevelStats(records);
    const totalStats = computeTotalStats(records);
    const hasData = records.length > 0;
    const isMobile = useMediaQuery(BREAKPOINT_QUERIES.mobile);
    const labels = isMobile ? LEVEL_LABELS_SHORT : LEVEL_LABELS;
    const summary = buildStatsSummaryParts(totalStats);

    return (
        !hasData ? (
            <EmptyState>
                <Info size={32}/>
                <p>No stats available.<br/>Play some games to see stats here!</p>
            </EmptyState>
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
                    Your record so far: <strong>{summary.wins}</strong> successful hacks out of <strong>{summary.games}</strong>,
                    with <strong>{summary.abandoned}</strong> failed attempts and <strong>{summary.playTime}</strong> spent on the grid.<br/>
                    That puts your win rate at <strong>{summary.winRate}</strong>.
                </SummaryText>
            </>
        )
    );
};

export default StatsPanel;
